import db from "../model/db.js";
export const getMatches = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `SELECT 
    m.id AS match_id,
    m.liveid,
    t1.name AS team1_name,
    t1.image AS team1_image,
    t2.name AS team2_name,
    t2.image AS team2_image
FROM 
    matches m
JOIN 
    team t1 ON m.team1_id = t1.id
JOIN 
    team t2 ON m.team2_id = t2.id
WHERE 
    m.tournament_id = ?     
    AND m.isLive = 1`;

    const [response] = await db.execute(sql, [id]);

    if (response.length > 0) {
      return res.status(200).json({ response: response[0] });
    }
    return res.status(404).json({ message: "No match found" });
  } catch (e) {
    console.log("Internal server error" + e);
    res.status(500).json({ message: "internal server error" });
  }
};

export const setIds = async (req, res) => {
    const {  liveID } = req.body;
    const { id } = req.params;
    const sql = `UPDATE matches SET  liveID = ? WHERE id = ?;`;
    try {
        const [response] = await db.execute(sql, [liveID.trim(), id]);
        if (response.affectedRows > 0) {
            return res.status(200).json({ message: "Ids are set" });
        }
        return res.status(404).json({ message: "Ids are not set" });
    } catch (e) {
        console.log("Internal server error" + e);
        res.status(500).json({ message: "internal server error" });
    }
};
export const getIds = async (req, res) => {
    const { id } = req.params;
    
    const sql = `SELECT liveID FROM matches WHERE id = ?`;
    try {
        const [response] = await db.execute(sql, [id]);
        
        if (response.length > 0) {
            return res.status(200).json({result:response[0]});
        }
        return res.status(404).json({ message: "Ids are not found" });
    } catch (e) {
        console.log("Internal server error" + e);
        res.status(500).json({ message: "internal server error" });
    }
}
