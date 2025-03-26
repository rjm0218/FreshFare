import React, { useState, useEffect, useCallback } from 'react';
import './components.css';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import EDAMAM from '../Edamam_Badge_Light.svg';
import DairyFree from './HealthLabelIcons/dairy-free.png';
import GlutenFree from './HealthLabelIcons/gluten-free.png';
import EggFree from './HealthLabelIcons/egg-free.jpg';
import PeanutFree from './HealthLabelIcons/peanut-free.png';
import {api} from '../axios_config.js';


const baseURL = "https://api.edamam.com/api/recipes/v2?";


function Recipes() {

	const recPerPage = 8;
	const ingredListMax = 3;
	const ingredListMaxModal = 8;
	const fields = ['label', 'image', 'url', 'shareAs', 'yield', 'ingredients', 'calories', 'totalTime', 'healthLabels', 'dishType'];
	const healthLabelObjects = [
		{ name: 'Dairy-Free', icon: DairyFree },
		{ name: 'Gluten-Free', icon: GlutenFree },
		{ name: 'Egg-Free', icon: EggFree },
		{ name: 'Peanut-Free', icon: PeanutFree },
	];

	//possible fields
	//uri, label, image, images, source, url, shareAs, yield, dietLabels, healthLabels, cautions, ingredientLines
	//ingredients, calories, glycemicIndex, inflammatoryIndex, totalCOS2Emissions, co2EmissionsClass, totalWeight
	//totalTime, cusisineType, mealType, dishType, totalNutrients, totalDaily, digest, tags, externalId

	const [items, setItems] = useState([]);
	const [recipes, setRecipes] = useState([]);
	const [currentPage, setPage] = useState(1);
	const [pages, setPageCount] = useState(Array.from(Array(1).keys()));
	const [modal, setModal] = useState({ show: false, recipe: null });
	const [favorites, setFav] = useState([]);
	const [activePage, setActivePage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();


	useEffect(() => {
		const { pathname } = location;
		setActivePage(pathname.substring(1)); // Remove the leading '/'
		console.log('Active Page:', activePage); // Log the activePage state value
	}, [location, activePage]);

	const getUserData = useCallback(async () => {
		const defaultItems = ['chicken', 'steak', 'rice', 'beans'];

		const username = localStorage.getItem('username');
		try {
			const response = await api.post('api/auth/user', { username });
			if (response != null) {
				let data = response.data.user.favorites;
				if (data != null) {
					setFav(data);
				}
			}
		} catch (error) {
			console.error('Login failed:', error.response ? error.response.data : 'No response');
		}

		try {
			const response = await api.post('api/auth/inventory', { username });
			if (response != null) {
				let data = response.data.user;
				if (data != null) {
					let items_found = [];
					for (let i = 0; i < data.freezer.length; i++) {
						data.freezer[i].expirationDate = new Date(data.freezer[i].expirationDate);
						items_found.push(data.freezer[i].name);
					}
					for (let i = 0; i < data.refrig.length; i++) {
						data.refrig[i].expirationDate = new Date(data.refrig[i].expirationDate);
						items_found.push(data.refrig[i].name);
					}
					for (let i = 0; i < data.pantry.length; i++) {
						data.pantry[i].expirationDate = new Date(data.pantry[i].expirationDate);
						items_found.push(data.pantry[i].name);
					}
					if (items_found.length !== 0) {
						setItems(items_found);
					} else {
						setItems(defaultItems); //to ensure some recipes come up
					}
				}
			}
		} catch (error) {
			console.error('Login failed:', error.response ? error.response.data : 'No response');
		}

	}, []);
	
	useEffect(() => {
		getUserData();
	}, []);


	const handleNavigation = (route) => {
		console.log("Navigating to:", route);
		if (route) {
			navigate(`/dashboard/${route}`);
		} else {
			navigate('/dashboard');
		}
	};

	const createDetailsString = () => {

		var type = "type=any";

		var tag_str = "";
		for (var tag of items) {
			if (tag !== '') {
				tag_str += '&tag=' + tag;
			}
		}

		var field_str = "";
		for (var field of fields) {
			field_str += '&field=' + field;
		}

		var id_key = "&app_id=" + process.env.REACT_APP_API_ID + "&app_key=" + process.env.REACT_APP_API_KEY;

		var meal_types = "&mealType=Breakfast&mealType=Dinner&mealType=Lunch&mealType=Snack";

		return type + id_key + tag_str + meal_types + field_str;
	};




	useEffect(() => {
		if (items.length !== 0) {
			onebyOneCall();
		}
	}, [items]);

	async function onebyOneCall() {
		const details = createDetailsString();
		var request = baseURL + details;
		var data_found = [];
		do {
			let response = await fetch(request);

			if (response == null) {
				console.log('Error contacting the recipe database');
			}

			let results = await response.json();

			for (var i = 0; i < results.hits.length; i++) {
				data_found.push(results.hits[i].recipe);
			}
			if (data_found.length > 80) {
				break;
			}
			if (results._links.next != null) {
				request = results._links.next.href;
			} else {
				request = null;
			}
		} while (request != null);
		setRecipes(data_found);
		setPageCount(Array.from(Array(Math.ceil(data_found.length / recPerPage)).keys()))
	};

	const toggleFavorite = (recipe) => {
		let onOff = true;
		let div = document.querySelector('div.card-body div[id="' + recipe.label + '"]');
		let heart = div.querySelector('span.bi-heart')
		if (heart != null) {
			heart.classList.remove('bi-heart');
			heart.classList.add('bi-heart-fill');
			setFav([...favorites, recipe.label]);
		} else {
			onOff = false;
			let heart = div.querySelector('span.bi-heart-fill')
			if (heart != null) {
				heart.classList.add('bi-heart');
				heart.classList.remove('bi-heart-fill');
				const updatedFavs = favorites.filter((name) => name !== recipe.label);
				setFav(updatedFavs);
			}
		}
		updateDBFavs(recipe.label, onOff);
	};

	const updateDBFavs = async (label, add) => {
		let user_name = localStorage.getItem('username');
		if (add) {
			await api.post('api/auth/addFav', { user_name, label });
		} else {
			await api.post('api/auth/removeFav', { user_name, label });
		}
	};

	const viewDetails = (recipe) => {
		setModal({ show: true, recipe: recipe });
	};

	const handleClose = () => {
		setModal({ show: false, recipe: null });
	};

	const changePage = (pageNum) => {
		setPage(pageNum);
	};

	const standardTitle = (title) => {
		var words = title.split(" ")
		for (let i = 0; i < words.length; i++) {
			words[i] = words[i][0].toUpperCase() + words[i].substr(1);
		}
		return words.join(" ");
	};

	const roundValue = (val, decimals) => {
		return Number(val.toFixed(decimals));
	};

	const Modal = ({ closeModal, recipe }) => {
		return (
			<div className="modal-overlay">
				<div className="modal-container">
					<div className="modal-header">
						<button className="btn btn--close" onClick={() => closeModal()} >
							<span>&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<div>
							<a href={recipe.url}>{standardTitle(recipe.label)}</a>
						</div>
						<img className="card-img-top" src={recipe.image} alt="" />
						<h5>Ingredients ({recipe.ingredients.length})</h5>
						<ul>
							{recipe.ingredients.slice(0, ingredListMaxModal).map(ingred => (
								<li key={ingred.food}>{ingred.quantity !== 0 ? roundValue(ingred.quantity, 3) : ""}  {ingred.measure === null || ingred.measure === "<unit>" ? "" : ingred.measure} {ingred.food}</li>
							))}
						</ul>
						<h5>Dish Details</h5>
						<ul>
							<li>Serves: {recipe.yield !== undefined ? recipe.yield : 0}</li>
							<li>Calories: {recipe.yield !== undefined && recipe.calories !== undefined ? roundValue(recipe.calories / recipe.yield) : 0}</li>
							<li>Prep/Cook Time: {recipe.totalTime !== undefined ? recipe.totalTime : 0} min</li>
						</ul>
					</div>
				</div>
			</div>
		);
	};


	const labelIcons = (recipe) => {

		var labels = [];
		for (var i = 0; i < healthLabelObjects.length; i++) {
			if (recipe.healthLabels.includes(healthLabelObjects[i].name)) {
				labels.push(healthLabelObjects[i]);
			}
		}

		return (
			<span className="icons">
				{labels.map(label => (
					<img key={label.name} className={label.name} title={label.name} src={label.icon} alt="" />
				))}
			</span>);
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
			<div className="dashboard-content recipe-content">
				<h1>Suggested Recipes</h1>
				<img src={EDAMAM} alt="" />
				<a href="https://www.freepik.com/icons/dairy-free">Icon by Sudowoodo</a>
				{modal.show && modal.recipe && <Modal transparent={true} closeModal={handleClose} recipe={modal.recipe} />}
				<div className="card-deck">
					{recipes.slice((currentPage - 1) * recPerPage, (currentPage - 1) * recPerPage + recPerPage).map(recipe => (
						<div key={standardTitle(recipe.label)} className="card">
							<img className="card-img-top" src={recipe.image} alt="" />
							<div className="card-body">
								<h5 className="card-title">{standardTitle(recipe.label)}</h5>
								<h6>Ingredients</h6>
								<ul>
									{recipe.ingredients.slice(0, ingredListMax).map(ingred => (
										<li key={ingred.food}>{ingred.quantity !== 0 ? roundValue(ingred.quantity, 3) : ""}  {ingred.measure === null || ingred.measure === "<unit>" ? "" : ingred.measure} {ingred.food}</li>
									))}
								</ul>
								<div key={recipe.label} id={recipe.label} className="card-buttons">
									{labelIcons(recipe)}
									<span className={favorites.includes(recipe.label) ? "bi-heart-fill" : "bi-heart"} onClick={() => toggleFavorite(recipe)}> </span>
									<span className="bi-plus" onClick={() => viewDetails(recipe)}> </span>
								</div>
							</div>

						</div>
					))}
					<ul id="paginator" className="pagination justify-content-center">
						<li className="page-item">
							<button className={currentPage === 1 ? "page-link disabled" : "page-link active"} onClick={() => changePage(currentPage - 1)}>Previous</button>
						</li>
						{pages.map(page => (
							<li key={page} className="page-item">
								<button className="page-link" onClick={() => changePage(page + 1)}>{page + 1}</button>
							</li>
						))}
						<li className="page-item">
							<button className={currentPage === pages.length ? "page-link disabled" : "page-link active"} onClick={() => changePage(currentPage + 1)}>Next</button>
						</li>
					</ul>
				</div>

			</div>
			<div className="footer-image"></div>
		</div>
	);
}

export default Recipes;