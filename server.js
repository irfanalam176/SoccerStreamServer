import express from "express"
import authRouter from "./routes/auth.js"
import adminRouter from "./routes/admin.js"
import viewerRouter from "./routes/viewer.js"
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/upload', express.static('upload'));

app.use("/auth",authRouter)
app.use("/admin",adminRouter)
app.use("/viewer",viewerRouter)

app.listen(3000,()=>{
    console.log("http://localhost:3000");
    
})