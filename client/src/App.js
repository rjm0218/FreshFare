import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import logo from './logo.png';
import axios from 'axios';
import './App.css';
import member1 from './member1.jpg';
import member2 from './member2.jpg';
import member3 from './member3.jpg';
import dashboard  from './dashboard.png';
import inventory  from './Inventory.png';
import groceries  from './Grocery.png';
import recipes  from './Recipes.png';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Grocery from './components/Grocery';
import Recipes from './components/Recipes';
import { Chrono } from 'react-chrono';
import Carousel from 'react-bootstrap/Carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import {api} from './axios_config.js';


var warning_hidden = true;

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);


  // Add useEffect to check if user is logged in when the component mounts
  useEffect(() => {
    // Check if the user is logged in by checking local storage or sending a request to the backend
    // This part is based on how you handle token storage and verification in your backend
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
    }
  }, []);




  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If section is null, navigate to the login section
      window.location.href = '#login';
    }
  };



  const handleLogout = (e) => {

    e.preventDefault();
    console.log("Logging out:");
    setLoggedIn(false);
  };

  return (
    <div className="App">
      <div className="scrollable-background"></div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute onLogout={handleLogout} />} />
        <Route path="/dashboard/inventory" element={<Inventory />} />
        <Route path="/dashboard/grocery-list" element={<Grocery />} />
        <Route path="/dashboard/recipes" element={<Recipes />} />
      </Routes>
    </div>

  );


  function Home() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [submitFeedback, setFeedbackMode] = useState(false);


    const handleSubmit = async (e) => {
      e.preventDefault();
      const feedback = { name, email, message };
      try {
        // Send feedback data to the backend
        await axios.post('/feedback', feedback);
        setName('');
        setEmail('');
        setMessage('');
        //alert('Feedback submitted successfully');

        //setFeedbackMode(true); // Set submitFeedback state to true
      } catch (error) {
        console.error('Error submitting feedback:', error);
      }
    };

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await api.post('api/auth/login', { username, password });
        localStorage.setItem('token', response.data.token); // Save the token
        localStorage.setItem('username', response.data.user.username);
        setLoggedIn(true);
        navigate('/dashboard'); // Navigate to the dashboard after login
      } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : 'No response');
        setMessage('Login failed: ' + (error.response ? error.response.data : 'No response')); // Set error message
      }
    };

    const handleRegistration = async (e) => {
      e.preventDefault();
      let warn = document.getElementsByClassName('passwordHint');
      if (warn !== null && warn[0].hidden === false) {
        warn[0].hidden = true;
        warning_hidden = true;
      }

      if (!checkPasswordStrength(registerPassword)) {
        warn[0].style.color = "red";
        warn[0].hidden = false;
        warning_hidden = false;
        return;
      }


      try {
        await api.post('api/auth/register', { username: registerUsername, email: registerEmail, password: registerPassword });
        setIsRegisterMode(false); // Switch back to login mode after successful registration
      } catch (error) {
        console.error('Registration failed:', error.response ? error.response.data : 'No response');
        warn[0].style.color = "red";
        warn[0].hidden = false;
        warning_hidden = false;
        warn[0].innerText = 'Registration failed: ' + (error.response ? error.response.data : 'No response');
      }
    };

    const checkPasswordStrength = (password) => {
      const match = [/[A-Z]/, /[a-z]/, /[0-9]/, /[`~!@#$%^&*()_+[\];',.<>?/]/];
      for (let i = 0; i < match.length; i++) {
        if (password.match(match[i]) == null) {
          return false;
        }
      }

      return true;
    }



    const items = [
      {
        title: "Feb 5th - Feb12th, 2023 ",
        cardTitle: "Made contact on Discord and started the discussions",
        cardDetailedText: "Ryan, Amir and Kruthika connected on discord and teams",
      },
      {
        title: "Feb 19th, 2023 ",
        cardTitle: "Project Stage 1 presentation in class",
        cardDetailedText: "Amir and Kruthika presented the idea and collected feedback",
      },
      {
        title: "Feb 26th, 2023 ",
        cardTitle: "Finished our landing page layout",
        cardDetailedText: "We finalized our workload and Kruthika created the landing page",
      },
      {
        title: "Mar 1st, 2023 ",
        cardTitle: "Dashboard skeleton was setup by Kruthika and pushed on github",
        cardDetailedText: "Dashbord/Inventory/Grocery/Recipes was setup by Kruthika"
      },
      {
        title: "Mar 3rd, 2023 ",
        cardTitle: "Ryan first push for recipe page",
        cardDetailedText: "Ryan started work on the recipe page",
      },
      {
        title: "Mar 6th, 2023 ",
        cardTitle: "Ryan wrapped up Recipe and Kruthika wrapped up Inventory",
        cardDetailedText: "Ryan and Kruthika worked on getting the Recipes and Inventory page working",
      },
      {
        title: "Mar 7th-8th, 2023 ",
        cardTitle: "Finalized the databases setup",
        cardDetailedText: "Ryan setup the databases and tested them.",
      },
      {
        title: "Mar 9th, 2023 ",
        cardTitle: "Grocery page was finished",
        cardDetailedText: "Ryan helped Kruthika troubleshooting along the way to get it done. (Thanks Ryan)",
      },
      {
        title: "Mar 10th, 2023 ",
        cardTitle: "Amir set up the Dashboard and we fixed the styling",
        cardDetailedText: "Kruthika,Amir and Ryan worked hard getting this to the finish line.",
      },
      {
        title: "Mar 11th, 2023 ",
        cardTitle: "Deployed and presentation",
        cardDetailedText: "Here we are",
      },


      // Add more timeline items as needed
    ];

    return (
      <div className="content-wrapper">
        <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
          <button className="nav-button" onClick={() => scrollToSection('about')}>About</button>
          <button className="nav-button" onClick={() => scrollToSection('features')}>Features</button>
          <button className="nav-button" onClick={() => scrollToSection('feedback')}>Feedback</button>
          <button className="nav-button" onClick={() => scrollToSection('login')}>Login</button>
        </nav>
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
          <a href="/" className={`logo ${scrolled ? 'small' : ''}`}>
            <img src={logo} className="App-logo" alt="logo" />
          </a>

        </header>
        <div className="description-box">


          <p>Discover the app that brings ease and peace of mind to your kitchen.</p>
          <p>Say goodbye to the uncertainty of whether that pasta sauce from 4 weeks ago is still fresh.</p>
          <p>Stop wondering what to do with that can of fresh cream sitting in your fridge.</p>
          <p>Take control of your kitchen, TODAY</p>

        </div>


        <div className="team-section" id="about">
          <h2>About Us</h2>
          <h3>Our Team</h3>
          <div className="team-member">
            <img src={member1} alt="Say hi to Amir" />
            <a href="https://www.linkedin.com/in/amirhossein-nirou/">Amir Niroumand</a>
          </div>
          <div className="team-member">
            <img src={member2} alt="Say hi to Ryan" />
            <a href="https://www.linkedin.com/in/ryan-moore-08086354/">Ryan Moore</a>
          </div>
          <div className="team-member">
            <img src={member3} alt="Say hi to Kruthika" />
            <a href="https://www.linkedin.com/in/kruthikaravi/">Kruthika Ravi</a>
          </div>
        </div>

        <div className="timeline-section">
          <h2 className="timeline-section">Project Timeline</h2>
          <div className="timeline-container">  {/* New container */}
            <Chrono items={items} theme={{
              primary: 'green',
              secondary: 'white',
              cardBgColor: 'white',
              titleColor: 'black',
              titleColorActive: 'green',
            }} mode="VERTICAL_ALTERNATING" scrollable={{ scrollbar: true }} cardHeight={100} />
          </div>
        </div>

        <div className="features" id="features">
          <h2>App Features</h2>
          <p>Our app equips you with the tools to categorize and organize your kitchen essentials,</p>
          <p>providing an automated grocery list for your next visit to the store.</p>
          <p>Explore our curated selection of recipes </p><p>designed to help you make the most of your ingredients before they expire.</p>
          <Carousel>
            <Carousel.Item>
              <div className="carousel-wrapper">
                <img src={dashboard} alt="User Dashboard" className="carousel-image" />
                <p className="legend">User Dashboard</p>
              </div>
            </Carousel.Item>
            <Carousel.Item>
              <div className="carousel-wrapper">
                <img src={inventory} alt="Inventory Management" className="carousel-image" />
                <p className="legend">Inventory Management</p>
              </div>
            </Carousel.Item>
            <Carousel.Item>
              <div className="carousel-wrapper">
                <img src={groceries} alt="Grocery List" className="carousel-image" />
                <p className="legend">Grocery List</p>
              </div>
            </Carousel.Item>
            <Carousel.Item>
              <div className="carousel-wrapper">
                <img src={recipes} alt="Recipes" className="carousel-image" />
                <p className="legend">Recipes</p>
              </div>
            </Carousel.Item>
          </Carousel>
        </div>


        {!submitFeedback ? (
          <div className="feedback" id="feedback" onSubmit={handleSubmit}>
            <h2>We value your feedback</h2>
            <form className="feedback-form" onSubmit={() => setFeedbackMode(true)}>
              <div className="form-group">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Your Name"
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Your Email"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field"
                  placeholder="Your Message"
                  rows={4}
                />
              </div>
              <button type="submit" className="submit-button">
                Submit
              </button>
            </form>
          </div>
        ) : (
          <div className="feedback" id="feedback">
            <h2>Thank you for your feedback</h2>
          </div>
        )}
        {!isRegisterMode && (
          <section className="login-section" id="login">
            <h2>Welcome to FreshFare</h2>
            <p>Log in to access your groceries list and unlock recipes.</p>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Username"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Password"
                  required
                />
              </div>
              <button type="submit" className="login-button">
                Login
              </button>
            </form>
            <p className="register-text">
              First time user?
              <button type="button" onClick={() => setIsRegisterMode(true)} className="register-button">
                Register
              </button>
            </p>
          </section>
        )}
        {isRegisterMode && (
          <section className="register-section" id="register">
            <h2>Register</h2>
            <form onSubmit={handleRegistration} className="register-form">
              <div className="form-group">
                <input
                  type="text"
                  id="register-username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="input-field"
                  placeholder="Username"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  id="register-email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="input-field"
                  placeholder="Email"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  id="register-password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="input-field"
                  placeholder="Password"
                  required
                />
              </div>
              <p className="passwordHint" hidden={warning_hidden}>
                Passwords must have: <br></br>
                -One lower case letter <br></br>
                -One upper case letter <br></br>
                -One number <br></br>
                -One symbol.
              </p>

              <button type="submit" className="register-button">
                Register
              </button>
            </form>
          </section>
        )}

        <footer className="footer">
          <p>&copy; 2024 FreshFare. All rights reserved.</p>
          <p>Product by: Amir, Kruthika & Ryan</p>
        </footer>
      </div>
    );

  }

  function ProtectedRoute({ onLogout }) {
    return loggedIn ? <Dashboard onLogout={onLogout} /> : <Navigate to="/" />;
  }

}

export default App;
