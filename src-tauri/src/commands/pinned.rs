use crate::models::{PinMessageParams, PinnedMessage};
use crate::state::AppState;
use tauri::State;

use super::utils::now_ms;

#[tauri::command]
pub async fn pin_message(state: State<'_, AppState>, input: PinMessageParams) -> Result<PinnedMessage, String> {
    let pinned_at_ms = now_ms().map_err(|e: crate::error::AppError| e.to_string())?;

    sqlx::query(
        "INSERT OR REPLACE INTO pinned (message_id, channel_id, pinned_at_ms) VALUES (?, ?, ?)",
    )
    .bind(input.message_id)
    .bind(input.channel_id)
    .bind(pinned_at_ms)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let pinned = sqlx::query_as::<_, PinnedMessage>(
        "SELECT message_id, channel_id, pinned_at_ms FROM pinned WHERE message_id = ? AND channel_id = ?",
    )
    .bind(input.message_id)
    .bind(input.channel_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(pinned)
}

#[tauri::command]
pub async fn unpin_message(state: State<'_, AppState>, input: PinMessageParams) -> Result<(), String> {
    sqlx::query("DELETE FROM pinned WHERE message_id = ? AND channel_id = ?")
        .bind(input.message_id)
        .bind(input.channel_id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn list_pinned(state: State<'_, AppState>, channel_id: i64) -> Result<Vec<PinnedMessage>, String> {
    sqlx::query_as::<_, PinnedMessage>(
        "SELECT message_id, channel_id, pinned_at_ms FROM pinned WHERE channel_id = ? ORDER BY pinned_at_ms DESC",
    )
    .bind(channel_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())
}
