const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GroceryItem = require('../models/GroceryItem');
const GroceryList = require('../models/GroceryList');
const InventoryList = require('../models/InventoryList');
const cors = require('cors');
const bodyParser = require('body-parser');

const router = express.Router();

const corsOptions = {
	origin: true,
	credentials: true
}

// Middlewares
router.use(cors());
router.use(express.json());
router.use(bodyParser.json());
router.options('*', cors(corsOptions));
router.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Content-Type', 'application/json; charset=utf-8')
  next();
});

// Register route
router.post('/register', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).send('User already registered.');
		
		user = await User.findOne({ username });
        if (user) return res.status(400).send('User already registered.');

        user = new User({ username, email, password });
        await user.save();
		
        const gList = new GroceryList({ username});
        await gList.save();

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Login route
router.post('/login', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send('Invalid username or password.');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid username or password.');

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.send({ user, token });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// get user route
router.post('/user', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    try {
        const { username } = req.body;
        const user = await User.findOne({ username },'inventory favorites');
        if (!user) return res.status(400).send('Invalid username.');
		console.log('Retrieved user:', username);
        res.send({ user});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// get user route
router.post('/inventory', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    try {
        const { username } = req.body;
        let user = await InventoryList.findOne({ username },'freezer pantry refrig');
        if (!user) {
			console.log("Creating new inventory for " + username + ".");
			const empty_list = [];
			const list = new InventoryList( { username: username});
			await list.save();
		}
		user = await InventoryList.findOne({ username },'freezer pantry refrig');
        res.send({ user});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// get user route
router.post('/addFav', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const { user_name, label } = req.body;
	try {
		const user = await User.findOne({ username: user_name });
		if (!user) return res.status(400).send('Invalid username.');
	} catch (error) {
		res.status(500).send(error.message);
	}
	
	User.updateOne({username: user_name},{ $addToSet: { favorites: label}}).then((result) => {
		console.log("Added Favorite");
	}).catch((err) => {
		console.log("Failed to Add Favorite");
	});

});

// get user route
router.post('/removeFav', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }

	const { user_name, label } = req.body;
	try {
		const user = await User.findOne({ username: user_name });
		if (!user) return res.status(400).send('Invalid username.');
	} catch (error) {
		res.status(500).send(error.message);
	}
	User.updateOne({username: user_name},{ $pull: { favorites: label}}).then((result) => {
		console.log("Removed Favorite");
	}).catch((err) => {
		console.log("Failed to Remove Favorite");
	});

});

// Routes
router.post('/addToGroceryList', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    const { user_name, item } = req.body;

	try {
		const user = await GroceryList.findOne({ username: user_name });
		if (!user) return res.status(400).send('Invalid username.');
	} catch (error) {
		res.status(500).send(error.message);
	}
	
    const newGroceryItem = await new GroceryItem( item ); // Changed variable name
    
	GroceryList.updateOne({username: user_name},{ $push: { inventory: newGroceryItem}}).then((result) => {
		console.log("Added item to " + user_name + " grocery list.");
	}).catch((err) => {
		console.log("Failed to add item to " + user_name + " grocery list.");
	});
});

// Routes
router.post('/removeFromGroceryList', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    const { user_name, itemname } = req.body;
	try {
		const user = await GroceryList.findOne({ username: user_name });
		if (!user) return res.status(400).send('Invalid username.');
	} catch (error) {
		res.status(500).send(error.message);
	}
    
	GroceryList.updateOne({username: user_name},{ $pull: { inventory: {name: itemname}}}).then((result) => {
		console.log("Removed item from " + user_name + " grocery list.");
	}).catch((err) => {
		console.log("Failed to remove item from " + user_name + " grocery list.");
	});
});

// Routes
router.post('/updateGroceryList', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    const { user_name, itemname, quantity } = req.body;
    try {
        // Check if the user exists
        const user = await GroceryList.findOne({ username: user_name });
        if (!user) {
            // No user found
            return res.status(404).send('User not found.');
        }

        // Attempt to update the item
        const result = await GroceryList.findOneAndUpdate(
            { username: user_name, 'inventory.name': itemname },
            { $set: {'inventory.$.quantity': quantity} },
            { new: true } // This returns the document after update was applied.
        );

        if (!result) {
            // No document was updated
            return res.status(404).send('Item not found in grocery list.');
        }

        // Successfully updated
        console.log("Updated item in " + user_name + "'s grocery list.");
        return res.status(200).send('Item updated successfully.');

    } catch (error) {
        // Handle unexpected errors
        console.error("Failed to update item in " + user_name + "'s grocery list.", error);
        return res.status(500).send('Error updating item in grocery list.');
    }
});

