import db from "../model/db.js"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"

export const verifyToken = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, "superadminsecretekey", (err, user) => {
        console.log("in token");
        
        if (err) return res.status(403).json({ message: 'Invalid token' });
        return res.status(200).json({ isValid: true });
    });
};



export const loginSuperAdmin=async(req,res)=>{
    const{username,password}=req.body
    const sql = `SELECT * FROM super_admin WHERE username=? AND password = ?`
    
    try{
        const[response] = await db.execute(sql,[username.trim(),password.trim()])
        
        if(response.length>0){
            const token = jwt.sign({username:username}, 'superadminsecretekey');
            
            return res.status(200).json({message:"login successfull",token:token})
        }
        return res.status(404).json({message:"Login failed"})
    }catch(e){
        console.log("Server error occured" + e);
        return res.status(500).json({message:"Internal server error"})
        
    }
    
}


export const addAdmin=async(req,res)=>{
    const{name,password} = req.body
    const sql = `INSERT INTO admin(id,username,password) VALUE(?,?,?)`
    
    const uuid = uuidv4()
    try{
        const[response] = await db.execute(sql,[uuid,name,password])
        if(response.affectedRows>0){
            return res.status(200).json({message:"admin is created"})
        }
        return res.status(404).json({message:"admin is not created"})
    }catch(e){
        console.log("Server error occured" + e);
        return res.status(500).json({message:"Internal server error"})
        
    }
    
}
export const getAdmins=async(req,res)=>{
    const sql = `SELECT * FROM admin`
    
    try{
        const[response] = await db.query(sql)
        if(response.length>0){
            return res.status(200).json(response)
        }
        return res.status(404).json({message:"admin is not found"})
    }catch(e){
        console.log("Server error occured" + e);
        return res.status(500).json({message:"Internal server error"})
        
    }
    
}
export const updateAdmin=async(req,res)=>{
    const{id} = req.params
    const{username,password} = req.body
    
    const sql = `UPDATE admin SET username=?,password=? WHERE id =?`
    
    try{
        const[response] = await db.execute(sql,[username,password,id])
        if(response.affectedRows>0){
            return res.status(200).json({message:"Admin Edited succesfully"})
        }
        return res.status(404).json({message:"admin is not edited"})
    }catch(e){
        console.log("Server error occured" + e);
        return res.status(500).json({message:"Internal server error"})
        
    }
    
}

export const deleteAdmin=async(req,res)=>{
    const{id} = req.params
    
    const sql = `DELETE FROM admin WHERE id =?`
    
    try{
        const[response] = await db.execute(sql,[id])
        if(response.affectedRows>0){
            return res.status(200).json({message:"Admin Delete succesfully"})
        }
        return res.status(404).json({message:"admin is not Deleted"})
    }catch(e){
        console.log("Server error occured" + e);
        return res.status(500).json({message:"Internal server error"})
        
    }
    
}

export const getCount=async(req,res)=>{
    
    const sql = `SELECT 
    (SELECT COUNT(*) FROM admin) AS admin_count,
    (SELECT COUNT(*) FROM tournament WHERE isCompleted = 0) AS ongoing_tournament_count,
    (SELECT COUNT(*) FROM player) AS players_count,
    (SELECT COUNT(*) FROM team) AS team_count,
    (SELECT COUNT(*) FROM matches WHERE isCompleted = 0) AS ongoing_matches_count;

`
    
    try{
        const[response] = await db.query(sql)
        if(response.length>0){
            return res.status(200).json({result:response[0]})
        }
        return res.status(404).json({message:"No count found"})
    }catch(e){
        console.log("Server error occured" + e);
        return res.status(500).json({message:"Internal server error"})
        
    }
    
}