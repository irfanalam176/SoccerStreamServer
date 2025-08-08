import { Router } from "express";
import { addAdmin, deleteAdmin, getAdmins, getCount, loginSuperAdmin, updateAdmin, verifyToken } from "../controller/superAdminController.js";
const superAdminRouter = Router()
superAdminRouter.post("/add-admin",addAdmin)
superAdminRouter.get("/get-admin",getAdmins)
superAdminRouter.put("/update-admin/:id",updateAdmin)
superAdminRouter.delete("/delete-admin/:id",deleteAdmin)
superAdminRouter.get("/get-count",getCount)
superAdminRouter.post("/login-super-admin",loginSuperAdmin)
superAdminRouter.post("/verify-token",verifyToken)

export default superAdminRouter