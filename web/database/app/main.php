<?php


$db = new PDO('sqlite:/var/www/app/data/database.sqlite');


$db->exec("DROP TABLE IF EXISTS user");
$db->exec("CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    mail TEXT NOT NULL UNIQUE,
    psw TEXT NOT NULL,
    token TEXT,
    wallet TEXT UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE, 
    google_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)");
/*
$db->exec("DROP TABLE IF EXISTS friends");
$db->exec("CREATE TABLE friends (
    user_id_1 INTEGER NOT NULL,
    user_id_2 INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id_1, user_id_2),
    FOREIGN KEY (user_id_1) REFERENCES user(id),
    FOREIGN KEY (user_id_2) REFERENCES user(id),
    CHECK (user_id_1 < user_id_2)
)");
*/

$db->exec("DROP TABLE IF EXISTS tournament");
$db->exec("CREATE TABLE tournament (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_name TEXT,
    started BOOLEAN DEFAULT FALSE,
    finished BOOLEAN DEFAULT FALSE
)");

$db->exec("DROP TABLE IF EXISTS game_match");
$db->exec("CREATE TABLE game_match (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_tournament INTEGER, 
    time_stamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    number_of_players INTEGER,
    FOREIGN KEY (id_tournament) REFERENCES tournament(id)
)");
//non è obbligatorio che id_torunament ci sia, dipende se il game fa parte di un tournament o no

$db->exec("DROP TABLE IF EXISTS player_match_stats");
$db->exec("CREATE TABLE player_match_stats(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER,
    id_match INTEGER,
    goal_scored INTEGER DEFAULT 0,
    goal_taken INTEGER DEFAULT 0,
    FOREIGN KEY (id_user) REFERENCES user(id),
    FOREIGN KEY (id_match) REFERENCES game_match(id)
)");

$db->exec("DROP TABLE IF EXISTS player_all_time_stats");
$db->exec("CREATE TABLE player_all_time_stats(
    id_player PRIMARY KEY,
    goal_scored INTEGER DEFAULT 0,
    goal_taken INTEGER DEFAULT 0,
    tournament_won INTGER DEFAULT 0,
    FOREIGN KEY (id_player) REFERENCES user(id)
)");



//DA QUA IN POI E' PURO TESTING
//TODO AGGIUNGERE FUNZIONI PIU COMODE CHE AGGIUNGANO AL DB MA DA CAPIRE DOVE
$db->exec("INSERT INTO user (username, mail, psw) VALUES ('Mario_Bro', 'marione@marione.com', 'xxxxxxx')");
$db->exec("INSERT INTO user (username, mail, psw) VALUES ('Luigi_Bro', 'luigi@marione.com', 'xxxxxxx')");
$db->exec("INSERT INTO game_match (number_of_players) VALUES (2)");
$db->exec("INSERT INTO player_match_stats (id_user, id_match, goal_scored, goal_taken) VALUES (1, 1, 3, 1)");
$db->exec("INSERT INTO player_match_stats (id_user, id_match, goal_scored, goal_taken) VALUES (2, 1, 1, 3)");
//$db->exec("INSERT INTO friends (user_id_1, user_id_2) VALUES (2, 1)");


foreach ($db->query('SELECT * FROM user') as $row) {
    echo "User ID {$row['id']}: {$row['username']}, Mail: {$row['mail']}" . PHP_EOL;
}

echo PHP_EOL;
/*
foreach ($db->query('SELECT user_id_2 FROM friends WHERE user_id_1 = 1 UNION SELECT user_id_1 FROM friends WHERE user_id_2 = 1') as $row)
{
    echo "USER FRIEND ID = {$row['friend_id']}\n";
}
echo PHP_EOL;
*/

foreach ($db->query('SELECT * FROM game_match') as $match) {
    echo "Match ID {$match['id']} - Number of Players: {$match['number_of_players']}" . PHP_EOL;

    $stmt = $db->prepare('SELECT * FROM player_match_stats WHERE id_match = ?');
    $stmt->execute([$match['id']]);
    $playerStats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($playerStats as $ps) {
        echo "  Player Stats ID {$ps['id']} - User ID: {$ps['id_user']}, Goals Scored: {$ps['goal_scored']}, Goals Taken: {$ps['goal_taken']}" . PHP_EOL;
    }

    echo PHP_EOL;
}

echo PHP_EOL;


?>
