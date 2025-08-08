import express from "express"
import authRouter from "./routes/auth.js"
import adminRouter from "./routes/admin.js"
import viewerRouter from "./routes/viewer.js"
import broadcastRoute from "./routes/broadcaster.js"
import superAdminRouter from "./routes/superAdmin.js"
import cors from "cors"
const app = express()

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/upload', express.static('upload'));

app.use("/auth",authRouter)
app.use("/admin",adminRouter)
app.use("/viewer",viewerRouter)
app.use("/broadcaster",broadcastRoute)
app.use("/super-admin",superAdminRouter)

app.listen(3000,()=>{
    console.log("http://localhost:3000");
    
})