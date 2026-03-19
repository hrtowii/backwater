use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct Message {
    pub id: i64,
    pub channel_id: i64,
    pub content: String,
    pub media_url: Option<String>,
    pub created_at_ms: i64,
    pub updated_at_ms: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreateMessage {
    pub channel_id: i64,
    pub content: String,
    pub media_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMessage {
    pub id: i64,
    pub content: String,
    pub media_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListMessagesParams {
    pub channel_id: i64,
    pub from_ms: Option<i64>,
    pub to_ms: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct SearchMessagesParams {
    pub channel_id: i64,
    pub query: String,
    pub from_ms: Option<i64>,
    pub to_ms: Option<i64>,
}
