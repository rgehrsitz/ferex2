use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqlitePool, Row};
use std::fs;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct SavedScenario {
    pub id: String,
    pub name: String,
    pub data: String, // JSON serialized scenario data
    pub created_at: String,
    pub updated_at: String,
}

pub async fn init_database(app_handle: &AppHandle) -> Result<SqlitePool, Box<dyn std::error::Error>> {
    let app_dir = app_handle
        .path_resolver()
        .app_local_data_dir()
        .expect("failed to resolve app data directory");
    
    // Create the directory if it doesn't exist
    fs::create_dir_all(&app_dir)?;
    
    let database_path = app_dir.join("ferex.db");
    let database_url = format!("sqlite:{}", database_path.display());
    
    let pool = SqlitePool::connect(&database_url).await?;
    
    // Create scenarios table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS scenarios (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        "#,
    )
    .execute(&pool)
    .await?;
    
    Ok(pool)
}

#[tauri::command]
pub async fn save_scenario(
    pool: tauri::State<'_, SqlitePool>,
    scenario: SavedScenario,
) -> Result<(), String> {
    sqlx::query(
        r#"
        INSERT OR REPLACE INTO scenarios (id, name, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        "#,
    )
    .bind(&scenario.id)
    .bind(&scenario.name)
    .bind(&scenario.data)
    .bind(&scenario.created_at)
    .bind(&scenario.updated_at)
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn load_scenarios(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<SavedScenario>, String> {
    let rows = sqlx::query("SELECT * FROM scenarios ORDER BY updated_at DESC")
        .fetch_all(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    
    let scenarios = rows
        .into_iter()
        .map(|row| SavedScenario {
            id: row.get("id"),
            name: row.get("name"),
            data: row.get("data"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
        .collect();
    
    Ok(scenarios)
}

#[tauri::command]
pub async fn delete_scenario(
    pool: tauri::State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM scenarios WHERE id = ?")
        .bind(&id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(())
}