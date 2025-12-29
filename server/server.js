const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

//  env vars
dotenv.config();

// Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));