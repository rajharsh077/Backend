const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: Number,
  name: String,
  email: {
  type: String,
  required: true,
  unique: true,
},
  password: String,
  phone: Number,

  books: [
    {
      id: Number,
      title: String,
      author: String,
      image: String,
      lentDate: {
        type: Date,
        default: Date.now,
      },
      finePaid: {
        type: Boolean,
        default: false,
      }
    }
  ],

  wishlist: [
    {
      id: Number,
      title: String,
      author: String,
      image: String,
    }
  ]
},{ timestamps: true });

module.exports = mongoose.model("users", userSchema);