// Routes
router.post('/addToInventory', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    const { user_name, newItem } = req.body;	
	try {
		const user = await InventoryList.findOne({ username: user_name });
		if (!user) {
			console.log("Creating new inventory for " + user_name + ".");
			const empty_list = [];
			const list = new InventoryList( { username: user_name});
			await list.save();
		}
	} catch (error) {
		res.status(500).send(error.message);
	}
	
    const newGroceryItem = await new GroceryItem( newItem ); // Changed variable name
    
	if (newGroceryItem.category == 'Freezer') {
		InventoryList.updateOne({username: user_name},{ $push: { freezer: newGroceryItem}}).then((result) => {
			console.log("Added item to " + user_name + " freezer list.");
		}).catch((err) => {
			console.log("Failed to add item to " + user_name + " freezer list.");
		});
	} else if (newGroceryItem.category == 'Pantry') {
			InventoryList.updateOne({username: user_name},{ $push: { pantry: newGroceryItem}}).then((result) => {
			console.log("Added item to " + user_name + " pantry list.");
		}).catch((err) => {
			console.log("Failed to add item to " + user_name + " pantry list.");
		});
	} else {
		InventoryList.updateOne({username: user_name},{ $push: { refrig: newGroceryItem}}).then((result) => {
			console.log("Added item to " + user_name + " refrig list.");
		}).catch((err) => {
			console.log("Failed to add item to " + user_name + " refrig list.");
		});
	}
});

// Routes
router.post('/removeFromInventory', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    const { user_name, itrm } = req.body;	
	try {
		const user = await InventoryList.findOne({ username: user_name });
		if (!user) return res.status(400).send('Invalid username.');
	} catch (error) {
		res.status(500).send(error.message);
	}
	
    const rmItem = await new GroceryItem( itrm ); // Changed variable name
    
	if (rmItem.category == 'Freezer') {
		InventoryList.updateOne({username: user_name},{ $pull: { freezer: { name: rmItem.name}}}).then((result) => {
			console.log("Removed item from " + user_name + " freezer list.");
		}).catch((err) => {
			console.log("Failed to remove item from " + user_name + " freezer list.");
		});
	} else if (rmItem.category == 'Pantry') {
			InventoryList.updateOne({username: user_name},{ $pull: { pantry: { name: rmItem.name}}}).then((result) => {
			console.log("Removed item from " + user_name + " pantry list.");
		}).catch((err) => {
			console.log("Failed to remove item from " + user_name + " pantry list.");
		});
	} else {
		InventoryList.updateOne({username: user_name},{ $pull: { refrig: { name: rmItem.name}}}).then((result) => {
			console.log("Removed item from " + user_name + " refrig list.");
		}).catch((err) => {
			console.log("Failed to remove item from " + user_name + " refrig list.");
		});
	}
});

router.get('/groceryList/:username', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }

    const { username } = req.params;
    try {
        const groceryList = await GroceryList.findOne({ username });
        if (!groceryList) return res.status(404).send('Grocery list not found.');
        
        //extract only name and quantity from each grocery item
        const simplifiedList = groceryList.inventory.map(item => ({ name: item.name, quantity: item.quantity }));
        
        res.send(simplifiedList);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Routes
router.post('/updateUserDetails', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    const { username, dietaryRestrictions, allergies, favoriteCuisine } = req.body;
    
	User.findOneAndUpdate({username: username},{ $set : {diet : dietaryRestrictions, allergy: allergies, cuisine: favoriteCuisine} }).then((result) => {
		console.log("Updated " + username + " preferences.");
	}).catch((err) => {
		console.log("Failed to update " + username + " preferences.");
	});
});

// Routes
router.post('/getUserDetails', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    const { username } = req.body;
	console.log(username);
	try {
		const user = await User.findOne({ username: username },'diet allergy cuisine');
		if (!user) return res.status(400).send('Invalid username.');
		res.send(user)
	} catch (error) {
		res.status(500).send(error.message);
	}
	

});

module.exports = router;
