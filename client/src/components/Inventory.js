import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './components.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {api} from '../axios_config.js';


function Inventory() {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [boughtDate, setBoughtDate] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState('');
  useEffect(() => {
    const { pathname } = location;
    setActivePage(pathname.substring(1)); // Remove the leading '/'
    console.log('Active Page:', activePage); // Log the activePage state value
  }, [location, activePage]);



  const handleNavigation = (route) => {
    console.log("Navigating to:", route);
    if (route) {
      navigate(`/dashboard/${route}`);
    } else {
      navigate('/dashboard');
    }
  };

  const getUserData = async () => {
    const username = localStorage.getItem('username');
    try {
      const response = await api.post('api/auth/inventory', { username });
      if (response != null) {
        let data = response.data.user;
        if (data != null) {
          let items_found = [];
          for (let i = 0; i < data.freezer.length; i++) {
            data.freezer[i].expirationDate = new Date(data.freezer[i].expirationDate);
            items_found.push(data.freezer[i]);
          }
          for (let i = 0; i < data.refrig.length; i++) {
            data.refrig[i].expirationDate = new Date(data.refrig[i].expirationDate);
            items_found.push(data.refrig[i]);
          }
          for (let i = 0; i < data.pantry.length; i++) {
            data.pantry[i].expirationDate = new Date(data.pantry[i].expirationDate);
            items_found.push(data.pantry[i]);
          }
          setItems(items_found);
        }
      }
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : 'No response');
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleAddItem = () => {
    const expirationDate = calculateExpirationDate(boughtDate, category, subcategory);

    const newItem = {
      _id: Math.random().toString(36).substr(2, 9),
      name: itemName,
      quantity,
      category,
      subcategory,
      expirationDate,
    };

    setItems([...items, newItem]);

    setItemName('');
    setQuantity('');
    setCategory('');
    setSubcategory('');
    setBoughtDate(new Date());

    const user_name = localStorage.getItem('username');
    // Send a POST request to your backend server to save the item to the database
    api.post('api/auth/addToInventory', { user_name, newItem })
      .then(response => {
        console.log('Item added to grocery list:', response.data);
        // Optionally, update state or trigger any other actions
      })
      .catch(error => {
        console.error('Error adding item to grocery list:', error);
        // Handle error appropriately
      });

  };

  const calculateExpirationDate = (boughtDate, category, subcategory) => {
    // Calculate expiration date based on bought date, category, and subcategory
    let expirationDate = new Date(boughtDate);

    const expirationDays = {
      // Refrigerator items
      'Ground Meat, Ground Poultry, and Stew Meat': 2, // 1-2 days
      'Fresh Meat (Beef, Veal, Lamb, and Pork)': 5, // 3-5 days
      'Variety meats (Tongue, kidneys, liver, heart, chitterlings)': 2, // 1-2 days
      'Fresh Poultry': 2, // 1-2 days
      'Bacon and Sausage': 7, // 7 days
      'Ham, Corned Beef': 5, // 3-5 days
      'Hot Dogs and Luncheon Meats': 7, // 1 week
      'Deli and Vacuum-Packed Products': 5, // 3-5 days
      'Cooked Meat, Poultry, and Fish Leftovers': 4, // 3-4 days
      'Soups and Stews': 4, // 3-4 days
      'Fresh Fish and Shellfish': 2, // 1-2 days
      'Eggs': 35, // 3-5 weeks

      // Pantry items
      'Canned ham (shelf-stable)': 1825, // 2 to 5 years
      'Low-acid canned goods': 1825, // 2 to 5 years
      'High-acid canned goods': 540, // 12 to 18 months
      'Home canned foods': 365, // 12 months
      'Jerky, commercially packaged': 365, // 12 months
      'Jerky, home-dried': 60, // 1 to 2 months
      'Hard/dry sausage': 42, // 6 weeks in pantry
      'USDA Dried Egg Mix': 456, // Store below 50 °F, preferably refrigerated, for 12 to 15 months
      'Dried egg whites': 365, // Unopened dried egg products and egg white solids can be stored at room temperature
      'MRE\'s (Meal, Ready to Eat)': 2555, // 120 °F, 1 month to 60 °F, 7 years
      'Tuna and other seafood in retort pouches': 540, // 18 months
      'Meat or poultry products in retort pouches': 540, // Use manufacturer's recommendation on the package
      'Rice and dried pasta': 730, // 2 years

      // Freezer items
      'Bacon and Sausage(Freezer)': 60, // 1 to 2 months
      'Casseroles': 90, // 2 to 3 months
      'Eggs(Freezer)': 365, // 12 months
      'Frozen Dinners and Entrees': 120, // 3 to 4 months
      'Gravy, meat or poultry': 90, // 2 to 3 months
      'Ham, Hotdogs and Lunchmeats': 60, // 1 to 2 months
      'Meat, uncooked roasts': 365, // 4 to 12 months
      'Meat, uncooked steaks or chops': 365, // 4 to 12 months
      'Meat, uncooked ground': 120, // 3 to 4 months
      'Meat, cooked': 90, // 2 to 3 months
      'Poultry, uncooked whole': 365, // 12 months
      'Poultry, uncooked parts': 270, // 9 months
      'Poultry, uncooked giblets': 90, // 3 to 4 months
      'Poultry, cooked': 120, // 4 months
      'Soups and Stews(Freezer)': 90, // 2 to 3 months
      'Wild game, uncooked': 365, // 8 to 12 months
    };

    // Set expiration date based on subcategory
    if (subcategory && expirationDays.hasOwnProperty(subcategory)) {
      expirationDate.setDate(expirationDate.getDate() + expirationDays[subcategory]);
    } else if (category === 'Freezer' && expirationDays.hasOwnProperty(subcategory)) {
      expirationDate.setDate(expirationDate.getDate() + expirationDays[subcategory]);
    } else if (category === 'Pantry' && expirationDays.hasOwnProperty(subcategory)) {
      expirationDate.setDate(expirationDate.getDate() + expirationDays[subcategory]);
    } else if (category === 'Refrigerator' && expirationDays.hasOwnProperty(subcategory)) {
      expirationDate.setDate(expirationDate.getDate() + expirationDays[subcategory]);
    } else {
      // Default expiration date for unknown categories
      expirationDate.setDate(expirationDate.getDate() + 7);
    }

    return expirationDate;
  };


  const handleDeleteItem = (id) => {
    const updatedItems = items.filter((item) => item._id !== id);
    setItems(updatedItems);

    const itemToRemove = items.filter((item) => item._id === id);
    if (itemToRemove.length > 1) {
      console.log("Found more than 1 item with id = " + id);
      return;
    }
    let itrm = itemToRemove[0];

    const user_name = localStorage.getItem('username');
    // Send a POST request to your backend server to save the item to the database
    api.post('api/auth/removeFromInventory', { user_name, itrm })
      .then(response => {
        console.log('Item removed from inventory list:', response.data);
        // Optionally, update state or trigger any other actions
      })
      .catch(error => {
        console.error('Error removing item from inventory list:', error);
        // Handle error appropriately
      });


  };

  const handleAddToGroceryList = (id) => {
    const selectedItem = items.find((item) => item._id === id);
    const item = {
      name: selectedItem.name,
      quantity: selectedItem.quantity,
      category: selectedItem.category,
      subcategory: selectedItem.subcategory,
      boughtDate: selectedItem.expirationDate
    };
    const user_name = localStorage.getItem('username');
    // Send a POST request to your backend server to save the item to the database
    api.post('api/auth/addToGroceryList', { user_name, item })
      .then(response => {
        console.log('Item added to grocery list:', response.data);
        // Optionally, update state or trigger any other actions
      })
      .catch(error => {
        console.error('Error adding item to grocery list:', error);
        // Handle error appropriately
      });
  };
  const getExpirationStatus = (expirationDate) => {
    const today = new Date();
    const timeDifference = (new Date(expirationDate)).getTime() - today.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    if (daysDifference <= 0) {
      return 'expired';
    } else if (daysDifference <= 7) {
      return 'soon-to-expire';
    } else {
      return 'good';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <nav className="dashboard-nav">
          <ul>
            <li>
              <button className={`component-button ${activePage === 'dashboard/inventory' ? 'active' : ''}`} onClick={() => handleNavigation('inventory')}>Inventory</button>
            </li>
            <li>
              <button className={`component-button ${activePage === 'dashboard/grocery-list' ? 'active' : ''}`} onClick={() => handleNavigation('grocery-list')}>Groceries</button>
            </li>
            <li>
              <button className={`component-button ${activePage === 'dashboard/recipes' ? 'active' : ''}`} onClick={() => handleNavigation('recipes')}>Recipes</button>
            </li>
          </ul>
          <Link to="/dashboard" className="dashboard-link">Go to Dashboard</Link>
        </nav>
      </div>

      <div className="dashboard-content inventory-content">
        <h1>Inventory</h1>
        <div className="inventory-form">
          <input
            className="inventory-input"
            type="text"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            className="inventory-input"
            type="text"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <select
            className="inventory-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Refrigerator">Refrigerator</option>
            <option value="Pantry">Pantry</option>
            <option value="Freezer">Freezer</option>
          </select>
          {category === 'Freezer' && (
            <select
              className="inventory-select"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            >
              <option value="">Select Subcategory</option>
              <option value="Bacon and Sausage(Freezer)">Bacon and Sausage</option>
              <option value="Casseroles">Casseroles</option>
              <option value="Eggs(Freezer)">Eggs</option>
              <option value="Frozen Dinners and Entrees">Frozen Dinners and Entrees</option>
              <option value="Gravy, meat or poultry">Gravy, meat or poultry</option>
              <option value="Ham, Hotdogs and Lunchmeats">Ham, Hotdogs and Lunchmeats</option>
              <option value="Meat, uncooked roasts">Meat, uncooked roasts</option>
              <option value="Meat, uncooked steaks or chops">Meat, uncooked steaks or chops</option>
              <option value="Meat, uncooked ground">Meat, uncooked ground</option>
              <option value="Meat, cooked">Meat, cooked</option>
              <option value="Poultry, uncooked whole">Poultry, uncooked whole</option>
              <option value="Poultry, uncooked parts">Poultry, uncooked parts</option>
              <option value="Poultry, uncooked giblets">Poultry, uncooked giblets</option>
              <option value="Poultry, cooked">Poultry, cooked</option>
              <option value="Soups and Stews(Freezer)">Soups and Stews</option>
              <option value="Wild game, uncooked">Wild game, uncooked</option>
              <option value="Other">Other</option>
            </select>
          )}
          {category === 'Pantry' && (
            <select
              className="inventory-select"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            >
              <option value="">Select Subcategory</option>
              <option value="Canned ham (shelf-stable)">Canned ham (shelf-stable)</option>
              <option value="Low-acid canned goods">Low-acid canned goods</option>
              <option value="High-acid canned goods">High-acid canned goods</option>
              <option value="Home canned foods">Home canned foods</option>
              <option value="Jerky, commercially packaged">Jerky, commercially packaged</option>
              <option value="Jerky, home-dried">Jerky, home-dried</option>
              <option value="Hard/dry sausage">Hard/dry sausage</option>
              <option value="USDA Dried Egg Mix">USDA Dried Egg Mix</option>
              <option value="Dried egg whites">Dried egg whites</option>
              <option value="MRE's (Meal, Ready to Eat)">MRE's (Meal, Ready to Eat)</option>
              <option value="Tuna and other seafood in retort pouches">Tuna and other seafood in retort pouches</option>
              <option value="Meat or poultry products in retort pouches">Meat or poultry products in retort pouches</option>
              <option value="Rice and dried pasta">Rice and dried pasta</option>
              <option value="Other">Other</option>

            </select>
          )}
          {category === 'Refrigerator' && (
            <select
              className="inventory-select"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            >
              <option value="">Select Subcategory</option>
              <option value="Ground Meat, Ground Poultry, and Stew Meat">Ground Meat, Ground Poultry, and Stew Meat</option>
              <option value="Fresh Meat (Beef, Veal, Lamb, and Pork)">Fresh Meat (Beef, Veal, Lamb, and Pork)</option>
              <option value="Variety meats (Tongue, kidneys, liver, heart, chitterlings)">Variety meats (Tongue, kidneys, liver, heart, chitterlings)</option>
              <option value="Fresh Poultry">Fresh Poultry</option>
              <option value="Bacon and Sausage">Bacon and Sausage</option>
              <option value="Ham, Corned Beef">Ham, Corned Beef</option>
              <option value="Hot Dogs and Luncheon Meats">Hot Dogs and Luncheon Meats</option>
              <option value="Deli and Vacuum-Packed Products">Deli and Vacuum-Packed Products</option>
              <option value="Cooked Meat, Poultry, and Fish Leftovers">Cooked Meat, Poultry, and Fish Leftovers</option>
              <option value="Soups and Stews">Soups and Stews</option>
              <option value="Fresh Fish and Shellfish">Fresh Fish and Shellfish</option>
              <option value="Eggs">Eggs</option>
              <option value="Other">Other</option>

            </select>
          )}
          <DatePicker
            selected={boughtDate}
            onChange={(date) => setBoughtDate(date)}
            className="inventory-input-datepicker"
            placeholderText="Bought on Date"
          />
          <button className="inventory-button" onClick={handleAddItem}>Add Item</button>
        </div>

        <div className="inventory-list">
          <h3>Refrigerator</h3>
          <ul>
            {items.filter(item => item.category === 'Refrigerator').map(item => (
              <li key={item._id} className={`item ${getExpirationStatus(item.expirationDate)}`}>
                <span>{item.name} - {item.quantity} - Expiry: {item.expirationDate.toLocaleDateString()}</span>
                <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
                <button onClick={() => handleAddToGroceryList(item._id)}>Add to Grocery List</button>
              </li>
            ))}
          </ul>

          <h3>Pantry</h3>
          <ul>
            {items.filter(item => item.category === 'Pantry').map(item => (
              <li key={item._id} className={`item ${getExpirationStatus(item.expirationDate)}`}>
                <span>{item.name} - {item.quantity} - Expiry: {item.expirationDate.toLocaleDateString()}</span>
                <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
                <button onClick={() => handleAddToGroceryList(item._id)}>Add to Grocery List</button>
              </li>
            ))}
          </ul>

          <h3>Freezer</h3>
          <ul>
            {items.filter(item => item.category === 'Freezer').map(item => (
              <li key={item._id} className={`item ${getExpirationStatus(item.expirationDate)}`}>
                <span>{item.name} - {item.quantity} - Expiry: {item.expirationDate.toLocaleDateString()}</span>
                <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
                <button onClick={() => handleAddToGroceryList(item._id)}>Add to Grocery List</button>
              </li>
            ))}
          </ul>
        </div>


      </div>
      <div className="footer-image"></div>
    </div>
  );
}



export default Inventory;
