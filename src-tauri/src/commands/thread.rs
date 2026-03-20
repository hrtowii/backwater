use crate::models::{CreateThread, Thread};
use crate::state::AppState;
use tauri::State;

use super::utils::now_ms;

#[tauri::command]
pub async fn create_thread(state: State<'_, AppState>, input: CreateThread) -> Result<Thread, String> {
    let name = input.name.trim();
    if name.is_empty() {
        return Err("thread name cannot be empty".to_string());
    }

    let created_at_ms = now_ms().map_err(|e: crate::error::AppError| e.to_string())?;

    let result = sqlx::query(
        "INSERT INTO threads (channel_id, name, created_at_ms) VALUES (?, ?, ?)",
    )
    .bind(input.channel_id)
    .bind(name)
    .bind(created_at_ms)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let id = result.last_insert_rowid();

    let thread = sqlx::query_as::<_, Thread>(
        "SELECT id, channel_id, name, created_at_ms FROM threads WHERE id = ?",
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(thread)
}

#[tauri::command]
pub async fn list_threads(state: State<'_, AppState>, channel_id: i64) -> Result<Vec<Thread>, String> {
    sqlx::query_as::<_, Thread>(
        "SELECT id, channel_id, name, created_at_ms FROM threads WHERE channel_id = ? ORDER BY created_at_ms ASC",
    )
    .bind(channel_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_thread(state: State<'_, AppState>, thread_id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM threads WHERE id = ?")
        .bind(thread_id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
