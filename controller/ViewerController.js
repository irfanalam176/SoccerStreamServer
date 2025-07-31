import { v4 as uuidv4 } from "uuid";
import db from "../model/db.js";

export const getLiveMatches = async (req, res) => {
  const sql = `
    SELECT 
      m.*,
      -- Team 1
      t1.id AS team1_id,
      t1.name AS team1_name,
      t1.image AS team1_image,
      t1.created_by AS team1_created_by,
      -- Team 2
      t2.id AS team2_id,
      t2.name AS team2_name,
      t2.image AS team2_image,
      t2.created_by AS team2_created_by,
      -- Tournament
      tr.id AS tournament_id,
      tr.name AS tournament_name,
      tr.created_by AS tournament_created_by
    FROM matches m
    JOIN team t1 ON m.team1_id = t1.id
    JOIN team t2 ON m.team2_id = t2.id
    JOIN tournament tr ON m.tournament_id = tr.id
    WHERE m.isLive = TRUE;
  `;

  try {
    const [rows] = await db.query(sql);

    const formattedMatches = rows.map(row => ({
      id: row.id,
      match_date: row.match_date,
      time: row.time,
      round: row.round,
      isLive: row.isLive,

      tournament: {
        id: row.tournament_id,
        name: row.tournament_name,
        created_by: row.tournament_created_by
      },

      team1: {
        id: row.team1_id,
        name: row.team1_name,
        image: row.team1_image,
        created_by: row.team1_created_by
      },

      team2: {
        id: row.team2_id,
        name: row.team2_name,
        image: row.team2_image,
        created_by: row.team2_created_by
      }
    }));

    res.status(200).json(formattedMatches);
  } catch (error) {
    console.error("Error fetching live matches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLiveMatche = async(req,res)=>{
    const {id} = req.params
    const sql = `SELECT team_A_score, team_B_score from matches where id = ?`
    try{
        const[response] = await db.execute(sql,[id])
        
        if(response.length>0){
            return res.status(200).json({result:response[0]})
        }
    }catch (error) {
        console.error("Error fetching live matche:", error);
        res.status(500).json({ error: "Internal server error" });
    }
    
}

export const getMatchDetails = async(req,res)=>{
    const {id} = req.params
    const sql = `
    SELECT 
      m.match_date,
      m.time,
      m.round,
      t.name AS tournament_name,
      t.location AS tournament_location
    FROM 
      matches m
    JOIN 
      tournament t ON m.tournament_id = t.id
    WHERE 
      m.id = ?
  `;

  try {
    const [response] = await db.execute(sql, [id]);
    return res.json({ result: response[0] });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const getLineup = async(req,res)=>{
    const {id} = req.params;
    console.log(id);
    
  try {

    const matchSql = `
      SELECT team1_id, team2_id 
      FROM matches 
      WHERE id = ?
    `;
    const [matchResult] = await db.query(matchSql, [id]);

    if (matchResult.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    const { team1_id, team2_id } = matchResult[0];

    const playerSql = `
      SELECT * FROM player 
      WHERE team_id IN (?, ?)
    `;
    const [players] = await db.query(playerSql, [team1_id, team2_id]);

    const formatTeamPlayers = (teamId) => {
      const teamPlayers = players.filter(p => p.team_id === teamId);

      return {
        goalkeeper: teamPlayers.find(p => p.position === 'GOALKEEPER') || null,
        midfield_defense: teamPlayers.filter(p =>
          ['FULL-BACK', 'CENTRE-BACK', 'SWEEPER', 'DEFENCSIVE-MIDFIELDER', 'WING-BACK', 'CENTRAL-MIDFIELDER', 'ATTACKING-MIDFIELDER']
          .includes(p.position)
        ),
        forwards: teamPlayers.filter(p =>
          ['FORWARD', 'STRIKER', 'WINGER'].includes(p.position)
        )
      };
    };

    const response = {
      team1: formatTeamPlayers(team1_id),
      team2: formatTeamPlayers(team2_id)
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching match players:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
    
}



export const getPlayers = async (req, res) => {
  try {
    const {id} = req.params;
  
    // Step 1: Get team1_id and team2_id using match_id
    const [matchResult] = await db.execute(`
      SELECT team1_id, team2_id FROM matches WHERE id = ?
    `, [id]);

    if (matchResult.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    const { team1_id, team2_id } = matchResult[0];

    // Step 2: Get team names
    const [teams] = await db.execute(`
      SELECT id, name FROM team WHERE id IN (?, ?)
    `, [team1_id, team2_id]);
    // Step 3: Get players of both teams
    const [players] = await db.execute(`
      SELECT id, name, position, image, team_id FROM player WHERE team_id IN (?, ?)
    `, [team1_id, team2_id]);

    // Step 4: Build response
    const team1Info = teams.find(t => t.id === team1_id);
    const team2Info = teams.find(t => t.id === team2_id);

    const response = {
      team1: {
        name: team1Info?.name || "Unknown",
        players: players.filter(p => p.team_id === team1_id)
      },
      team2: {
        name: team2Info?.name || "Unknown",
        players: players.filter(p => p.team_id === team2_id)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching team players:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
