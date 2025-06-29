// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;

use database::{init_database, save_scenario, load_scenarios, delete_scenario};
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn calculate_fers_pension(
    service_years: f64,
    high_three: f64,
    age_at_retirement: u32,
) -> Result<f64, String> {
    // FERS pension calculation
    let multiplier = if age_at_retirement >= 62 && service_years >= 20.0 {
        0.011 // 1.1% for age 62+ with 20+ years
    } else {
        0.01 // 1.0% standard multiplier
    };
    Ok(high_three * service_years * multiplier)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                match init_database(&app_handle).await {
                    Ok(pool) => {
                        app_handle.manage(pool);
                        println!("Database initialized successfully");
                    }
                    Err(e) => {
                        eprintln!("Failed to initialize database: {}", e);
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet, 
            calculate_fers_pension, 
            save_scenario, 
            load_scenarios, 
            delete_scenario
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}