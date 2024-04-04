const express = require('express')
const app = express()
const userModel = require('../model/userModel')
const bcrypt = require('bcryptjs')
const { default: mongoose } = require('mongoose')
const router = express.Router()


function serverErr(req,res){
    res.status(500).json({registered:false,message:'There was an error, try again later.'})
}
router.get('/description', async(req,res)=>{
    res.json({description:app.locals.description})
})

router.post('/login', (req,res)=>{
    let data = req.body.data
    let userName = data.userName
    let email = data.email
    let password = data.password
    let userData = {userName:data.userName, password: data.password, email : data.email}
    userModel.find({userName:userName})
    .then((response)=>{
        if(response === null || response === undefined){
            res.status(400).json({authenticated:false, message:'User not found, please create a new account'})
            return 
        } else{
            let foundPass = response.password
            bcrypt.compare(password, foundPass, (err, success)=>{
                if(err){
                    res.status(400).json({authenticated:false, message:'Incorrect password, please try again.'})
                } else if (success){
                    res.status(200).json({authenticated:true, message:'You have been authenticated.', userName:response.userName})
                }
            })
        }
        
    })
})

router.post('/register', (req,res)=>{
    let userData = req.body 
    let userName = userData.userName
    let email = userData.email
    let password = userPassword.password
    bcrypt.genSalt(10, (err, salt)=>{
        if(err){
            serverErr()
            return 
        }
        bcrypt.hash(password,salt, (err,hash)=>{
           if(err){
            serverErr()
            return 
           }
           let userObj = new userModel({userName:userName, email:email, password:hash})
           mongoose.save(userObj)
           .then((response)=>{
            if(response === null || undefined){
                serverErr()
                return
            }
            res.status(200).json({registered:true,message:'You have registed to interviewAI successfully. Please log in with your credentials.', userName:response.userName}) 
           })
        })
    })
    
})
module.exports = router