import { Router } from "express";
import { getLineup, getLiveMatche, getLiveMatches, getMatchDetails, getPlayers } from "../controller/ViewerController.js";
const viewerRouter=Router()
viewerRouter.get("/getLiveMatches",getLiveMatches)
viewerRouter.get("/getLiveMatche/:id",getLiveMatche)
viewerRouter.get("/getMatchDetails/:id",getMatchDetails)
viewerRouter.get("/getLineup/:id",getLineup)
viewerRouter.get("/getPlayers/:id",getPlayers)

export default viewerRouter