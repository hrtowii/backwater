use crate::error::AppError;
use std::time::{SystemTime, UNIX_EPOCH};

pub fn now_ms() -> Result<i64, AppError> {
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| AppError(format!("clock error: {e}")))?;
    Ok(duration.as_millis() as i64)
}

pub fn validate_content(content: &str) -> Result<(), AppError> {
    if content.is_empty() {
        return Err(AppError("content cannot be empty".to_string()));
    }

    if content.chars().count() > 10_000 {
        return Err(AppError("content exceeds 10,000 characters".to_string()));
    }

    Ok(())
}
