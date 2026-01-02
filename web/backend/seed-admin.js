  import sqlite3 from 'sqlite3';
  import bcrypt from 'bcrypt';

  const { verbose } = sqlite3;
  const db = new (verbose()).Database('./data/database.sqlite');

  async function seedAdmin() {
    // Check if admin exists
    db.get('SELECT * FROM user WHERE mail = ?', ['admin@admin.com'], async (err, row) => {
      if (row) {
        console.log('Admin already exists');
        db.close();
        process.exit(0);
        return;
      }

      const hashedPassword = await bcrypt.hash('admin_123', 10);

      db.run(`INSERT INTO user (username, mail, psw, is_admin) VALUES (?, ?, ?, ?)`,
        ['admin', 'admin@admin.com', hashedPassword, 1],
        function(err) {
          if (err) {
            console.error('Error:', err);
            process.exit(1);
          }
          console.log('Admin created!');

          db.run(`INSERT INTO player_all_time_stats (id_player) VALUES (?)`, [this.lastID], () => {
            db.close();
            process.exit(0);
          });
        }
      );
    });
  }

  seedAdmin();
