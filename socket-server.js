import { Server } from 'socket.io';
import http from 'http';
import db from './model/db.js';

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Client joins a specific match room
  socket.on('join-match', (matchId) => {
    socket.join(`match-${matchId}`);
    console.log(`Socket ${socket.id} joined room match-${matchId}`);
  });


  socket.on('card-player', async ({ matchId, teamName, player }) => {
    console.log(teamName,player);
    
  try {
    const [rows] = await db.execute('SELECT carded_players FROM matches WHERE id = ?', [matchId]);
    let carded = [];

    if (rows.length && rows[0].carded_players) {
      carded = JSON.parse(rows[0].carded_players);
    }

    // Toggle logic (add if not exists, remove if exists)
    const playerKey = `${teamName}:${player}`;
    if (carded.includes(playerKey)) {
      carded = carded.filter(p => p !== playerKey);
    } else {
      carded.push(playerKey);
    }

    await db.execute('UPDATE matches SET carded_players = ? WHERE id = ?', [JSON.stringify(carded), matchId]);

    io.to(`match-${matchId}`).emit('carded-data', carded);
  } catch (err) {
    console.error('Error updating carded_players:', err.message);
  }
});

// Update a penalty
socket.on('update-penalty', async ({ matchId, teamKey, index, value }) => {
  
  try {
    const [rows] = await db.execute('SELECT penalties FROM matches WHERE id = ?', [matchId]);
    let penalties = { teamA: [], teamB: [] };

    if (rows.length && rows[0].penalties) {
      penalties = JSON.parse(rows[0].penalties);
    }

    if (!['teamA', 'teamB'].includes(teamKey)) {
      console.error('Invalid teamKey received:', teamKey);
      return;
    }

    if (!penalties[teamKey]) penalties[teamKey] = [];
    penalties[teamKey][index] = value;

    await db.execute('UPDATE matches SET penalties = ? WHERE id = ?', [
      JSON.stringify(penalties),
      matchId,
    ]);

    io.to(`match-${matchId}`).emit('penalties-data', penalties);
  } catch (err) {
    console.error('Error updating penalties:', err.message);
  }
});


// Emit penalties when client joins
socket.on('get-penalties', async (matchId) => {
  try {
    const [rows] = await db.execute('SELECT penalties FROM matches WHERE id = ?', [matchId]);
    if (rows.length) {
      const penalties = JSON.parse(rows[0].penalties || '{"teamA":[],"teamB":[]}');
      socket.emit('penalties-data', penalties);
    }
  } catch (err) {
    console.error('Error fetching penalties:', err.message);
  }
});


  // Client requests match score
socket.on('get-score', async (matchId) => {
  try {
    const [rows] = await db.execute(
      'SELECT team_A_score, team_B_score, carded_players FROM matches WHERE id = ?',
      [matchId]
    );
    if (rows.length > 0) {
      const scoreData = rows[0];
      socket.emit('score-data', {
        team_A_score: scoreData.team_A_score,
        team_B_score: scoreData.team_B_score,
      });
      socket.emit('carded-data', JSON.parse(scoreData.carded_players || '[]'));
    }
  } catch (err) {
    console.error('Error fetching score:', err.message);
  }
});

  // Admin updates score
  socket.on('score-update', async (data) => {
    const { matchId, score } = data;
    try {
      await db.execute(
        `UPDATE matches SET team_A_score = ?, team_B_score = ? WHERE id = ?`,
        [score.teamAScore, score.teamBScore, matchId]
      );

      // Emit to only this match's room
      io.to(`match-${matchId}`).emit('score-data', score);
    } catch (err) {
      console.error('Error updating score:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('Socket server running on port 4000');
});
