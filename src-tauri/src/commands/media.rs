use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::{Manager, State, AppHandle};

use crate::state::AppState;

#[derive(Serialize)]
pub struct MediaFileData {
    data: Vec<u8>,
    mime_type: String,
}

#[tauri::command]
pub async fn save_media_file(
    app_handle: AppHandle,
    state: State<'_, AppState>,
    source_path: String,
) -> Result<String, String> {
    let source = PathBuf::from(&source_path);
    
    if !source.exists() {
        return Err(format!("Source file does not exist: {}", source_path));
    }

    let file_name = source
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or_else(|| "Invalid source file name".to_string())?;

    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Failed to get timestamp: {}", e))?
        .as_millis();

    let unique_filename = format!("{}_{}", timestamp, file_name);

    let mut media_dir = app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("failed to resolve app data directory: {e}"))?;

    media_dir.push("media");
    fs::create_dir_all(&media_dir)
        .map_err(|e| format!("failed to create media directory: {e}"))?;

    let destination = media_dir.join(&unique_filename);

    fs::copy(&source, &destination)
        .map_err(|e| format!("failed to copy file: {e}"))?;

    Ok(format!("media/{}", unique_filename))
}

fn get_mime_type(path: &PathBuf) -> String {
    let extension = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase());

    match extension.as_deref() {
        Some("jpg") | Some("jpeg") => "image/jpeg".to_string(),
        Some("png") => "image/png".to_string(),
        Some("gif") => "image/gif".to_string(),
        Some("webp") => "image/webp".to_string(),
        Some("svg") => "image/svg+xml".to_string(),
        Some("mp4") => "video/mp4".to_string(),
        Some("webm") => "video/webm".to_string(),
        Some("mov") => "video/quicktime".to_string(),
        Some("avi") => "video/x-msvideo".to_string(),
        Some("pdf") => "application/pdf".to_string(),
        Some("txt") => "text/plain".to_string(),
        _ => "application/octet-stream".to_string(),
    }
}

#[tauri::command]
pub async fn read_media_file(
    app_handle: AppHandle,
    state: State<'_, AppState>,
    relative_path: String,
) -> Result<MediaFileData, String> {
    let mut media_dir = app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("failed to resolve app data directory: {e}"))?;

    media_dir.push(&relative_path);

    if !media_dir.exists() {
        return Err(format!("Media file does not exist: {}", relative_path));
    }

    let mime_type = get_mime_type(&media_dir);
    
    let data = fs::read(&media_dir)
        .map_err(|e| format!("failed to read media file: {e}"))?;

    Ok(MediaFileData { data, mime_type })
}
