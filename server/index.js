const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3001;


const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Middlewares
app.use(cors({origin: true}));
app.use(express.json());
app.use(bodyParser.json());


// MongoDB connection
mongoose.connect(MongoDB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Feedback model
const Feedback = mongoose.model('Feedback', new mongoose.Schema({
    name: String,
    email: String,
    message: String,
}));

// Routes
app.post('/feedback', async (req, res) => {
    const { name, email, message } = req.body;
    const newFeedback = new Feedback({ name, email, message });
    try {
       await newFeedback.save();
        res.status(201).send('Feedback saved');
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



module.exports = app;