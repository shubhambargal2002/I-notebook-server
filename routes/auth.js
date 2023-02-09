const express=require('express');
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const router=express.Router();
const fetchuser=require("../middleware/fetchuser");
require('../db');
const User=require('../models/userSchema');
const Message=require('../models/messageSchema');
const JWT_SECRET =process.env.JWT_SECRET;
const { body, validationResult } = require("express-validator");

// register router
router.post('/register',async(req,res)=>{
    
  

  
    const {name,email,phone,work,password,cpassword}=req.body;

    if(!name || !email || !phone || !work || !password || !cpassword){
        return res.status(422).json({success,error:"Please filled the all fields"})
    }

    try {
        let user=await User.findOne({email:email})
         
          if(user){
            return res.status(422).json({success,error:"User with this email is already exist"})
          }
          else if(password!=cpassword){
            return res.status(422).json({success,error:"Password not matched"})
          }
          else if(phone.length!=10){
            return res.status(422).json({success,error:"Enter a valid Mobile number"})
          }
          else{
            // generate new password
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);

            // create a new user
            user = await User.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            work: req.body.work,
            password: secPass,
            cpassword: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      // res.json({user})
      success=true;
      res.json({success, authtoken });
      }}  catch (error) {
            console.log(error);
    }
})

// login router
router.post('/login',async(req,res)=>{
    try {
        const {email,password}=req.body

        if(!email || !password){
            return res.status(422).json({error:"Please filled the all fields"})
        }

        let user= await User.findOne({email:email})

        if(user){
            const isMatch=await bcrypt.compare(password,user.password)

            if(!isMatch){
                return res.status(422).json({error:"Invalid credentials"})
            }
            else{
                const data = {
                    user: {
                      id: user.id,
                    },
                  };
                  const authtoken = jwt.sign(data, JWT_SECRET);
            
                  // res.json({user})
                  success=true;
                  res.json({success, authtoken });
            }
        }
        else{
            return res.status(422).json({error:"Invalid credentials"})
        }
    } catch (error) {
        console.log(error);
    }
})

// Route-3: get loggedin user details using: GET "/getuser"  login required
router.get(
  "/getuser",fetchuser,async (req, res) => {

    try {
      userId = req.user.id;
      const user = await User.findById(userId);
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(400).send("Internal server error");
    }
  }
);

// Route-4: add a new message using: POST "/addmessage"  login required
router.post("/addmessage",fetchuser,async (req, res) => {
    let success=false;
    const {name,email,phone,message}=req.body;

    if(!name || !email || !phone || !message){
      return res.status(422).json({success,error:"Please filled the all fields"})
  }

    try {
      const { name, email, phone,message } = req.body;
      // if there are error, return bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const messages = new Message({
        name,
        email,
        phone,
        message,
        user: req.user.id,
      });
      const savedmessages = await messages.save();
      res.json(savedmessages);
    } catch (error) {
      console.error(error.message);
      res.status(400).send("Internal server error");
    }
  }
);

module.exports=router;