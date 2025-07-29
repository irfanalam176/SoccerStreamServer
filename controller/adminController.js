import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';
import fs from "fs/promises"
import path from "path";
import db from "../model/db.js"; // Your mysql2 connection

export const teamCreation = async (req, res) => {
  try {
    const { teamName, players, adminId } = req.body; // players is array of objects with name and position

    const teamId = uuidv4();
    const teamImageFile = req.files.find((f) => f.fieldname === "teamImage");
    const teamImageName = teamImageFile ? teamImageFile.filename : null;

    // Insert team record
    await db.query(
      "INSERT INTO team (id, name, image, created_by) VALUES (?, ?, ?, ?)",
      [teamId, teamName, teamImageName, adminId]
    );

    // Insert players - req.body.players is already array of objects
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const playerId = uuidv4();

      // Find player's image file by matching fieldname exactly
      const playerImageFile = req.files.find(
        (f) => f.fieldname === `players[${i}][image]`
      );
      const playerImageName = playerImageFile ? playerImageFile.filename : null;

      await db.query(
        "INSERT INTO player (id, name, position, image, team_id) VALUES (?, ?, ?, ?, ?)",
        [
          playerId,
          player.name || "",
          player.position || "",
          playerImageName,
          teamId,
        ]
      );
    }

    res.json({ message: "Team created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getTeams = async (req, res) => {
  const { id } = req.params;
  
  const sql = "SELECT * FROM team WHERE created_by = ?";

  try {
    const [response] = await db.execute(sql, [id]);

    if (response.length > 0) {
      return res.status(200).json({ response });
    }
    return res.status(404);
  } catch (e) {
    console.log("Internal server error" + e);
    return res.status(404);
  }
};

export const createMatch = async (req, res) => {
  const matches = req.body.matches;

  try {
    const insertedMatches = [];

    for (const match of matches) {
      const id = uuidv4(); // Generate a new UUID for each match

      const sql = `
      INSERT INTO matches (id, tournament_id, team1_id, team2_id, match_date, time,round) 
      VALUES (?, ?, ?, ?, ?, ?,?)
    `;

      const [response] = await db.execute(sql, [
        id,
        match.tournamentId,
        match.team1,
        match.team2,
        match.date,
        match.time,
        match.round,
      ]);

      // Add the inserted match data to the array
      insertedMatches.push({
        id,
        tournament_id: match.tournamentId,
        team1_id: match.team1,
        team2_id: match.team2,
        match_date: match.date,
        time: match.time,
        round: match.round,
      });
    }

    // Send success response with inserted matches data
    res.status(200).json({
      success: true,
      message: "Matches created successfully",
      data: insertedMatches,
    });
  } catch (error) {
    console.log("Error:", error);
    // Send error response in JSON format
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const createTournment = async (req, res) => {
  const { tournmentName, venue } = req.body;
  const { id } = req.params; // admin ID
  const uuid = uuidv4(); // new tournament ID

  const checkIncompleteSql =
    "SELECT id FROM tournament WHERE created_by = ? AND isCompleted = 0";

  const insertSql =
    "INSERT INTO tournament(id, name, location, created_by) VALUES (?, ?, ?, ?)";

  const selectSql =
    "SELECT id FROM tournament WHERE created_by = ?";

  try {
    // ✅ Step 1: Check if admin has any incomplete tournament
    const [incomplete] = await db.execute(checkIncompleteSql, [id]);

    if (incomplete.length > 0) {
      return res.status(403).json({
        message: "Cannot create a new tournament until the current one is completed.",
      });
    }

    // ✅ Step 2: Create tournament
    const [insertResult] = await db.execute(insertSql, [
      uuid,
      tournmentName,
      venue,
      id,
    ]);

    if (insertResult.affectedRows > 0) {
      const [response] = await db.execute(selectSql, [id]);
      return res.status(201).json({ tournament: response[0] });
    }

    return res.status(400).json({ message: "Tournament creation failed" });

  } catch (e) {
    console.error("Internal server error:", e);
    return res
      .status(500)
      .json({ error: "Internal server error", details: e.message });
  }
};


export const getTournaments = async (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM tournament WHERE created_by = ?`;
  try {
    const [response] = await db.execute(sql, [id]);
      return res.status(200).json(response);
  } catch (e) {
    console.error("Internal server error:", e);
    return res
      .status(500)
      .json({ error: "Internal server error", details: e.message });
  }
};


export const getTournamentById = async (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM tournament WHERE id = ?`;

  try {
    const [response] = await db.execute(sql, [id]);
    if (response.length > 0) {
      return res.status(200).json({response:response[0]});
    }
  } catch (e) {
    console.error("Internal server error:", e);
    return res
      .status(500)
      .json({ error: "Internal server error", details: e.message });
  }
};


export const updateTournament = async (req, res) => {
  const { id } = req.params;
  const { tournmentName, venue } = req.body;
  const sql = `UPDATE tournament SET name=?,location=? WHERE id = ?`;

  try {
    const [response] = await db.execute(sql, [tournmentName, venue, id]);
    if (response.affectedRows > 0) {
      return res.status(200).json({ message: "Record Updated" });
    }
    return res.status(404);
  } catch (e) {
    console.error("Internal server error:", e);
    return res
      .status(500)
      .json({ error: "Internal server error", details: e.message });
  }
};

export const deleteTournament=async(req,res)=>{
  const{id} = req.params
  const sql = `DELETE FROM tournament WHERE id = ?`
  try{
    const[response] = await db.execute(sql,[id])
    if(response.affectedRows>0){
      return res.status(200).json({message:"Tournament Delete Successfully"})
    }
    return res.status(404)
  }catch (e) {
    console.error("Internal server error:", e);
    return res
      .status(500)
      .json({ error: "Internal server error", details: e.message });
  }
}

export const isOngoing=async(req,res)=>{
  const{id} = req.params
  
  const sql =  `SELECT * FROM tournament WHERE created_by = ? AND isCompleted=0`
  try{

    const[response] = await db.execute(sql,[id])
    
    if(response.length>0){
      return res.status(200).json({message:"Tournament is ongoing"})
    }
    return res.status(404).json({message:"No ongoing Tournament"})

  }catch(e){
        console.error("Internal server error:", e);
    return res
      .status(500)
      .json({ error: "Internal server error", details: e.message });
  }
}

export const getMatches = async (req, res) => {
  const { id } = req.params;

  const sql = `
SELECT
  m.id AS match_id,
  m.match_date,
  m.time,
  m.round,
  m.team1_id,
  m.team2_id,
  t1.name AS team1_name,
  t2.name AS team2_name
FROM matches m
JOIN team t1 ON m.team1_id = t1.id
JOIN team t2 ON m.team2_id = t2.id
WHERE m.tournament_id = ?;

  `;

  try {
    const [response] = await db.execute(sql, [id]);
    if (!response.length) {
      return res.status(404).json({ message: "No Matches Found" });
    }

    // Format matches as: { match_id, match_date, match_name: "Team A vs Team B" }
    const matches = response.map(row => ({
      match_id: row.match_id,
      match_date: row.match_date,
      match_time:row.time,
      match_round:row.round,
      team_names:{
        team1_id:row.team1_id,
        team2_id:row.team2_id,
        team1:row.team1_name,
        team2:row.team2_name
      } 
    }));

    return res.status(200).json(matches);

  } catch (e) {
    console.error("Internal server error:", e);
    return res
      .status(500)
      .json({ error: "Internal server error", details: e.message });
  }
};



export const editPlayer = async (req, res) => {
  const { id, name, position, oldImage } = req.body;
  const newImage = req.file ? req.file.filename : oldImage;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const sql = `UPDATE player SET name = ?, position = ?, image = ? WHERE id = ?`;
  const values = [name, position, newImage, id];

  try {
    const [response] = await db.execute(sql, values);

    if (response.affectedRows > 0) {
      // ✅ Send response immediately
      res.status(200).json({ message: 'Player Edited Successfully' });

      // ✅ Delete old image asynchronously (in background)
      if (req.file && oldImage && oldImage !== newImage) {
        const oldImagePath = path.join(__dirname, '../upload/', oldImage);
        fs.unlink(oldImagePath)
          .then(() => console.log('Old image deleted:', oldImage))
          .catch(err => console.error('Error deleting old image:', err.message));
      }

    } else {
      return res.status(404).json({ message: 'Player Edit Failed' });
    }

  } catch (e) {
    console.error('Internal server error:', e);
    return res.status(500).json({
      error: 'Internal server error',
      details: e.message,
    });
  }
};


export const getMatchTeams=async(req,res)=>{
  const { id } = req.params; // match ID

  try {
    // Step 1: Get team1_id and team2_id from matches table
    const [matchResult] = await db.execute(
      'SELECT team1_id, team2_id FROM matches WHERE id = ?',
      [id]
    );

    if (!matchResult.length) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const { team1_id, team2_id } = matchResult[0];

    // Step 2: Get team1 and team2 names
    const [teams] = await db.execute(
      'SELECT id, name FROM team WHERE id IN (?, ?)',
      [team1_id, team2_id]
    );

    const team1Name = teams.find(team => team.id === team1_id)?.name || 'Team 1';
    const team2Name = teams.find(team => team.id === team2_id)?.name || 'Team 2';

    // Step 3: Get players for both teams
    const [team1Players] = await db.execute(
      'SELECT id, name, position, image FROM player WHERE team_id = ?',
      [team1_id]
    );

    const [team2Players] = await db.execute(
      'SELECT id, name, position, image FROM player WHERE team_id = ?',
      [team2_id]
    );

    // Step 4: Send structured response
    res.json({
      team1: {
        name: team1Name,
        players: team1Players
      },
      team2: {
        name: team2Name,
        players: team2Players
      }
    });

  } catch (error) {
    console.error('Error fetching match players:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
  
}

export const deletePlayer=async(req,res)=>{
  const{id} = req.params
  const sql = `DELETE FROM player WHERE id = ?`
  try{
      const[response] = await db.execute(sql,[id])
      if(response.affectedRows>0){
       return res.status(200).json({message:"Player Deleted Successfully"})
      }
      return res.status(404).json({message:"Player Deletion failed"})
  }catch (error) {
    console.error('Internal server Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
    
}

export const editTeam = async (req, res) => {
  const { id, name, oldImage } = req.body;
  const newImage = req.file ? req.file.filename : oldImage;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const sql = `UPDATE team SET name = ?, image = ? WHERE id = ?`;
  const values = [name, newImage, id];

  try {
    const [response] = await db.execute(sql, values);

    if (response.affectedRows > 0) {
      // ✅ Send response immediately
      res.status(200).json({ message: 'Team Edited Successfully' });

      // ✅ Delete old image asynchronously in background
      if (req.file && oldImage && oldImage !== newImage) {
        const oldImagePath = path.join(__dirname, '../upload/', oldImage);

        // no await here — run in background
        fs.unlink(oldImagePath)
          .then(() => console.log('Old image deleted:', oldImage))
          .catch((err) => console.error('Error deleting old image:', err.message));
      }

    } else {
      return res.status(404).json({ message: 'Team Edit Failed' });
    }

  } catch (e) {
    console.error('Internal server error:', e);
    return res.status(500).json({
      error: 'Internal server error',
      details: e.message,
    });
  }
};

export const getPlayers=async(req,res)=>{
 const{id} = req.params

 const sql = `SELECT * FROM player WHERE team_id = ?`

 try{
    const [response] = await db.execute(sql,[id])
    res.status(200).json(response)

 } catch (e) {
    console.error('Internal server error:', e);
    return res.status(500).json({
      error: 'Internal server error',
      details: e.message,
    });
  }
  
}

export const addPlayer = async(req,res)=>{
  
  const{name,position,team_id} = req.body
  const image = req.file.filename
  console.log(req.file);
  
  const uuid = uuidv4()
  const sql =  `INSERT INTO player(id, name, position, image, team_id) VALUES (?,?,?,?,?)`

  try{
    const [response] = await db.execute(sql,[uuid,name,position,image,team_id])
    if(response.affectedRows>0){
      return res.status(200).json({message:"Player Added Successfully"})
    }
    return res.status(404).json({message:"Player Addition failed"})
  }catch (e) {
    console.error('Internal server error:', e);
    return res.status(500).json({
      error: 'Internal server error',
      details: e.message,
    });
  }
}

export const editMatch=async(req,res)=>{
  const{id,team1_id,team2_id,round,match_date,time}=req.body
  const sql = `UPDATE matches SET team1_id=?,team2_id=?,match_date=?,time=?,round=? WHERE id = ?`
  try{
    const[response] = await db.execute(sql,[team1_id,team2_id,match_date,time,round,id])
    if(response.affectedRows>0){
      return res.status(200).json({message:"match updated"})
    }
    return res.status(404).json({message:"match update failed"})
  }catch (e) {
    console.error('Internal server error:', e);
    return res.status(500).json({
      error: 'Internal server error',
      details: e.message,
    });
  }
}

export const deleteMatch=async(req,res)=>{
  const{id} = req.params
  const sql = `DELETE FROM matches WHERE id = ?`
  try{
    const[response] = await db.execute(sql,[id])
    if(response.affectedRows>0){
      return res.status(200).json({message:"Match deleted successfully"})
    }
    return res.status(404).json({message:"Match deletion failed"})
  }catch (e) {
    console.error('Internal server error:', e);
    return res.status(500).json({
      error: 'Internal server error',
      details: e.message,
    });
  }
  
}

export const deleteTeam=async(req,res)=>{
  const{id} = req.params
  console.log(id);
  
  const sql = `DELETE FROM team WHERE id = ?`
  try{
    const[response] = await db.execute(sql,[id])
    if(response.affectedRows>0){
      return res.status(200).json({message:"Team deleted successfully"})
    }
    return res.status(404).json({message:"Team deletion failed"})
  }catch (e) {
    console.error('Internal server error:', e);
    return res.status(500).json({
      error: 'Internal server error',
      details: e.message,
    });
  }
}