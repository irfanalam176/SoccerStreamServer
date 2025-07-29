import db from "../model/db.js"
export const adminLogin = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const sql = "SELECT * FROM admin WHERE username=? AND password=?";
    const [response] = await db.execute(sql, [userName, password]);

    if (response.length > 0) {
      const admin = response[0];

      // 👇 Check for tournament created by this admin and not completed
      const tournamentSql = "SELECT id FROM tournament WHERE created_by = ? AND isCompleted = 0";
      const [tournamentResult] = await db.execute(tournamentSql, [admin.id]);

      let tournamentId = null;
      if (tournamentResult.length > 0) {
        tournamentId = tournamentResult[0].id;
      }

      return res.status(200).json({
        response: admin,
        message: "Login Successfully",
        tournamentId: tournamentId, // will be null if not found
      });
    }

    return res.status(404).json({
      isExist: false,
      message: "User Not Found",
    });
  } catch (e) {
    console.log("admin Login error: " + e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};