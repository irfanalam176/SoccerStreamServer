import { Router } from "express";
import {
  addPlayer,
  createMatch,
  createTournment,
  deleteMatch,
  deletePlayer,
  deleteTeam,
  deleteTournament,
  editMatch,
  editPlayer,
  editTeam,
  finishGame,
  finishTournamnet,
  getMatches,
  getMatchTeams,
  getPlayers,
  getTeams,
  getTournamentById,
  getTournaments,
  isOngoing,
  startMatch,
  teamCreation,
  updateTournament,
} from "../controller/adminController.js";
import multer from "multer";
import path from "path";

const adminRouter = Router();

// Save files to 'upload' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "upload"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

adminRouter.post("/teamCreation", upload.any(), teamCreation);
adminRouter.get("/getTeams/:id", getTeams);
adminRouter.post("/createMatch", createMatch);
adminRouter.post("/createTournment/:id", createTournment);
adminRouter.get("/getTournaments/:id", getTournaments);
adminRouter.get("/getTournamentById/:id", getTournamentById);
adminRouter.put("/updateTournment/:id", updateTournament);
adminRouter.delete("/deleteTournament/:id", deleteTournament);
adminRouter.get("/isOngoing/:id", isOngoing);
adminRouter.get("/getMatches/:id", getMatches);
adminRouter.put("/editPlayer", upload.single("image"), editPlayer);
adminRouter.get("/getMatchTeams/:id", getMatchTeams);
adminRouter.delete("/deletePlayer/:id", deletePlayer);
adminRouter.put("/editTeam", upload.single("image"), editTeam);
adminRouter.get("/getPlayers/:id", getPlayers);
adminRouter.post("/addPlayer",upload.single("image"), addPlayer);
adminRouter.put("/editMatch", editMatch);
adminRouter.delete("/deleteMatch/:id", deleteMatch);
adminRouter.delete("/deleteTeam/:id", deleteTeam);
adminRouter.get("/finishGame/:id", finishGame);
adminRouter.get("/startMatch/:id", startMatch);
adminRouter.put("/finishTournamnet/:id", finishTournamnet);
export default adminRouter;
