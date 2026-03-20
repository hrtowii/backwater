mod commands;
mod error;
mod models;
mod state;
use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

use crate::commands::{
    create_channel, create_message, create_thread, delete_channel, delete_message, delete_thread,
    get_settings, healthcheck, list_channels, list_messages, list_pinned, list_threads,
    pin_message, read_media_file, save_media_file, search_messages, unpin_message,
    update_message, update_settings,
};
use crate::state::AppState;
use std::fs;
use tauri::{AppHandle, Manager};

fn init_app_state(app: &AppHandle) -> Result<AppState, String> {
    let mut data_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("failed to resolve app data directory: {e}"))?;

    fs::create_dir_all(&data_dir).map_err(|e| format!("failed to create data directory: {e}"))?;

    data_dir.push("backwater.db");

    tauri::async_runtime::block_on(AppState::new(data_dir)).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("backwater")
                .inner_size(800.0, 600.0);

            // set transparent title bar only when building for macOS
            #[cfg(target_os = "macos")]
            let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);
            win_builder.build().unwrap();
            let state = init_app_state(app.handle())?;
            app.manage(state);
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            healthcheck,
            create_channel,
            list_channels,
            delete_channel,
            create_message,
            list_messages,
            update_message,
            delete_message,
            pin_message,
            unpin_message,
            list_pinned,
            search_messages,
            get_settings,
            update_settings,
            save_media_file,
            read_media_file,
            create_thread,
            list_threads,
            delete_thread
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
