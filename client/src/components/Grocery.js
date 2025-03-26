import { useNavigate, Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './components.css';
import {api} from '../axios_config';



function Grocery() {
  const navigate = useNavigate();
  const [groceryItems, setGroceryItems] = useState([]);
  const location = useLocation();
  const [activePage, setActivePage] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  useEffect(() => {
    const { pathname } = location;
    setActivePage(pathname.substring(1)); // Remove the leading '/'
    console.log('Active Page:', activePage); // Log the activePage state value
  }, [location, activePage]);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const username = localStorage.getItem('username');
      console.log(username);
      const groceryItemsResponse = await api.get(`api/auth/groceryList/${username}`);
      if (groceryItemsResponse.status === 200) {
        const simplifiedList = groceryItemsResponse.data;
        setGroceryItems(simplifiedList); // Update state with the simplified list
      } else {
        console.error('Error:', groceryItemsResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching grocery items:', error.message);
    }
  };

  const handleNavigation = (route) => {
    console.log("Navigating to:", route);
    if (route) {
      navigate(`/dashboard/${route}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleIncrement = (index) => {
    const updatedItems = [...groceryItems];
    updatedItems[index].quantity = Number.parseInt(updatedItems[index].quantity) + 1;
    updateDB(updatedItems[index])
    setGroceryItems(updatedItems);
  };

  const handleDecrement = (index) => {
    const updatedItems = [...groceryItems];
    if (updatedItems[index].quantity > 0) {
      updatedItems[index].quantity = Number.parseInt(updatedItems[index].quantity) - 1;
      updateDB(updatedItems[index])
      setGroceryItems(updatedItems);
    }
  };

  const updateDB = (item) => {
    const itemname = item.name;
    const quantity = item.quantity;
    const user_name = localStorage.getItem('username');
    // Send a POST request to your backend server to save the item to the database
    api.post('api/auth/updateGroceryList', { user_name, itemname, quantity })
      .then(response => {
        console.log('Item added to grocery list:', response.data);
        // Optionally, update state or trigger any other actions
      })
      .catch(error => {
        console.error('Error adding item to grocery list:', error);
        // Handle error appropriately
      });
  }

  const handleDelete = (index) => {

    const itemname = groceryItems[index].name;
    const updatedItems = [...groceryItems];
    updatedItems.splice(index, 1);
    setGroceryItems(updatedItems);

    const user_name = localStorage.getItem('username');
    // Send a POST request to your backend server to save the item to the database
    api.post('api/auth/removeFromGroceryList', { user_name, itemname })
      .then(response => {
        console.log('Item added to grocery list:', response.data);
        // Optionally, update state or trigger any other actions
      })
      .catch(error => {
        console.error('Error adding item to grocery list:', error);
        // Handle error appropriately
      });
  };
  // eslint-disable-next-line 
  const handleAddItem = () => {

    const item = {
      _id: Math.random().toString(36).substr(2, 9),
      name: itemName,
      quantity: quantity,
      category: 'N/A',
      subcategory: 'N/A',
      expirationDate: new Date()
    };

    setGroceryItems([...groceryItems, item]);
    setItemName('');
    setQuantity('');

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
        </nav>
        <Link to="/dashboard" className="dashboard-link">Go to Dashboard</Link>
      </div>
      <div className="dashboard-content grocery-content">
        <h1>Grocery List</h1>
		<div className="grocery-form">
          <input
            className="grocery-input"
            type="text"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            className="grocery-input"
            type="text"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
			<button className="grocery-button" onClick={handleAddItem}>Add Item</button>
		</div>
        <ul>
          {groceryItems.map((item, index) => (
            <li key={index}>
              <div>Name: {item.name}</div>
              <div>Quantity: {item.quantity}</div>
              <button onClick={() => handleIncrement(index)}>+</button>
              <button onClick={() => handleDecrement(index)}>-</button>
              <button onClick={() => handleDelete(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer-image"></div>
    </div>
  );
}

export default Grocery;