require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

// --- Configuración de subida de archivos ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Para poder ver las fotos después desde una URL, ej: http://TU_IP:3000/uploads/archivo.jpg
app.use('/uploads', express.static(uploadDir));

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

// --- RUTA PARA PROVEEDORES (con subida de fotos vía multipart/form-data) ---
app.post('/api/proveedores', upload.fields([
  { name: 'foto_persona', maxCount: 1 },
  { name: 'foto_ine', maxCount: 1 },
]), (req, res) => {
  console.log('BODY:', req.body);
  console.log('FILES:', req.files);
  const { pisoSeleccionado, areaSeleccionada, empresa, representante, motivo, contacto } = req.body;

  const fotoPersonaPath = req.files?.foto_persona?.[0]
    ? `/uploads/${req.files.foto_persona[0].filename}`
    : null;
  const fotoInePath = req.files?.foto_ine?.[0]
    ? `/uploads/${req.files.foto_ine[0].filename}`
    : null;

  const queryVisita = "INSERT INTO visita (id_edificio, tipo_visitante, estado) VALUES (1, 'proveedor', 'activa')";

  db.query(queryVisita, (err, result) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al registrar visita' });

    const idVisitaGenerada = result.insertId;
    const folio = `MIA-${idVisitaGenerada.toString().padStart(4, '0')}`;

    const queryProveedor = `
      INSERT INTO visita_proveedor 
      (id_visita, empresa_representada, nombre, piso_destino, area_destino, motivo_visita, folio, foto_persona, foto_ine, hora_entrada, fecha, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURTIME(), CURDATE(), 'activo')
    `;

    db.query(queryProveedor, [
        idVisitaGenerada, 
        empresa, 
        representante, 
        pisoSeleccionado, 
        areaSeleccionada, 
        motivo, 
        folio, 
        fotoPersonaPath, 
        fotoInePath
    ], (err2) => {
      if (err2) {
        console.error("Error en INSERT de proveedor:", err2);
        return res.status(500).json({ success: false, mensaje: 'Error al registrar detalles' });
      }
      res.status(200).json({ success: true, folio: folio });
    });
  });
});

// --- RUTA PARA FAMILIARES ---
app.post('/api/familiares', (req, res) => {
  const { nombre, parentesco, habitacion, nombrePaciente, foto_persona, foto_ine } = req.body;
  
  // 1. Insertar en visita
  const queryVisita = "INSERT INTO visita (id_edificio, tipo_visitante, estado) VALUES (1, 'familiar', 'activa')";
  db.query(queryVisita, (err, result) => {
    if (err) return res.status(500).json({ mensaje: 'Error al registrar visita' });

    const idVisitaGenerada = result.insertId;
    const folio = `MIA-${idVisitaGenerada.toString().padStart(4, '0')}`;

    // 2. Insertar en visita_familiar (Asegúrate de tener las columnas foto_persona e ine en MySQL)
    const queryFamiliar = `
      INSERT INTO visita_familiar 
      (id_visita, nombre, parentesco, habitacion, nombre_paciente, folio, foto_persona, foto_ine) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(queryFamiliar, [idVisitaGenerada, nombre, parentesco, habitacion, nombrePaciente, folio, foto_persona, foto_ine], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ mensaje: 'Error al guardar detalles' });
      }
      res.status(200).json({ success: true, folio: folio });
    });
  });
});

app.post('/api/postulantes', (req, res) => {
  const { nombre, puesto, area, responsable, tipoCita, cvEntregado, foto_persona, foto_ine } = req.body;
  const queryVisita = "INSERT INTO visita (id_edificio, tipo_visitante, estado) VALUES (1, 'postulante', 'activa')";

  db.query(queryVisita, (err, result) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al registrar visita' });

    const idVisitaGenerada = result.insertId;
    const queryPostulante = `
      INSERT INTO visita_postulante 
      (id_visita, nombre, puesto, area_destino, responsable_rh, tipo_cita, cv_entregado, foto_persona, foto_ine) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [idVisitaGenerada, nombre, puesto, area, responsable, tipoCita, cvEntregado ? 1 : 0, foto_persona, foto_ine];

    db.query(queryPostulante, valores, (err2) => {
      if (err2) return res.status(500).json({ success: false, mensaje: 'Error al guardar detalles' });
      res.status(200).json({ success: true, mensaje: 'Registro guardado' });
    });
  });
});

