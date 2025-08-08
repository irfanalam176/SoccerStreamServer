import { Router } from "express";
import { getLineup, getLiveMatche, getLiveMatches, getMatchDetails, getMatches, getPlayers, getTournaments } from "../controller/ViewerController.js";
const viewerRouter=Router()
viewerRouter.get("/getLiveMatches",getLiveMatches)
viewerRouter.get("/getLiveMatche/:id",getLiveMatche)
viewerRouter.get("/getMatchDetails/:id",getMatchDetails)
viewerRouter.get("/getLineup/:id",getLineup)
viewerRouter.get("/getPlayers/:id",getPlayers)
viewerRouter.get("/getTournaments",getTournaments)
viewerRouter.get("/getMatches/:id",getMatches)

export default viewerRouter