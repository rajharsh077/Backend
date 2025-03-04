const express=require('express');
const app=express();
const path=require('path');

const booksRouter = require("./routes/books");
const userRouter=require("./routes/users");
const adminRouter=require("./routes/adminPanel");

const users=require("./routes/UserData");

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

app.post("/signup",(req,res)=>{
    const {id,name,email,password,phone,}=req.body;
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }
    const newUser = {
        id,
        name,
        email,
        password,  // In production, always hash passwords before storing
        phone,
        books: []   // Default empty array for issued books
    };
    users.push(newUser);
    res.status(201).json({ message: "User signed up successfully", user: newUser });
})

app.listen(3000,()=>{
    console.log("server started");
})