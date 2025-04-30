const express=require('express');
const app=express();
const path=require('path');
const cors=require('cors');

app.use(cors());

const userModel=require('./models/Users');

const connectDB = require('./config/db');

const booksRouter = require("./routes/books");
const userRouter=require("./routes/users");
const adminRouter=require("./routes/adminPanel");


connectDB();

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));

app.use("/users",userRouter);

app.use("/books",booksRouter);

app.use("/admin",adminRouter);

app.get('/',(req,res)=>{
    res.render("Home");
})

app.get('/signup',(req,res)=>{
    res.render("signup");
})

app.post("/signup", async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
  
      // Basic validation
      if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Check if user already exists in the database
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Auto-increment ID (based on count)
      const userCount = await userModel.countDocuments();
  
      // Create the new user
      const newUser = await userModel.create({
        id: userCount + 1,
        name,
        email,
        password,
        phone,
      });
  
      res.status(201).json({ message: "User signed up successfully", user: newUser });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

app.listen(3000,()=>{
    console.log("server started");
})