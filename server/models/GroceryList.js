const mongoose = require('mongoose');

// Grocery item model
const groceryListSchema = new mongoose.Schema({
    username: { type: String, required: true},
    inventory: { type: Array, required: false},
}, {collection: 'groceryitems'});

groceryListSchema.pre('save', async function(next) {
    next();
});

const GroceryList = mongoose.model('GroceryList', groceryListSchema);

module.exports = GroceryList;