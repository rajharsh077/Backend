const mongoose=require('mongoose');

const bookSchema=new mongoose.Schema({
    id:Number,
    title:String,
    image:String,
    author:String
})

module.exports=new mongoose.model("books",bookSchema);