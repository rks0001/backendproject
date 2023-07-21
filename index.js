import express from 'express'
import path from 'path'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';

// Mongo DB Connection 
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",
})
.then(()=>console.log("Database Connected"))
.catch((e) => console.log(e));

// MongoDB Schema
const userSchema = new mongoose.Schema({
    name: String,
    email:String,
    password:String,
})

// MongoDB Model 
const User = mongoose.model("User", userSchema)



const app = express();



// Using Middlewares
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// Setting up view engine
app.set("view engine", "ejs");

// IS AUTHENTICATED
const isAuthenticated = async (req,res,next) =>{
 // const token = req.cookies.token; or destructure it and use 
 const {token} = req.cookies;

 if(token){
    const decoded = jwt.verify(token,"abcdefg");

    req.user = await User.findById(decoded._id);
    next();
    
 }
 else{
     res.redirect("/login");
 }
}

// SLASH

app.get("/", isAuthenticated, (req,res)=>{
   
   res.render("logout", {name:req.user.name});
   
})
app.get("/login", (req,res)=>{
   
    res.render("login");
    
 })
app.get("/register", (req,res)=>{
   
    res.render("register");
    
 })

//  LOGIN
app.post("/login", async (req,res) => {

    const {email,password} = req.body;

    let user = await User.findOne({email});

    if(!user){
        return res.redirect("/register")
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.render("login", {email, message:"Incorrect Password"}) //email aa jayega, enter nhi karna baar baar
    }
    const token = jwt.sign({_id:user._id}, "abcdefg")
    
    res.cookie("token",token,{ 
        httpOnly:true,expires :new Date(Date.now() +60 *1000)
    });
    res.redirect("/")
})

// REGISTER

app.post("/register" ,async(req,res)=>{
    const {name, email,password } = req.body;

    let user = await User.findOne({email});
    if(user){
        return res.redirect("/login")

    }
   
    const hashedPassword = await bcrypt.hash(password,10);

    user = await User.create({
        name,email,password:hashedPassword, 
    })
  
     

    const token = jwt.sign({_id:user._id}, "abcdefg")
    
res.cookie("token",token,{ 
    httpOnly:true,expires :new Date(Date.now() +60 *1000)
});
res.redirect("/")
})

// LOGOUT

app.get("/logout" ,(req,res)=>{
    res.cookie("token","",{
        httpOnly:true,expires :new Date(Date.now())
    });
    res.redirect("/")
    })

// PORT 5000
app.listen(5000,()=>{
    console.log("Listening at port 5000");
})








// DONT NEED ANYMORE (JUST FOR REFERENCE)
// // Add to Database 
// app.post("/contact", async(req,res)=>{
//      const {name, email} = req.body;

//     await Messge.create({name:name, email:email});
//     res.redirect("/success");
    
// });
// app.get ("/success", (req,res)=>{
//     res.render("success");
//     })
      