app.get('/api/visitas/activas', (req, res) => {
  const query = `
    SELECT 
      v.id_visita as id, 
      v.tipo_visitante as tipo, 
      DATE_FORMAT(v.fecha_entrada, '%H:%i') as hora,
      COALESCE(vp.nombre, vf.nombre, vpost.nombre) as nombre,
      COALESCE(
        CONCAT(vp.piso_destino, ' — ', vp.area_destino),
        CONCAT('Habitación: ', vf.habitacion),
        CONCAT(vpost.area_destino, ' — ', vpost.puesto)
      ) as destino
    FROM visita v
    LEFT JOIN visita_proveedor vp ON v.id_visita = vp.id_visita
    LEFT JOIN visita_familiar vf ON v.id_visita = vf.id_visita
    LEFT JOIN visita_postulante vpost ON v.id_visita = vpost.id_visita
    WHERE v.estado = 'activa'
    ORDER BY v.fecha_entrada DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar visitas activas' });
    
    const formatted = results.map(row => ({
      ...row,
      tipo: row.tipo.charAt(0).toUpperCase() + row.tipo.slice(1), 
      folio: `MIA-${row.id.toString().padStart(4, '0')}`,
      estado: 'activo'
    }));
    
    res.status(200).json(formatted);
  });
});

app.put('/api/visitas/:id/salida', (req, res) => {
  const { id } = req.params;
  const query = "UPDATE visita SET estado = 'finalizada', fecha_salida = NOW() WHERE id_visita = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar salida' });
    res.status(200).json({ success: true, mensaje: 'Salida registrada correctamente' });
  });
});

app.get('/api/visitas/historial', (req, res) => {
  const query = `
    SELECT 
      v.id_visita as id, 
      v.tipo_visitante as tipo, 
      DATE_FORMAT(v.fecha_entrada, '%H:%i') as horaEntrada,
      DATE_FORMAT(v.fecha_salida, '%H:%i') as horaSalida,
      v.estado,
      IF(DATE(v.fecha_entrada) = CURDATE(), 'Hoy', DATE_FORMAT(v.fecha_entrada, '%d/%m/%Y')) as fecha,
      COALESCE(vp.nombre, vf.nombre, vpost.nombre) as nombre, 
      COALESCE(
        CONCAT(vp.piso_destino, ' — ', vp.area_destino),
        CONCAT('Habitación: ', vf.habitacion),
        CONCAT(vpost.area_destino, ' — ', vpost.puesto)
      ) as destino 
    FROM visita v
    LEFT JOIN visita_proveedor vp ON v.id_visita = vp.id_visita
    LEFT JOIN visita_familiar vf ON v.id_visita = vf.id_visita
    LEFT JOIN visita_postulante vpost ON v.id_visita = vpost.id_visita
    ORDER BY v.fecha_entrada DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar historial:', err);
      return res.status(500).json({ success: false, mensaje: 'Error al consultar historial' });
    }

    const formatted = results.map(row => ({
      ...row,
      tipo: row.tipo.charAt(0).toUpperCase() + row.tipo.slice(1),
      folio: `MIA-${row.id.toString().padStart(4, '0')}`,
      horaSalida: row.horaSalida || '--:--'
    }));

    res.status(200).json(formatted);
  });
});

const PORT = process.env.PORT || 3000;
// Manejador de errores global (debe ir después de todas las rutas)
app.use((err, req, res, next) => {
  console.error('ERROR CAPTURADO:', err);
  res.status(500).json({
    success: false,
    mensaje: 'Error interno del servidor',
    error: err.message,
  });
});
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});