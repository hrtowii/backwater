use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct Channel {
    pub id: i64,
    pub name: String,
    pub created_at_ms: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreateChannel {
    pub name: String,
}
