use crate::models::{Settings, UpdateSettingsParams};
use crate::state::AppState;
use tauri::State;

use super::utils::now_ms;

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<Settings, String> {
    sqlx::query_as::<_, Settings>(
        "SELECT id, theme_preset, custom_colors, updated_at FROM settings WHERE id = 1",
    )
    .fetch_one(&state.pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, AppState>,
    input: UpdateSettingsParams,
) -> Result<Settings, String> {
    let updated_at = now_ms().map_err(|e: crate::error::AppError| e.to_string())?;
    
    let custom_colors_json = input
        .custom_colors
        .as_ref()
        .and_then(|colors| serde_json::to_string(colors).ok());

    sqlx::query(
        "UPDATE settings SET theme_preset = ?, custom_colors = ?, updated_at = ? WHERE id = 1",
    )
    .bind(&input.theme_preset)
    .bind(custom_colors_json)
    .bind(updated_at)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    get_settings(state).await
}
