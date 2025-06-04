const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('emails.db');

app.use(cors()); // Permitir solicitudes desde cualquier origen
app.use(express.json());

// Crear la tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE
)`, (err) => {
    if (err) {
        console.error('Error al crear la tabla:', err.message);
    }
});

// Ruta para guardar correos
app.post('/api/email', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Correo requerido.' });
    }

    const query = `INSERT INTO emails (email) VALUES (?)`;
    db.run(query, [email], function (err) {
        if (err) {
            console.error('Error al insertar el correo:', err.message);
            if (err.message.includes('UNIQUE')) {
                return res.status(409).json({ message: 'Este correo ya está registrado.' });
            }
            return res.status(500).json({ message: 'Error al guardar el correo.' });
        }
        res.status(200).json({ message: 'Correo guardado correctamente.' });
    });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err.stack);
    res.status(500).json({ message: 'Error interno del servidor.' });
});

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});