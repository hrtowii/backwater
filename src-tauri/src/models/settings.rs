use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Settings {
    pub id: i64,
    pub theme_preset: String,
    pub custom_colors: Option<String>,
    pub updated_at: i64,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSettingsParams {
    pub theme_preset: String,
    pub custom_colors: Option<serde_json::Value>,
}
