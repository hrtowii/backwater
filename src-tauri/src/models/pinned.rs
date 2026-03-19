use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct PinnedMessage {
    pub message_id: i64,
    pub channel_id: i64,
    pub pinned_at_ms: i64,
}

#[derive(Debug, Deserialize)]
pub struct PinMessageParams {
    pub message_id: i64,
    pub channel_id: i64,
}
