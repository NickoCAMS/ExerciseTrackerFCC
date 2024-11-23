const mongoose = require('mongoose');

// Definizione dello schema per User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

// Creazione del modello per User
const User = mongoose.model('User', userSchema);

module.exports = User;