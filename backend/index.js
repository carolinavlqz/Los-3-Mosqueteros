require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express(); 

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err.message);
    return;
  }
  console.log('Conectado exitosamente a la base de datos MySQL');
});

app.get('/', (req, res) => {
  res.send('Servidor de Médica MIA funcionando');
});

// --- RUTA PARA RECIBIR DATOS DEL PROVEEDOR ---
app.post('/api/proveedores', (req, res) => {
  const { pisoSeleccionado, areaSeleccionada, empresa, representante, motivo, contacto } = req.body;
  
  console.log('RECIBIENDO DATOS DESDE EL DISPOSITIVO:', { empresa, representante, pisoSeleccionado, areaSeleccionada });

  const queryVisita = `INSERT INTO visita (id_edificio, tipo_visitante, estado) VALUES (1, 'proveedor', 'activa')`;

  db.query(queryVisita, (err, result) => {
    if (err) {
      console.error('Error al insertar visita:', err);
      return res.status(500).json({ success: false, mensaje: 'Error al registrar visita' });
    }

    const idVisitaGenerada = result.insertId;

    const queryProveedor = `
      INSERT INTO visita_proveedor 
      (id_visita, empresa_representada, nombre, piso_destino, area_destino, motivo_visita, persona_contacto) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(queryProveedor, [
      idVisitaGenerada, 
      empresa, 
      representante, 
      pisoSeleccionado, 
      areaSeleccionada, 
      motivo, 
      contacto
    ], (err2, result2) => {
      if (err2) {
        console.error('Error al insertar detalles de proveedor:', err2);
        return res.status(500).json({ success: false, mensaje: 'Error al registrar detalles' });
      }

      console.log(`EXITO`);
      res.status(200).json({ success: true, mensaje: 'Registro guardado' });
    });
  });
});

// --- RUTA PARA RECIBIR DATOS DEL FAMILIAR ---
app.post('/api/familiares', (req, res) => {
  const { nombre, parentesco, habitacion, nombrePaciente } = req.body;

  console.log('RECIBIENDO FAMILIAR:', { nombre, nombrePaciente });

  const queryVisita = `INSERT INTO visita (id_edificio, tipo_visitante, estado) VALUES (1, 'familiar', 'activa')`;

  db.query(queryVisita, (err, result) => {
    if (err) return res.status(500).json({ mensaje: 'Error al registrar visita' });

    const idVisitaGenerada = result.insertId;

    const queryFamiliar = `
      INSERT INTO visita_familiar 
      (id_visita, nombre, parentesco, habitacion, nombre_paciente) 
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(queryFamiliar, [idVisitaGenerada, nombre, parentesco, habitacion, nombrePaciente], (err2) => {
      if (err2) {
        console.error('Error:', err2);
        return res.status(500).json({ mensaje: 'Error al guardar detalles' });
      }
      res.status(200).json({ success: true, mensaje: 'Registro guardado exitosamente' });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});