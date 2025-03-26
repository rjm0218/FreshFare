const mongoose = require('mongoose');

// Grocery item model
const inventorySchema = new mongoose.Schema({
    username: { type: String, required: true},
    freezer: { type: Array, required: false},
	pantry: { type: Array, required: false},
	refrig: { type: Array, required: false},
}, {collection: 'inventory'});

inventorySchema.pre('save', async function(next) {
    next();
});

const InventoryList = mongoose.model('InventoryList', inventorySchema);

module.exports = InventoryList;