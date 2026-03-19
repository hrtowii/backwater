use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub struct AppError(pub String);

impl Display for AppError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<sqlx::Error> for AppError {
    fn from(value: sqlx::Error) -> Self {
        Self(format!("database error: {value}"))
    }
}

impl From<String> for AppError {
    fn from(value: String) -> Self {
        Self(value)
    }
}
