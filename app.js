const express=require('express');
const app=express();
const path=require('path');
const cors=require('cors');

app.use(cors());

const userModel=require('./models/Users');
const bookModel=require('./models/Books');

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


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  
   if (user.password !== password) return res.status(401).json({ message: "Wrong password" });

  res.status(200).json({ message: "Login success", name: user.name });
});


app.post("/lend/:name", async (req, res) => {
  const { bookId } = req.body;
  const { name } = req.params;

  try {
    const user = await userModel.findOne({ name: name });
    if (!user) return res.status(404).json({ message: "User not found" });

    const book = await bookModel.findOne({ id: bookId });
    if (!book) return res.status(404).json({ message: "Book not found" });

    const alreadyLent = user.books.find(b => b.id === book.id);
    if (alreadyLent) {
      return res.status(400).json({ message: "You have already lent this book." });
    }

    user.books.push(book);
    await user.save();

    res.status(200).json({ message: "Book successfully lent!" });
  } catch (err) {
    console.error("Error in /lend route:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


app.get("/lent/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const user = await userModel.findOne({ name: name });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.books); // Send the lent books
  } catch (err) {
    console.error("Error fetching lent books:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});





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