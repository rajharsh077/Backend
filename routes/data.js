const express=require('express');
const router=express.Router();
let booksArray = [
    {
        id:1,
        title:"Rich Dad Poor Dad",
        image:"https://omahreview.com/wp-content/uploads/2021/12/rich-dad-poor-dad-1-6048b169d541df531d47f612.jpg",
        author:"Robert T.Kiyosaki"
    },{
        id:2,
        title:"Think Again",
        image:"https://addictbooks.com/wp-content/uploads/2023/04/2-4-300x300.jpg",
        author:"Adam Grant"
    },{
        id:1,
        title:"It Ends With Us",
        image:"https://tse3.mm.bing.net/th?id=OIP.IOzkaD4OzmkCWUMmOh42AQHaEK&pid=Api&P=0&h=220",
        author:"Colleen Hoover"
    }
];
module.exports=booksArray;