const jwt = require("jsonwebtoken");
const {Jwt_secret} = require("../keys")
const mongoose = require("mongoose")
const USER = mongoose.model("USER") 
module.exports = (req, res, next)=>{
    const {authorization} = req.headers
    if(!authorization){
        return res.status(401).json({error: "You must be logged in to access this"})
    }
    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, Jwt_secret, (err, payload)=>{
        if(err){
            return res.status(401).json({error: "You must be logged in to access this"})
        }
        const {_id} = payload
        USER.findById(_id).then(userData=>{
            console.log(userData)
            req.user = userData
            next();
        })
    })
}