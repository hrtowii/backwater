use crate::state::AppState;
use sqlx::Row;
use tauri::State;

#[tauri::command]
pub async fn healthcheck(state: State<'_, AppState>) -> Result<String, String> {
    let row = sqlx::query("SELECT COUNT(*) AS count FROM channels")
        .fetch_one(&state.pool)
        .await
        .map_err(|e| e.to_string())?;

    let count: i64 = row.get("count");
    Ok(format!("ok ({count} channels)"))
}
