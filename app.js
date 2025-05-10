const express=require('express');
const app=express();
const path=require('path');
const cors=require('cors');

app.use(cors());

const bcrypt=require('bcrypt');

const userModel=require('./models/Users');
const bookModel=require('./models/Books');

const connectDB = require('./config/db');

const booksRouter = require("./routes/books");
const userRouter=require("./routes/users");
const adminRouter=require("./routes/adminPanel");

const { authenticateJWT,generateToken } = require("./middlewares/authMiddleware");


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

  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      console.error("Error comparing passwords:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!result) {
      return res.status(401).json({ message: "Wrong password" });
    }
    const payload={
      email:email,
      name:user.name,
      role:user.role
    }
    const token=generateToken(payload);
    res.status(200).json({ message: "Login success", name: user.name,token:token });
  });
});


app.post("/lend", authenticateJWT, async (req, res) => {
  const { bookId } = req.body;  // Get the bookId from the request body

  try {
    // Find the user using the email from the JWT payload
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the book by its ID
    const book = await bookModel.findOne({ id: bookId });
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Check if the book is already lent to the user
    const alreadyLent = user.books.find(b => b.id === book.id);
    if (alreadyLent) {
      return res.status(400).json({ message: "You have already lent this book." });
    }

    // Add the book with the lent date
    user.books.push({
      id: book.id,
      title: book.title,
      author: book.author,
      image: book.image,
      lentDate: new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
    });

    // Save the user with the updated book information
    await user.save();

    res.status(200).json({ message: "Book successfully lent!" });
  } catch (err) {
    console.error("Error in /lend route:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




app.delete('/return',authenticateJWT, async (req, res) => {
  const userEmail = req.user.email;
  const { bookId } = req.body;

  try {
    const user = await userModel.findOne({ email: email });

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

app.get("/lent", authenticateJWT, async (req, res) => {
  const { email } = req.user;  // Get the email from the JWT payload
  
  try {
    // Find the user by their email (from the JWT token)
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    // Map over the user's books to calculate fines
    const booksWithFines = user.books.map((book) => {
      const lentDate = book.lentDate ? new Date(book.lentDate) : null;

      let daysLent = 0;
      let fine = 0;

      if (lentDate) {
        // Normalize dates to remove time part
        const lentOnly = new Date(lentDate.getFullYear(), lentDate.getMonth(), lentDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const diffInTime = todayOnly - lentOnly;
        daysLent = Math.floor(diffInTime / (1000 * 60 * 60 * 24)); // Calculate days lent
        fine = daysLent > 30 ? (daysLent - 30) * 2 : 0; // Fine calculation
      }

      return {
        ...(book.toObject?.() || book),
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

    // Hash the password using callbacks
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        console.error("Salt generation error:", err);
        return res.status(500).json({ message: "Error generating salt" });
      }

      bcrypt.hash(password, salt, async function(err, hash) {
        if (err) {
          console.error("Hashing error:", err);
          return res.status(500).json({ message: "Error hashing password" });
        }

        // Create new user inside the hash callback
        try {
          const newUser = await userModel.create({
            id: userCount + 1,
            name,
            email,
            password: hash, // use hashed password
            phone,
            books: [],
            wishlist: [],
          });
          const payload={
            email:email,
            name:name,
          }

          const token=generateToken(payload);

          res.status(201).json({ message: "User signed up successfully", user: newUser,token:token });
        } catch (createErr) {
          console.error("User creation error:", createErr);
          res.status(500).json({ message: "Error creating user" });
        }
      });
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




app.post('/wishlist', authenticateJWT, async (req, res) => {
  const { book } = req.body;

  try {
    const user = await userModel.findOne({ email: req.user.email }); // Use email from JWT

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.wishlist.some((b) => b.id === book.id)) {
      user.wishlist.push(book);
      await user.save();
      res.status(200).json({ message: `Book "${book.title}" added to wishlist` });
    } else {
      res.status(400).json({ message: `Book "${book.title}" is already in your wishlist` });
    }
  } catch (err) {
    console.error("Error adding book to wishlist:", err);
    res.status(500).json({ message: "Error adding book to wishlist", error: err.message });
  }
});


app.get('/wishlist', authenticateJWT, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }); // Secure lookup via JWT
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ wishlist: user.wishlist || [] });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});



// Backend - more secure and cleaner
app.delete('/wishlist/remove', authenticateJWT, async (req, res) => {
  const { bookId } = req.body;

  try {
    const user = await userModel.findOne({ email: req.user.email }); // from JWT

    if (!user) return res.status(404).json({ message: "User not found" });

    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(book => book.id !== bookId);

    if (user.wishlist.length === initialLength) {
      return res.status(404).json({ message: "Book not found in wishlist" });
    }

    await user.save();
    res.status(200).json({ message: "Book removed from wishlist" });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.status(500).json({ message: "Error removing from wishlist" });
  }
});


app.patch('/pay-fine', authenticateJWT, async (req, res) => {
  const { bookId } = req.body;

  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const book = user.books.find(b => b.id === bookId);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    book.finePaid = true;
    user.books = user.books.filter(b => b.id !== bookId);
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