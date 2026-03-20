use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct Thread {
    pub id: i64,
    pub channel_id: i64,
    pub name: String,
    pub created_at_ms: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreateThread {
    pub channel_id: i64,
    pub name: String,
}
