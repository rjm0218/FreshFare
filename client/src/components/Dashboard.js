import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './components.css';
import {api} from '../axios_config.js';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  // State for dietary restrictions, favorite cuisine, and allergies
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [favoriteCuisine, setFavoriteCuisine] = useState('');
  const [allergies, setAllergies] = useState([]);

  const handleNavigation = (route) => {
    navigate(`/dashboard/${route}`);
  };

  const handleDietaryChange = (event) => {
    const { value, checked } = event.target;
    setDietaryRestrictions(current => 
      checked ? [...current, value] : current.filter(diet => diet !== value)
    );
  };

  const handleCuisineChange = (event) => {
    setFavoriteCuisine(event.target.value);
  };

  const handleAllergyChange = (event) => {
    const { value, checked } = event.target;
    setAllergies(current =>
      checked ? [...current, value] : current.filter(allergy => allergy !== value)
    );
  };
  
	useEffect(() => {
		getUserData();
	}, []);

  const getUserData = async () => {
    try {
      const username = localStorage.getItem('username');
      console.log(username);
      const response = await api.post('api/auth/getUserDetails', { username});
      if (response.status === 200) {
        const diet = response.data.diet;
		const allergy = response.data.allergy;
		const cuisine = response.data.cuisine;
		setDietaryRestrictions(diet); // Update state
        setAllergies(allergy); // Update state
		setFavoriteCuisine(cuisine); // Update state
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching grocery items:', error.message);
    }
  };

  const handleSave = () => {
    // Logic to save dietary restrictions, favorite cuisine, and allergies
    console.log('Saving Profile Data:');
    console.log('Dietary Restrictions:', dietaryRestrictions);
    console.log('Favorite Cuisine:', favoriteCuisine);
    console.log('Allergies:', allergies);
    // Implement actual save logic here
		const username = localStorage.getItem('username');
		try {
			const response = api.post('api/auth/updateUserDetails', { username, dietaryRestrictions, allergies, favoriteCuisine });
			if (response === null) {
				console.log('Failed to update user preferences in database.');
			}
		} catch (error) {
			console.error('Login failed:', error.response ? error.response.data : 'No response');
		}
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <nav className="dashboard-nav">
          <ul>
            <li><button className="component-button" onClick={() => handleNavigation('inventory')}>Inventory</button></li>
            <li><button className="component-button" onClick={() => handleNavigation('grocery-list')}>Groceries</button></li>
            <li><button className="component-button" onClick={() => handleNavigation('recipes')}>Recipes</button></li>
            {/* Add more navigation items as needed */}
          </ul>
        </nav>
        <button className="logout-button" onClick={onLogout}>Logout</button>
      </div>
      <div className="dashboard-content">
        <h1 style={{ color: 'black'}}>Welcome to the Dashboard, {username}</h1>

        <div className="user-profile">
          <div><h2>Your Profile</h2></div>
          <div><p><strong>Username:</strong> {username}</p></div>

          <div className="profile-sections">
            <div className="profile-section">
              <h3>Dietary Restrictions</h3>
              <div><label><input type="checkbox" value="Vegetarian" onChange={handleDietaryChange} checked={dietaryRestrictions.includes('Vegetarian')} /> Vegetarian</label></div>
              <div><label><input type="checkbox" value="Vegan" onChange={handleDietaryChange} checked={dietaryRestrictions.includes('Vegan')} /> Vegan</label></div>
              <div><label><input type="checkbox" value="Halal" onChange={handleDietaryChange} checked={dietaryRestrictions.includes('Halal')} /> Halal</label></div>
              <div><label><input type="checkbox" value="Kosher" onChange={handleDietaryChange} checked={dietaryRestrictions.includes('Kosher')} /> Kosher</label></div>
              <div><label><input type="checkbox" value="Lactose-Free" onChange={handleDietaryChange} checked={dietaryRestrictions.includes('Lactose-Free')} /> Lactose-Free</label></div>
              <div><label><input type="checkbox" value="Sugar-Free" onChange={handleDietaryChange} checked={dietaryRestrictions.includes('Sugar-Free')} /> Sugar-Free</label></div>
              <div><label><input type="checkbox" value="Paleo" onChange={handleDietaryChange} checked={dietaryRestrictions.includes('Paleo')} /> Paleo</label></div>
              <div><label><input type="checkbox" value="Keto" onChange={handleDietaryChange} checked={dietaryRestrictions.includes('Keto')} /> Keto</label></div>
            </div>
            <div className="profile-section">
              <h3>Allergies</h3>
              <div><label><input type="checkbox" value="Nuts" onChange={handleAllergyChange} checked={allergies.includes('Nuts')} /> Nuts</label></div>
              <div><label><input type="checkbox" value="Dairy" onChange={handleAllergyChange} checked={allergies.includes('Dairy')} /> Dairy</label></div>
              <div><label><input type="checkbox" value="Eggs" onChange={handleAllergyChange} checked={allergies.includes('Eggs')} /> Eggs</label></div>
              <div><label><input type="checkbox" value="Seafood" onChange={handleAllergyChange} checked={allergies.includes('Seafood')} /> Seafood</label></div>
              <div><label><input type="checkbox" value="Soy" onChange={handleAllergyChange} checked={allergies.includes('Soy')} /> Soy</label></div>
              <div><label><input type="checkbox" value="Wheat" onChange={handleAllergyChange} checked={allergies.includes('Wheat')} /> Wheat</label></div>
              
            </div>
          </div>

          <div>
            <h3>Favorite Cuisine</h3>
            <select value={favoriteCuisine} onChange={handleCuisineChange}>
            <option value="">Select Cuisine</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Chinese">Chinese</option>
              <option value="Indian">Indian</option>
            </select>
          </div>
        </div>
        <button onClick={handleSave} className="saveButton">Save</button>
      </div>
      <div className="footer-image"></div>
    </div>
  );
}

export default Dashboard;
