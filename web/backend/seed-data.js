import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

const { verbose } = sqlite3;
const db = new (verbose()).Database('./data/database.sqlite');

// Helper to generate random integers
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Sample data for generating realistic usernames
const adjectives = ['Swift', 'Dark', 'Bright', 'Silent', 'Thunder', 'Shadow', 'Golden', 'Iron', 'Crystal', 'Mystic', 'Phantom', 'Cosmic', 'Epic', 'Legendary', 'Ultimate', 'Prime', 'Elite', 'Supreme', 'Mighty', 'Bold'];
const nouns = ['Warrior', 'Knight', 'Dragon', 'Phoenix', 'Tiger', 'Wolf', 'Eagle', 'Falcon', 'Bear', 'Lion', 'Hawk', 'Viper', 'Panther', 'Raider', 'Hunter', 'Champion', 'Master', 'Legend', 'Hero', 'Ninja'];

// Generate random username
function generateUsername(index) {
  if (index < 40) {
    return `${adjectives[randomInt(0, adjectives.length - 1)]}${nouns[randomInt(0, nouns.length - 1)]}${index}`;
  } else {
    return `user${index}_${Math.random().toString(36).substring(7)}`;
  }
}

// Promisify database operations
const dbRun = (query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const dbGet = (query, params) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');

    // Enable foreign keys
    await dbRun("PRAGMA foreign_keys = ON", []);

    // Step 1: Create 100 users
    console.log('Creating 100 users...');
    const userIds = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (let i = 1; i <= 100; i++) {
      const username = generateUsername(i);
      const email = `user${i}@example.com`;
      
      try {
        const userId = await dbRun(
          `INSERT INTO user (username, mail, psw, is_admin) VALUES (?, ?, ?, ?)`,
          [username, email, hashedPassword, 0]
        );
        
        // Create player_all_time_stats for each user
        await dbRun(
          `INSERT INTO player_all_time_stats (id_player, goal_scored, goal_taken, tournament_won) VALUES (?, ?, ?, ?)`,
          [userId, 0, 0, 0]
        );
        
        userIds.push(userId);
      } catch (err) {
        console.log(`User ${username} might already exist, skipping...`);
      }
    }
    console.log(`✓ Created ${userIds.length} users\n`);

    // Step 2: Create tournaments
    console.log('Creating tournaments...');
    const tournaments = [
      { name: 'Spring Championship 2026', finished: 1 },
      { name: 'Summer Grand Prix 2026', finished: 1 },
      { name: 'Fall Masters 2026', finished: 1 },
      { name: 'Winter Cup 2026', finished: 0 },
      { name: 'New Year Tournament 2026', finished: 1 }
    ];

    const tournamentIds = [];
    for (const tournament of tournaments) {
      const tournamentId = await dbRun(
        `INSERT INTO tournament (tournament_name, has_started, finished) VALUES (?, ?, ?)`,
        [tournament.name, 1, tournament.finished]
      );
      tournamentIds.push({ id: tournamentId, finished: tournament.finished });
    }
    console.log(`✓ Created ${tournamentIds.length} tournaments\n`);

    // Step 3: Create matches and player stats
    console.log('Creating matches and player stats...');
    let totalMatches = 0;

    for (const tournament of tournamentIds) {
      // Create 8-16 matches per tournament
      const numMatches = randomInt(8, 16);
      
      for (let i = 0; i < numMatches; i++) {
        const numPlayers = randomInt(2, 4); // 2-4 players per match
        
        // Create match
        const matchId = await dbRun(
          `INSERT INTO game_match (id_tournament, number_of_players) VALUES (?, ?)`,
          [tournament.id, numPlayers]
        );

        // Select random players for this match
        const shuffled = [...userIds].sort(() => 0.5 - Math.random());
        const selectedPlayers = shuffled.slice(0, numPlayers);

        // Create player match stats
        const playerStats = [];
        for (const playerId of selectedPlayers) {
          const goalsScored = randomInt(0, 10);
          const goalsTaken = randomInt(0, 10);
          
          await dbRun(
            `INSERT INTO player_match_stats (id_user, id_match, goal_scored, goal_taken) VALUES (?, ?, ?, ?)`,
            [playerId, matchId, goalsScored, goalsTaken]
          );

          playerStats.push({ playerId, goalsScored, goalsTaken });
        }

        // Update all-time stats for players in this match
        for (const stat of playerStats) {
          const currentStats = await dbGet(
            `SELECT goal_scored, goal_taken FROM player_all_time_stats WHERE id_player = ?`,
            [stat.playerId]
          );

          if (currentStats) {
            await dbRun(
              `UPDATE player_all_time_stats SET goal_scored = ?, goal_taken = ? WHERE id_player = ?`,
              [
                currentStats.goal_scored + stat.goalsScored,
                currentStats.goal_taken + stat.goalsTaken,
                stat.playerId
              ]
            );
          }
        }

        totalMatches++;
      }

      // Set tournament winner if finished
      if (tournament.finished === 1) {
        const randomWinner = userIds[randomInt(0, userIds.length - 1)];
        await dbRun(
          `UPDATE tournament SET id_winner = ? WHERE id = ?`,
          [randomWinner, tournament.id]
        );

        // Update winner's tournament count
        const winnerStats = await dbGet(
          `SELECT tournament_won FROM player_all_time_stats WHERE id_player = ?`,
          [randomWinner]
        );

        if (winnerStats) {
          await dbRun(
            `UPDATE player_all_time_stats SET tournament_won = ? WHERE id_player = ?`,
            [winnerStats.tournament_won + 1, randomWinner]
          );
        }
      }
    }
    console.log(`✓ Created ${totalMatches} matches with player statistics\n`);

    // Step 4: Create some friendships (random connections)
    console.log('Creating friendships...');
    const numFriendships = 150;
    let friendshipsCreated = 0;

    for (let i = 0; i < numFriendships; i++) {
      const user1 = userIds[randomInt(0, userIds.length - 1)];
      const user2 = userIds[randomInt(0, userIds.length - 1)];
      
      if (user1 !== user2) {
        try {
          await dbRun(
            `INSERT INTO friendship (id_user_1, id_user_2) VALUES (?, ?)`,
            [user1, user2]
          );
          friendshipsCreated++;
        } catch (err) {
          // Friendship might already exist
        }
      }
    }
    console.log(`✓ Created ${friendshipsCreated} friendships\n`);

    // Print summary
    console.log('='.repeat(50));
    console.log('DATABASE SEEDING COMPLETED!');
    console.log('='.repeat(50));
    console.log(`Users: ${userIds.length}`);
    console.log(`Tournaments: ${tournamentIds.length}`);
    console.log(`Matches: ${totalMatches}`);
    console.log(`Friendships: ${friendshipsCreated}`);
    console.log('='.repeat(50));
    console.log('\nCredentials:');
    console.log('Email: user1@example.com to user100@example.com');
    console.log('Password: password123');
    console.log('='.repeat(50));

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    db.close();
    process.exit(1);
  }
}

seedDatabase();
