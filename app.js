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
    const user = await userModel.findOne({ name });
    if (!user) return res.status(404).json({ message: "User not found" });

    const book = await bookModel.findOne({ id: bookId });
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Check if already lent
    const alreadyLent = user.books.find(b => b.id === book.id);
    if (alreadyLent) {
      return res.status(400).json({ message: "You have already lent this book." });
    }

    // Push full book data with lentDate
    user.books.push({
      id: book.id,
      title: book.title,
      author: book.author,
      image: book.image,
      lentDate: new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
    });

    await user.save();

    res.status(200).json({ message: "Book successfully lent!" });
  } catch (err) {
    console.error("Error in /lend route:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



app.delete('/return/:name', async (req, res) => {
  const userName = req.params.name;
  const { bookId } = req.body;

  try {
    const user = await userModel.findOne({ name: userName });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Filter out the book to be returned
    user.books = user.books.filter(book => book.id !== bookId);

    await user.save();
    res.status(200).json({ message: 'Book returned successfully' });
  } catch (err) {
    console.error("Error in return route:", err);
    res.status(500).json({ message: 'Error returning book' });
  }
});

app.get("/lent/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const user = await userModel.findOne({ name });

    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date();
    // Convert today's date to the same time zone as lentDate
    const currentDateInUserTimezone = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const booksWithFines = user.books.map((book) => {
      const lentDate = new Date(book.lentDate);
      const diffInTime = currentDateInUserTimezone - lentDate;
      const daysLent = Math.floor(diffInTime / (1000 * 60 * 60 * 24));
      const fine = daysLent > 30 ? (daysLent - 30) * 2 : 0; // ₹2 per day after 30 days

      return {
        ...book.toObject?.() || book, // Ensure plain object if it's a Mongoose doc
        daysLent,
        fine,
      };
    });

    res.status(200).json(booksWithFines);
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

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Auto-increment ID
    const userCount = await userModel.countDocuments();

    // Create new user
    const newUser = await userModel.create({
      id: userCount + 1,
      name,
      email,
      password,
      phone,
      books: [],
      wishlist:[],
    });

    res.status(201).json({ message: "User signed up successfully", user: newUser });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.post('/:name/wishlist', async (req, res) => {
  const { name } = req.params;
  const { book } = req.body;

  try {
    const user = await userModel.findOne({ name });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the book to the user's wishlist if it's not already there
    if (!user.wishlist.some((b) => b.id === book.id)) {
      user.wishlist.push(book);
      await user.save(); // Save the updated wishlist to the database
      res.status(200).json({ message: "Book added to wishlist" });
    } else {
      res.status(400).json({ message: "Book is already in your wishlist" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error adding book to wishlist" });
  }
});

app.get('/:name/wishlist', async (req, res) => {
  const { name } = req.params;

  try {
    const user = await userModel.findOne({ name });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ wishlist: user.wishlist || [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});


app.delete('/wishlist/:name/remove', async (req, res) => {
  const { name } = req.params;
  const { bookId } = req.body;

  try {
    const user = await userModel.findOne({ name });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter out the book from wishlist
    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(book => book.id !== bookId);

    if (user.wishlist.length === initialLength) {
      return res.status(404).json({ message: "Book not found in wishlist" });
    }

    await user.save();
    res.status(200).json({ message: "Book removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Error removing from wishlist" });
  }
});


app.patch('/pay-fine/:username', async (req, res) => {
  const { username } = req.params;
  const { bookId } = req.body;

  try {
    const user = await userModel.findOne({ name: username });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const book = user.books.find(b => b.id === bookId);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    book.finePaid = true; // You don’t need book.fine = 0 — you calculate it dynamically

    await user.save();

    res.json({ success: true, bookTitle: book.title });
  } catch (err) {
    console.error("Error in /pay-fine:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


  

app.listen(3000,()=>{
    console.log("server started");
})