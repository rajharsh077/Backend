const express=require('express');
const router=express.Router();
let usersArray = [{
    id:1,
    name:"Harsh",
    email:"harsh@gmail.com",
    password:12345,
    phone:6200839559,
    books:[]
},{
    id:2,
    name:"HarshVardhan",
    email:"harshvardhan@gmail.com",
    password:12345,
    phone:7814055324,
    books:[]
},{
    id:3,
    name:"Navneet",
    email:"navneet@gmail.com",
    password:12345,
    phone:8091247228,
    books:[]
},{
    id:4,
    name:"Hritvik",
    email:"hritvik@gmail.com",
    password:12345,
    phone:8988032000,
    books:[]
}];
module.exports=usersArray;