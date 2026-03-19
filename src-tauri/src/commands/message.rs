use crate::models::{
    CreateMessage, ListMessagesParams, Message, SearchMessagesParams, UpdateMessage,
};
use crate::state::AppState;
use fuzzy_matcher::FuzzyMatcher;
use fuzzy_matcher::skim::SkimMatcherV2;
use tauri::State;

use super::utils::{now_ms, validate_content};

#[tauri::command]
pub async fn create_message(state: State<'_, AppState>, input: CreateMessage) -> Result<Message, String> {
    validate_content(&input.content).map_err(|e: crate::error::AppError| e.to_string())?;

    let timestamp = now_ms().map_err(|e: crate::error::AppError| e.to_string())?;
    let id = timestamp;

    sqlx::query(
        "INSERT INTO messages (id, channel_id, content, media_url, created_at_ms, updated_at_ms) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(id)
    .bind(input.channel_id)
    .bind(input.content)
    .bind(input.media_url)
    .bind(timestamp)
    .bind(timestamp)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let message = sqlx::query_as::<_, Message>(
        "SELECT id, channel_id, content, media_url, created_at_ms, updated_at_ms FROM messages WHERE id = ?",
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(message)
}

#[tauri::command]
pub async fn list_messages(
    state: State<'_, AppState>,
    input: ListMessagesParams,
) -> Result<Vec<Message>, String> {
    let from_ms = input.from_ms.unwrap_or(0);
    let to_ms = input.to_ms.unwrap_or(i64::MAX);

    sqlx::query_as::<_, Message>(
        "SELECT id, channel_id, content, media_url, created_at_ms, updated_at_ms FROM messages WHERE channel_id = ? AND created_at_ms >= ? AND created_at_ms <= ? ORDER BY created_at_ms DESC",
    )
    .bind(input.channel_id)
    .bind(from_ms)
    .bind(to_ms)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_message(
    state: State<'_, AppState>,
    input: UpdateMessage,
) -> Result<Message, String> {
    validate_content(&input.content).map_err(|e: crate::error::AppError| e.to_string())?;
    let updated_at_ms = now_ms().map_err(|e: crate::error::AppError| e.to_string())?;

    sqlx::query("UPDATE messages SET content = ?, media_url = ?, updated_at_ms = ? WHERE id = ?")
        .bind(input.content)
        .bind(input.media_url)
        .bind(updated_at_ms)
        .bind(input.id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;

    let message = sqlx::query_as::<_, Message>(
        "SELECT id, channel_id, content, media_url, created_at_ms, updated_at_ms FROM messages WHERE id = ?",
    )
    .bind(input.id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(message)
}

#[tauri::command]
pub async fn delete_message(state: State<'_, AppState>, message_id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM messages WHERE id = ?")
        .bind(message_id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn search_messages(
    state: State<'_, AppState>,
    input: SearchMessagesParams,
) -> Result<Vec<Message>, String> {
    let from_ms = input.from_ms.unwrap_or(0);
    let to_ms = input.to_ms.unwrap_or(i64::MAX);
    let query = input.query.trim();

    // If query is empty, return all messages in date range
    if query.is_empty() {
        return sqlx::query_as::<_, Message>(
            "SELECT id, channel_id, content, media_url, created_at_ms, updated_at_ms 
             FROM messages 
             WHERE channel_id = ? 
               AND created_at_ms >= ? 
               AND created_at_ms <= ? 
             ORDER BY created_at_ms DESC",
        )
        .bind(input.channel_id)
        .bind(from_ms)
        .bind(to_ms)
        .fetch_all(&state.pool)
        .await
        .map_err(|e| e.to_string());
    }

    // Fetch all messages in the date range for the channel
    let all_messages = sqlx::query_as::<_, Message>(
        "SELECT id, channel_id, content, media_url, created_at_ms, updated_at_ms 
         FROM messages 
         WHERE channel_id = ? 
           AND created_at_ms >= ? 
           AND created_at_ms <= ? 
         ORDER BY created_at_ms DESC",
    )
    .bind(input.channel_id)
    .bind(from_ms)
    .bind(to_ms)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    // Apply fuzzy matching with SkimMatcherV2 (moderate strictness)
    let matcher = SkimMatcherV2::default();
    let mut scored_messages: Vec<(Message, i64)> = all_messages
        .into_iter()
        .filter_map(|msg| {
            // Try to match the query against the message content
            matcher
                .fuzzy_match(&msg.content.to_lowercase(), &query.to_lowercase())
                .map(|score| (msg, score))
        })
        .collect();

    // Sort by fuzzy match score (highest first), then by created_at_ms (newest first)
    scored_messages.sort_by(|a, b| {
        b.1.cmp(&a.1)
            .then_with(|| b.0.created_at_ms.cmp(&a.0.created_at_ms))
    });

    // Return only the messages (without scores)
    Ok(scored_messages.into_iter().map(|(msg, _)| msg).collect())
}
