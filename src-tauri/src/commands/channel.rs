use crate::models::{Channel, CreateChannel};
use crate::state::AppState;
use tauri::State;

use super::utils::now_ms;

#[tauri::command]
pub async fn create_channel(state: State<'_, AppState>, input: CreateChannel) -> Result<Channel, String> {
    let name = input.name.trim();
    if name.is_empty() {
        return Err("channel name cannot be empty".to_string());
    }

    let created_at_ms = now_ms().map_err(|e: crate::error::AppError| e.to_string())?;

    let result = sqlx::query("INSERT INTO channels (name, created_at_ms) VALUES (?, ?)")
        .bind(name)
        .bind(created_at_ms)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;

    let id = result.last_insert_rowid();

    let channel = sqlx::query_as::<_, Channel>(
        "SELECT id, name, created_at_ms FROM channels WHERE id = ?",
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(channel)
}

#[tauri::command]
pub async fn list_channels(state: State<'_, AppState>) -> Result<Vec<Channel>, String> {
    sqlx::query_as::<_, Channel>(
        "SELECT id, name, created_at_ms FROM channels ORDER BY created_at_ms DESC",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_channel(state: State<'_, AppState>, channel_id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM channels WHERE id = ?")
        .bind(channel_id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
