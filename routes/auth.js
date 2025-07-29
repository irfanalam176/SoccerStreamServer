import { Router } from "express";
import { adminLogin } from "../controller/authController.js";
const authRouter = Router()

authRouter.post("/adminLogin",adminLogin)

export default authRouter