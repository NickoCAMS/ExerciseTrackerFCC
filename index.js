require('dotenv').config();  // Carica le variabili dal file .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importa i modelli dalla cartella models
const User = require('./models/user');
const Exercise = require('./models/exercise');

const app = express();

// Usa la variabile di ambiente PORT o imposta 3000 come default
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Usa la variabile MONGO_URI per la connessione al database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connesso a MongoDB');
}).catch(err => {
  console.log('Errore di connessione a MongoDB:', err);
});

// Serve file statici
app.use(express.static('public'))


// API routes
//Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Crea un nuovo utente
app.post('/api/users', async (req, res) => {
  const user = new User({ username: req.body.username });
  try {
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ottieni tutti gli utenti
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aggiungi un esercizio per un utente
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;

  // Crea un nuovo esercizio
  const exercise = new Exercise({
    description,
    duration,
    date: date ? new Date(date) : new Date(), // Usa la data se fornita, altrimenti la data corrente
    userId,
  });

  try {
    // Salva l'esercizio nel database
    const savedExercise = await exercise.save();

    // Trova l'utente con l'ID fornito
    const user = await User.findById(userId);

    // Verifica che l'utente esista
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Aggiungi l'esercizio all'utente
    user.exerciseLog = user.exerciseLog || [];
    user.exerciseLog.push(savedExercise);

    // Salva di nuovo l'utente con il log degli esercizi aggiornato
    await user.save();

    // Ritorna l'utente con l'esercizio aggiunto
    res.json({
      username: user.username,
      _id: user._id,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Ottieni il log degli esercizi di un utente
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  let query = { userId: _id };

  if (from) query.date = { $gte: new Date(from) };
  if (to) query.date = { $lte: new Date(to) };
  const exercises = await Exercise.find(query)
    .limit(limit ? parseInt(limit) : 100)
    .exec();

  const user = await User.findById(_id);
  res.json({
    username: user.username,
    count: exercises.length,
    log: exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString(),
    })),
  });
});

// Avvia il server sulla porta configurata
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
