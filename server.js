const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect("process.env.MONGO_URI", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Could not connect to MongoDB:', error));

// Define the user schema and model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Register route
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ name: req.body.name, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send('Username already exists');
    } else {
      res.status(500).send('Error registering user');
    }
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      res.send('Login success');
    } else {
      res.status(400).send('Invalid username or password');
    }
  } catch (error) {
    res.status(500).send('Error during login');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
