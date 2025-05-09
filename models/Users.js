const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: Number,
  name: String,
  email: String,
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
});

module.exports = mongoose.model("users", userSchema);
