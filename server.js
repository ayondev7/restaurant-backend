require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dishRoutes = require('./routes/dishRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) {
      return callback(new Error('CORS policy: No allowed origins configured'));
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS policy: Origin not allowed'));
    }
  }
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/dishes', dishRoutes);
app.use('/api/categories', categoryRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');
  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});