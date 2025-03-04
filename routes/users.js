const express=require('express');
const router=express.Router();

router.get('/',(req,res)=>{
    res.send("You are not an admin sorry");
})

module.exports=router;