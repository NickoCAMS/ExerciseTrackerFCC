
const mongoose = require('mongoose');

// Definizione dello schema per Exercise
const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Creazione del modello per Exercise
const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
