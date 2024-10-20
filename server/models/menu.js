const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: String,
    price: Number,
    tags : [String]
  });
  
const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
  