const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos de los correos
const db = new sqlite3.Database('./emails.db', (err) => {
  if (err) return console.error(err.message);
  console.log('🗃️  Conectado a la base de datos SQLite.');
});

// Crear las tablas de la base de datos
db.run(`CREATE TABLE IF NOT EXISTS emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);


// Ruta para guardar correos
app.post('/api/email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Correo requerido.' });

  const query = `INSERT INTO emails (email) VALUES (?)`;
  db.run(query, [email], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ message: 'Este correo ya está registrado.' });
      }
      return res.status(500).json({ message: 'Error al guardar el correo.' });
    }
    res.status(200).json({ message: 'Correo guardado correctamente.' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});