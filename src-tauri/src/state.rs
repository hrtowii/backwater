use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::path::PathBuf;
use std::str::FromStr;

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
}

impl AppState {
    pub async fn new(db_file_path: PathBuf) -> Result<Self, sqlx::Error> {
        let options = SqliteConnectOptions::from_str(&format!(
            "sqlite://{}",
            db_file_path.to_string_lossy()
        ))?
        .create_if_missing(true)
        .foreign_keys(true);

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect_with(options)
            .await?;

        sqlx::migrate!("./migrations").run(&pool).await?;

        Ok(Self { pool })
    }
}
