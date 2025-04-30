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
  res.json(users);
})

router.get("/dashboard/users/:id",async(req,res)=>{
  const user=await userModel.findOne({id:req.params.id});
  if(!user){
    res.send("No user with this id");
  }
  res.status(200).json(user); 
})

router.get("/delete/:id",(req,res)=>{
       let i=0;
       let userIndex=users.findIndex((user)=>user.id==req.params.id);
        if(userIndex==-1){
          return res.status(404).send("No user with this ID");
        }

          users.splice(userIndex,1);
          res.json(users);
       
})


router.get("/dashboard/Allbooks",async(req,res)=>{
  //  res.render("adminBooks",{books});
  let books=await bookModel.find();
  res.json(books);
})

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