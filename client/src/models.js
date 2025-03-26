const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  category: String,
  subcategory: String,
  expirationDate: Date,
});

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;