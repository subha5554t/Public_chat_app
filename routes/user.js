const express = require("express");
const User = require("../models/user");
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
//signup
router.get('/', (req, res) => {
  res.render('signup', {err:false});
});
router.post("/signup", async(req,res)=>{
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
   
    if (existingUser) {
      return res.redirect(`/user/login?userExists=true&email=${encodeURIComponent(email)}`);
  }
    else{
      await User.create({
        name,
        email,
        password,
      });
      return res.redirect("/user/login");
    }
});

//login
router.get('/login',(req,res)=>{
  const{userExists, email} = req.query;
  res.render('login',{userExists, email,error: false});
})
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if(!user){
    return res.render("signup",{
      err: true,
    });
  } 
  else if ( user.password !== password) {
      return res.render("login", {
          error: true,
      });
  } else {
      return res.redirect('/user/chatselection');
  }
});

//this will redirect to chat selection
router.get('/chatselection',async(req,res)=>{
  return res.render('chatselect');
})

//this will redirect to private chatroom
router.get('/privatechat',async(req,res)=>{
  res.render('privatechat');
});

//this will redirect to public chatroom 
router.get("/chat",async(req, res) => {
  return res.render('index');
 });

module.exports = router;