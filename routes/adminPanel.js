const express=require('express');
const router=express.Router();


const bookModel=require("../models/Books");
const userModel=require("../models/Users");

let authors = [{ email: "admin1@gmail.com", password: "12345" }];


router.get("/",(req,res)=>{
  res.render("adminLogin");
})

router.get("/dashboard/users",async(req,res)=>{
  let users=await userModel.find();
  // console.log(users);
  res.json(users);
})

router.get("/dashboard/users/:id",async(req,res)=>{
  const user=await userModel.findOne({id:req.params.id});
  if(!user){
    res.send("No user with this id");
  }
  res.status(200).json(user); 
})

router.delete("/delete/:id", async (req, res) => {
  try {
    // Use the user model to delete a user from the database
    const user = await userModel.findOneAndDelete({id:req.params.id});

    if (!user) {
      console.log(`No user with ID: ${req.params.id}`);
      return res.status(404).json({ message: "No user with this ID" }); // Return 404 if user is not found
    }

    console.log(`User with ID ${req.params.id} deleted successfully.`);
    res.json({ message: "User deleted successfully" }); // Return a success message
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "An error occurred while deleting the user." }); // Return a 500 error if something goes wrong
  }
});




router.get("/dashboard/Allbooks",async(req,res)=>{
  //  res.render("adminBooks",{books});
  let books=await bookModel.find();
  res.json(books);
})

router.delete("/delete/book/:id", async (req, res) => {
  try {
    // Find and delete the book by its id (which is the custom 'id' field)
    const book = await bookModel.findOneAndDelete({ id: req.params.id });

    if (!book) {
      console.log(`No book with ID: ${req.params.id}`);
      return res.status(404).json({ message: "No book with this ID" }); // Return 404 if no book is found
    }

    console.log(`Book with ID ${req.params.id} deleted successfully.`);
    res.json({ message: "Book deleted successfully" }); // Return a success message
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "An error occurred while deleting the book." }); // Return a 500 error if something goes wrong
  }
});



router.post("/dashboard", (req, res) => {
  const { email, password } = req.body;

  const author = authors.find((u) => u.email === email && u.password === password);

  if (!author) {
    // Return JSON error instead of HTML
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Successful login
  res.status(200).json({ message: "Login successful" });
});


router.post("/submitBook", async (req, res) => {
  const { id, title, image, author } = req.body;

  // Check if title, author, or id are missing
  if (!title || !author || !id) {
      return res.status(400).send({
          message: "Title, Author, and ID are required!",
          status: "error"
      });
  }

  // Check if the book with the same title already exists
  const existingBook = await bookModel.findOne({ title });
  if (existingBook) {
      return res.status(400).send({
          message: "Book with this title already exists!",
          status: "error"
      });
  }

  // Create the new book
  let newBook = await bookModel.create({
      id, title, image, author
  });

  // Fetch the updated list of books
  const books = await bookModel.find();

  // Send the success response
  res.status(200).send({
      message: "Book added successfully!",
      status: "success",
      books: books
  });
});

 

module.exports=router;