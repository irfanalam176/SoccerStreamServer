import { Router } from "express";
import { getIds, getMatches, setIds } from "../controller/broadcastController.js";
const broadcastRoute = Router()
broadcastRoute.get("/getMatches/:id",getMatches)
broadcastRoute.post("/setIds/:id",setIds)
broadcastRoute.get("/getIds/:id",getIds)
export default broadcastRoute