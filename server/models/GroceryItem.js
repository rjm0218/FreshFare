const mongoose = require('mongoose');

// Grocery item model
const grocerySchema = new mongoose.Schema({
    name: { type: String, required: true},
    quantity: { type: String, required: true},
    category: { type: String, required: true},
    subcategory: { type: String, required: true},
    expirationDate: { type: Date, required: true}
}, {collection: 'groceryitems'});

grocerySchema.pre('save', async function(next) {
    next();
});

const GroceryItem = mongoose.model('GroceryItem', grocerySchema);

module.exports = GroceryItem;