<?php


$db = new PDO('sqlite:/var/www/app/data/database.sqlite');


//$db->exec("DROP TABLE IF EXISTS user");
$db->exec("CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    mail TEXT NOT NULL UNIQUE,
    psw TEXT NOT NULL,
    token TEXT,
    wallet TEXT UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE, 
    google_id TEXT,
    avatar BLOB,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)");

//$db->exec("DROP TABLE IF EXISTS tournament");
$db->exec("CREATE TABLE IF NOT EXISTS tournament (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_name TEXT,
    has_started BOOLEAN DEFAULT FALSE,
    finished BOOLEAN DEFAULT FALSE,
    id_winner INTEGER
)");

//$db->exec("DROP TABLE IF EXISTS game_match");
$db->exec("CREATE TABLE IF NOT EXISTS game_match (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_tournament INTEGER, 
    time_stamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    number_of_players INTEGER
)");

$db->exec("CREATE TABLE IF NOT EXISTS friendship (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user_1 INTEGER,
    id_user_2 INTEGER,
    FOREIGN KEY (id_user_1) REFERENCES user(id),
    FOREIGN KEY (id_user_2) REFERENCES user(id)
)");
//non è obbligatorio che id_torunament ci sia, dipende se il game fa parte di un tournament o no

//$db->exec("DROP TABLE IF EXISTS player_match_stats");
$db->exec("CREATE TABLE IF NOT EXISTS player_match_stats(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER,
    id_match INTEGER,
    goal_scored INTEGER DEFAULT 0,
    goal_taken INTEGER DEFAULT 0,
    FOREIGN KEY (id_user) REFERENCES user(id),
    FOREIGN KEY (id_match) REFERENCES game_match(id)
)");

//$db->exec("DROP TABLE IF EXISTS player_all_time_stats");
$db->exec("CREATE TABLE IF NOT EXISTS player_all_time_stats(
    id_player INTEGER PRIMARY KEY,
    goal_scored INTEGER DEFAULT 0,
    goal_taken INTEGER DEFAULT 0,
    tournament_won INTEGER DEFAULT 0,
    FOREIGN KEY (id_player) REFERENCES user(id)
)");
?>
