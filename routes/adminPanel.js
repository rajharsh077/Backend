const express=require('express');
const router=express.Router();
const users=require("./UserData");

let authors = [{ email: "admin1@gmail.com", password: "12345" }];

const books=require("./data");

router.get("/",(req,res)=>{
  res.render("adminLogin");
})

router.get("/dashboard/users",(req,res)=>{
  res.json(users);
})

router.get("/dashboard/users/:id",(req,res)=>{
  const user=users.find((u)=>u.id==req.params.id);
  res.json(user);
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


router.get("/dashboard/Allbooks",(req,res)=>{
  //  res.render("adminBooks",{books});
  res.json(books);
})

router.post("/dashboard",(req,res)=>{
  const {email,password}=req.body;

  const author=authors.find((u)=>u.email==email && u.password==password);

  if(!author){
    return res.send("<h3 style='color:red;'>Invalid email or password. <a href='/admin'>Try Again</a></h3>");
  }
  res.render("adminDashboard");
})

 router.post("/submitBook",(req,res)=>{
    const {id,title,image,author}=req.body;

    if (!title || !author || !id) {
        return res.send("<h3 style='color:red;'>Title and Author are required! <a href='/author'>Go Back</a></h3>");
    }

    const existingBook = books.find((b) => b.id === id);
    if (existingBook) {
        return res.send("<h3 style='color:red;'>Book ID already exists! <a href='/admin/dashboard'>Go Back</a></h3>");
    }

    books.push({ id,title,image,author });
    console.log(books);

  //  res.render("adminDashboard",{books});
  res.json(books);
    // res.send(`<h3 style='color:green;'>Book added successfully! <a href='/books'>Show Books</a>  <a href="/admin/dashboard"></a></h3> `);
})

 

module.exports=router;