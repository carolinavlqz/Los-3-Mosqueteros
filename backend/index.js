require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors());
app.use(express.json());

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
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes'));
    }
    cb(null, true);
  },
});
app.use('/uploads', express.static(uploadDir));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando a MySQL:', err.message);
    return;
  }
  console.log('Conectado exitosamente a la base de datos MySQL');
  connection.release();
});

app.get('/', (req, res) => {
  res.send('Servidor de Médica MIA funcionando');
});

// --- LOGIN ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, mensaje: 'Correo y contraseña son obligatorios' });
  }

  const query = 'SELECT id, name, email, password, area, es_admin, acceso_reportes FROM users WHERE email = ? LIMIT 1';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al iniciar sesión' });
    if (results.length === 0) {
      return res.status(401).json({ success: false, mensaje: 'Correo o contraseña incorrectos' });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr || !isMatch) {
        return res.status(401).json({ success: false, mensaje: 'Correo o contraseña incorrectos' });
      }

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          area: user.area,
          esAdmin: !!user.es_admin,
          accesoReportes: !!user.acceso_reportes,
        },
      });
    });
  });
});

// --- RUTA PARA PROVEEDORES (con subida de fotos vía multipart/form-data) ---
app.post('/api/proveedores', upload.fields([
  { name: 'foto_persona', maxCount: 1 },
  { name: 'foto_ine', maxCount: 1 },
]), (req, res) => {
  const { pisoSeleccionado, areaSeleccionada, empresa, representante, motivo, contacto } = req.body;

  const fotoPersonaPath = req.files?.foto_persona?.[0]
    ? `/uploads/${req.files.foto_persona[0].filename}`
    : null;
  const fotoInePath = req.files?.foto_ine?.[0]
    ? `/uploads/${req.files.foto_ine[0].filename}`
    : null;

  db.getConnection((connErr, connection) => {
    if (connErr) return res.status(500).json({ success: false, mensaje: 'Error de conexión' });

    connection.beginTransaction((txErr) => {
      if (txErr) {
        connection.release();
        return res.status(500).json({ success: false, mensaje: 'Error al iniciar registro' });
      }

      connection.query('INSERT INTO hospital_folio_seq VALUES ()', (errSeq, seqResult) => {
        if (errSeq) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, mensaje: 'Error al generar folio' });
          });
        }
        const folio = `MIA-${seqResult.insertId.toString().padStart(4, '0')}`;

      const queryVisita = "INSERT INTO visita (id_edificio, tipo_visitante, estado) VALUES (1, 'proveedor', 'activa')";
      connection.query(queryVisita, (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, mensaje: 'Error al registrar visita' });
          });
        }

        const idVisitaGenerada = result.insertId;

        const queryProveedor = `
          INSERT INTO visita_proveedor
          (id_visita, empresa_representada, nombre, piso_destino, area_destino, motivo_visita, folio, foto_persona, foto_ine, hora_entrada, fecha, estado)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURTIME(), CURDATE(), 'activo')
        `;

        connection.query(queryProveedor, [
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
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ success: false, mensaje: 'Error al registrar detalles' });
            });
          }

          connection.commit((commitErr) => {
            connection.release();
            if (commitErr) return res.status(500).json({ success: false, mensaje: 'Error al confirmar registro' });
            res.status(200).json({ success: true, folio: folio });
          });
        });
      });
      });
    });
  });
});

// --- RUTA PARA FAMILIARES (ahora con subida real de archivos vía multipart/form-data) ---
app.post('/api/familiares', upload.fields([
  { name: 'foto_persona', maxCount: 1 },
  { name: 'foto_ine', maxCount: 1 },
]), (req, res) => {
  const { nombre, parentesco, piso, habitacion, nombrePaciente } = req.body;

  const fotoPersonaPath = req.files?.foto_persona?.[0]
    ? `/uploads/${req.files.foto_persona[0].filename}`
    : null;
  const fotoInePath = req.files?.foto_ine?.[0]
    ? `/uploads/${req.files.foto_ine[0].filename}`
    : null;

  db.getConnection((connErr, connection) => {
    if (connErr) return res.status(500).json({ success: false, mensaje: 'Error de conexión' });

    connection.beginTransaction((txErr) => {
      if (txErr) {
        connection.release();
        return res.status(500).json({ success: false, mensaje: 'Error al iniciar registro' });
      }

      connection.query('INSERT INTO hospital_folio_seq VALUES ()', (errSeq, seqResult) => {
        if (errSeq) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, mensaje: 'Error al generar folio' });
          });
        }
        const folio = `MIA-${seqResult.insertId.toString().padStart(4, '0')}`;

      const queryVisita = "INSERT INTO visita (id_edificio, tipo_visitante, estado) VALUES (1, 'familiar', 'activa')";
      connection.query(queryVisita, (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, mensaje: 'Error al registrar visita' });
          });
        }

        const idVisitaGenerada = result.insertId;

        const queryFamiliar = `
          INSERT INTO visita_familiar
          (id_visita, nombre, parentesco, piso, habitacion, nombre_paciente, folio, foto_persona, foto_ine)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        connection.query(queryFamiliar, [
            idVisitaGenerada,
            nombre,
            parentesco,
            piso,
            habitacion,
            nombrePaciente,
            folio,
            fotoPersonaPath,
            fotoInePath
        ], (err2) => {
          if (err2) {
            console.error("Error en INSERT de familiar:", err2);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ success: false, mensaje: 'Error al guardar detalles' });
            });
          }

          connection.commit((commitErr) => {
            connection.release();
            if (commitErr) return res.status(500).json({ success: false, mensaje: 'Error al confirmar registro' });
            res.status(200).json({ success: true, folio: folio });
          });
        });
      });
      });
    });
  });
});

// --- RUTA PARA POSTULANTES (ahora con subida real de archivos vía multipart/form-data) ---
app.post('/api/postulantes', upload.fields([
  { name: 'foto_persona', maxCount: 1 },
  { name: 'foto_ine', maxCount: 1 }
]), (req, res) => {
  const { nombre, puesto, area, responsable, tipoCita, cvEntregado } = req.body;
  const fotoPersonaPath = req.files?.foto_persona?.[0] ? `/uploads/${req.files.foto_persona[0].filename}` : null;
  const fotoInePath = req.files?.foto_ine?.[0] ? `/uploads/${req.files.foto_ine[0].filename}` : null;

  db.getConnection((connErr, connection) => {
    if (connErr) return res.status(500).json({ success: false, mensaje: 'Error de conexión' });

    connection.beginTransaction((txErr) => {
      if (txErr) {
        connection.release();
        return res.status(500).json({ success: false, mensaje: 'Error al iniciar registro' });
      }

      connection.query('INSERT INTO hospital_folio_seq VALUES ()', (errSeq, seqResult) => {
        if (errSeq) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, mensaje: 'Error al generar folio' });
          });
        }
        const folio = `MIA-${seqResult.insertId.toString().padStart(4, '0')}`;

      const queryVisita = "INSERT INTO visita (id_edificio, tipo_visitante, estado) VALUES (1, 'postulante', 'activa')";
      connection.query(queryVisita, (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, mensaje: 'Error al registrar visita' });
          });
        }

        const idVisitaGenerada = result.insertId;
        const queryPostulante = `INSERT INTO visita_postulante (id_visita, nombre, puesto, area_destino, responsable_rh, tipo_cita, cv_entregado, foto_persona, foto_ine, folio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(queryPostulante, [idVisitaGenerada, nombre, puesto, area, responsable, tipoCita, (cvEntregado === 'true' ? 1 : 0), fotoPersonaPath, fotoInePath, folio], (err2) => {
          if (err2) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ success: false, mensaje: 'Error al guardar detalles' });
            });
          }

          connection.commit((commitErr) => {
            connection.release();
            if (commitErr) return res.status(500).json({ success: false, mensaje: 'Error al confirmar registro' });
            res.status(200).json({ success: true, folio: folio });
          });
        });
      });
      });
    });
  });
});

// --- CATÁLOGO DE LA TORRE DE CONSULTORIOS (pisos y consultorios los captura el administrador) ---
// --- CATÁLOGO DEL HOSPITAL (pisos y habitaciones los captura el administrador) ---
app.get('/api/hospital/pisos', (req, res) => {
  const query = `
    SELECT DISTINCT piso, piso_orden
    FROM catalogo_habitaciones
    ORDER BY piso_orden
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar pisos' });
    res.status(200).json(results);
  });
});

app.get('/api/hospital/habitaciones', (req, res) => {
  const { piso } = req.query;
  if (!piso) return res.status(400).json({ success: false, mensaje: 'Falta el parámetro piso' });

  const query = `
    SELECT numero
    FROM catalogo_habitaciones
    WHERE piso = ?
    ORDER BY numero
  `;

  db.query(query, [piso], (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar habitaciones' });
    res.status(200).json(results.map((r) => r.numero));
  });
});

app.get('/api/torre/pisos', (req, res) => {
  const query = `
    SELECT DISTINCT piso, piso_orden
    FROM catalogo_consultorios
    ORDER BY piso_orden
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar pisos' });
    res.status(200).json(results);
  });
});

app.get('/api/torre/consultorios', (req, res) => {
  const { piso } = req.query;
  if (!piso) return res.status(400).json({ success: false, mensaje: 'Falta el parámetro piso' });

  const query = `
    SELECT numero
    FROM catalogo_consultorios
    WHERE piso = ?
    ORDER BY numero
  `;

  db.query(query, [piso], (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar consultorios' });
    res.status(200).json(results.map((r) => r.numero));
  });
});

// --- REGISTRO DE ENTRADA A LA TORRE (con foto vía multipart/form-data) ---
// Folio propio "TMIA-000X" con contador independiente del de Hospital (torre_folio_seq),
// para que no se entrelacen los números aunque compartan la tabla `visita`.
app.post('/api/torre/registro', upload.fields([{ name: 'foto_persona', maxCount: 1 }]), (req, res) => {
  const { tipo, piso, consultorio, nombre } = req.body;
  const fotoPersonaPath = req.files?.foto_persona?.[0]
    ? `/uploads/${req.files.foto_persona[0].filename}`
    : null;

  db.getConnection((connErr, connection) => {
    if (connErr) return res.status(500).json({ success: false, mensaje: 'Error de conexión' });

    connection.beginTransaction((txErr) => {
      if (txErr) {
        connection.release();
        return res.status(500).json({ success: false, mensaje: 'Error al iniciar registro' });
      }

      connection.query('INSERT INTO torre_folio_seq VALUES ()', (errSeq, seqResult) => {
        if (errSeq) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, mensaje: 'Error al generar folio' });
          });
        }

        const folio = `TMIA-${seqResult.insertId.toString().padStart(4, '0')}`;
        const queryVisita = "INSERT INTO visita (id_edificio, tipo_visitante, estado) VALUES (2, ?, 'activa')";

        connection.query(queryVisita, [tipo], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ success: false, mensaje: 'Error al registrar visita' });
            });
          }

          const idVisitaGenerada = result.insertId;
          const queryTorre = `
            INSERT INTO visita_torre (id_visita, tipo_acceso, piso, consultorio, nombre, foto_persona, folio)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          connection.query(queryTorre, [idVisitaGenerada, tipo, piso, consultorio, nombre, fotoPersonaPath, folio], (err2) => {
            if (err2) {
              console.error('Error en INSERT de visita_torre:', err2);
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ success: false, mensaje: 'Error al guardar detalles' });
              });
            }

            connection.commit((commitErr) => {
              connection.release();
              if (commitErr) return res.status(500).json({ success: false, mensaje: 'Error al confirmar registro' });
              res.status(200).json({ success: true, id: idVisitaGenerada, folio });
            });
          });
        });
      });
    });
  });
});

// --- ACTIVOS DE LA TORRE (para la pantalla de "activos del piso" y la de Salida) ---
app.get('/api/torre/activos', (req, res) => {
  const { piso, consultorio, nombre } = req.query;

  let query = `
    SELECT
      v.id_visita as id,
      vt.nombre,
      vt.piso,
      vt.consultorio,
      vt.foto_persona as foto,
      vt.tipo_acceso,
      vt.folio,
      DATE_FORMAT(v.fecha_entrada, '%H:%i') as horaEntrada
    FROM visita v
    JOIN visita_torre vt ON v.id_visita = vt.id_visita
    WHERE v.estado = 'activa'
  `;
  const params = [];
  if (piso) { query += ' AND vt.piso = ?'; params.push(piso); }
  if (consultorio) { query += ' AND vt.consultorio = ?'; params.push(consultorio); }
  if (nombre) { query += ' AND vt.nombre LIKE ?'; params.push(`%${nombre}%`); }
  query += ' ORDER BY v.fecha_entrada DESC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar activos' });
    res.status(200).json(results);
  });
});

// --- HISTORIAL DE LA TORRE (activos y finalizados) ---
app.get('/api/torre/historial', (req, res) => {
  const { piso, consultorio, nombre } = req.query;

  let query = `
    SELECT
      v.id_visita as id,
      vt.nombre,
      vt.piso,
      vt.consultorio,
      vt.foto_persona as foto,
      vt.tipo_acceso,
      vt.folio,
      v.estado,
      DATE_FORMAT(v.fecha_entrada, '%H:%i') as horaEntrada,
      DATE_FORMAT(v.fecha_salida, '%H:%i') as horaSalida
    FROM visita v
    JOIN visita_torre vt ON v.id_visita = vt.id_visita
    WHERE 1 = 1
  `;
  const params = [];
  if (piso) { query += ' AND vt.piso = ?'; params.push(piso); }
  if (consultorio) { query += ' AND vt.consultorio = ?'; params.push(consultorio); }
  if (nombre) { query += ' AND vt.nombre LIKE ?'; params.push(`%${nombre}%`); }
  query += ' ORDER BY v.fecha_entrada DESC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar historial' });
    const formatted = results.map((r) => ({ ...r, horaSalida: r.horaSalida || '--:--' }));
    res.status(200).json(formatted);
  });
});

// --- AUTOCOMPLETADO DE EMPRESAS (proveedores ya registrados antes) ---
app.get('/api/proveedores/empresas', (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.status(200).json([]);

  const query = `
    SELECT DISTINCT empresa_representada
    FROM visita_proveedor
    WHERE empresa_representada LIKE ?
    ORDER BY empresa_representada
    LIMIT 8
  `;

  db.query(query, [`${q}%`], (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar empresas' });
    res.status(200).json(results.map((r) => r.empresa_representada));
  });
});

// --- AUTOCOMPLETADO DE PERSONAL DE RH (responsables ya registrados antes) ---
app.get('/api/postulantes/responsables', (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.status(200).json([]);

  const query = `
    SELECT DISTINCT responsable_rh
    FROM visita_postulante
    WHERE responsable_rh LIKE ?
    ORDER BY responsable_rh
    LIMIT 8
  `;

  db.query(query, [`${q}%`], (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar responsables' });
    res.status(200).json(results.map((r) => r.responsable_rh));
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
      ) as destino,
      COALESCE(vp.foto_persona, vf.foto_persona, vpost.foto_persona) as foto_persona,
      COALESCE(vp.foto_ine, vf.foto_ine, vpost.foto_ine) as foto_ine,
      COALESCE(vp.folio, vf.folio, vpost.folio) as folio
    FROM visita v
    LEFT JOIN visita_proveedor vp ON v.id_visita = vp.id_visita
    LEFT JOIN visita_familiar vf ON v.id_visita = vf.id_visita
    LEFT JOIN visita_postulante vpost ON v.id_visita = vpost.id_visita
    WHERE v.estado = 'activa' AND v.id_edificio = 1
    ORDER BY v.fecha_entrada DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar visitas activas' });

    const formatted = results.map(row => ({
      ...row,
      tipo: row.tipo.charAt(0).toUpperCase() + row.tipo.slice(1),
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
      ) as destino,
      COALESCE(vp.foto_persona, vf.foto_persona, vpost.foto_persona) as foto_persona,
      COALESCE(vp.foto_ine, vf.foto_ine, vpost.foto_ine) as foto_ine,
      COALESCE(vp.folio, vf.folio, vpost.folio) as folio
    FROM visita v
    LEFT JOIN visita_proveedor vp ON v.id_visita = vp.id_visita
    LEFT JOIN visita_familiar vf ON v.id_visita = vf.id_visita
    LEFT JOIN visita_postulante vpost ON v.id_visita = vpost.id_visita
    WHERE v.id_edificio = 1
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
      horaSalida: row.horaSalida || '--:--'
    }));

    res.status(200).json(formatted);
  });
});

// --- MÓDULO DE CAFETERÍA: horarios de comida (editables sin tocar código) ---
app.get('/api/cafeteria/horarios', (req, res) => {
  const query = `
    SELECT tipo_comida, TIME_FORMAT(hora_inicio, '%H:%i') AS hora_inicio, TIME_FORMAT(hora_fin, '%H:%i') AS hora_fin
    FROM cafeteria_horarios
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar horarios' });
    res.status(200).json(results);
  });
});

// --- PISOS CON PACIENTES ACTIVOS (para las pestañas de piso del tablero) ---
app.get('/api/cafeteria/pisos', (req, res) => {
  const query = 'SELECT DISTINCT piso FROM cafeteria_pacientes WHERE activo = 1 ORDER BY piso';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar pisos' });
    res.status(200).json(results.map((r) => r.piso));
  });
});

// --- TABLERO: pacientes activos con el estado de sus 3 comidas de hoy ---
app.get('/api/cafeteria/pacientes', (req, res) => {
  const { piso, nombre } = req.query;

  let query = `
    SELECT
      p.id,
      p.piso,
      p.habitacion,
      p.nombre,
      MAX(CASE WHEN e.tipo_comida = 'desayuno' THEN DATE_FORMAT(e.hora_entrega, '%H:%i') END) AS desayuno_hora,
      MAX(CASE WHEN e.tipo_comida = 'comida' THEN DATE_FORMAT(e.hora_entrega, '%H:%i') END) AS comida_hora,
      MAX(CASE WHEN e.tipo_comida = 'cena' THEN DATE_FORMAT(e.hora_entrega, '%H:%i') END) AS cena_hora,
      COUNT(e.id) AS entregas_hoy
    FROM cafeteria_pacientes p
    LEFT JOIN cafeteria_entregas e ON e.id_paciente = p.id AND e.fecha = CURDATE()
    WHERE p.activo = 1
  `;
  const params = [];
  if (piso) { query += ' AND p.piso = ?'; params.push(piso); }
  if (nombre) { query += ' AND (p.nombre LIKE ? OR p.habitacion LIKE ?)'; params.push(`%${nombre}%`, `%${nombre}%`); }
  query += ' GROUP BY p.id ORDER BY p.piso, p.habitacion';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar pacientes' });
    res.status(200).json(results);
  });
});

// --- HISTORIAL DEL DÍA DE UN PACIENTE (al expandir su tarjeta en el tablero) ---
app.get('/api/cafeteria/pacientes/:id/entregas', (req, res) => {
  const { id } = req.params;
  const { fecha } = req.query;

  const query = `
    SELECT tipo_comida, lugar_entrega, platillo, DATE_FORMAT(hora_entrega, '%H:%i') AS hora
    FROM cafeteria_entregas
    WHERE id_paciente = ? AND fecha = COALESCE(?, CURDATE())
    ORDER BY hora_entrega ASC
  `;

  db.query(query, [id, fecha || null], (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar historial del día' });
    res.status(200).json(results);
  });
});

// --- AUTOCOMPLETADO DE PACIENTES ACTIVOS (para la pantalla Registrar) ---
app.get('/api/cafeteria/pacientes/buscar', (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.status(200).json([]);

  const query = `
    SELECT id, piso, habitacion, nombre
    FROM cafeteria_pacientes
    WHERE activo = 1 AND (nombre LIKE ? OR habitacion LIKE ?)
    ORDER BY nombre
    LIMIT 8
  `;

  db.query(query, [`%${q}%`, `%${q}%`], (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar pacientes' });
    res.status(200).json(results);
  });
});

// --- ALTA DE UN PACIENTE EN UNA HABITACIÓN (una habitación no puede tener 2 pacientes activos a la vez) ---
app.post('/api/cafeteria/pacientes', (req, res) => {
  const { piso, habitacion, nombre, id_usuario_registro } = req.body;
  if (!piso || !habitacion || !nombre) {
    return res.status(400).json({ success: false, mensaje: 'Piso, habitación y nombre son obligatorios' });
  }

  const queryOcupada = `
    SELECT id, nombre FROM cafeteria_pacientes
    WHERE piso = ? AND habitacion = ? AND activo = 1
    LIMIT 1
  `;

  db.query(queryOcupada, [piso, habitacion], (errCheck, ocupada) => {
    if (errCheck) return res.status(500).json({ success: false, mensaje: 'Error al validar la habitación' });
    if (ocupada.length > 0) {
      return res.status(409).json({
        success: false,
        mensaje: `La habitación ${habitacion} ya tiene un paciente activo (${ocupada[0].nombre}). Da de alta a ese paciente antes de registrar a otro.`,
      });
    }

    const query = `
      INSERT INTO cafeteria_pacientes (piso, habitacion, nombre, id_usuario_registro)
      VALUES (?, ?, ?, ?)
    `;

    db.query(query, [piso, habitacion, nombre, id_usuario_registro || null], (err, result) => {
      if (err) return res.status(500).json({ success: false, mensaje: 'Error al registrar paciente' });
      res.status(200).json({ success: true, id: result.insertId });
    });
  });
});

// --- BAJA DE UN PACIENTE (ya no se le siguen registrando comidas) ---
app.put('/api/cafeteria/pacientes/:id/alta', (req, res) => {
  const { id } = req.params;
  const query = "UPDATE cafeteria_pacientes SET activo = 0, fecha_alta = CURDATE() WHERE id = ?";

  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al dar de alta al paciente' });
    res.status(200).json({ success: true });
  });
});

// --- REGISTRAR: entrega de una comida, validando horario y evitando duplicados del mismo día ---
app.post('/api/cafeteria/entregas', (req, res) => {
  const { id_paciente, tipo_comida, lugar_entrega, platillo, id_usuario_registro } = req.body;

  if (!id_paciente || !tipo_comida || !lugar_entrega) {
    return res.status(400).json({ success: false, mensaje: 'Faltan datos obligatorios' });
  }
  if (!['habitacion', 'comedor'].includes(lugar_entrega)) {
    return res.status(400).json({ success: false, mensaje: 'Lugar de entrega inválido' });
  }

  const queryHorario = `
    SELECT hora_inicio, hora_fin, (CURTIME() BETWEEN hora_inicio AND hora_fin) AS dentro_horario
    FROM cafeteria_horarios
    WHERE tipo_comida = ?
  `;

  db.query(queryHorario, [tipo_comida], (err, rows) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al validar horario' });
    if (rows.length === 0) {
      return res.status(400).json({ success: false, mensaje: 'Tipo de comida inválido' });
    }

    const { hora_inicio, hora_fin, dentro_horario } = rows[0];
    if (!dentro_horario) {
      return res.status(400).json({
        success: false,
        mensaje: `Fuera de horario: ${tipo_comida} se registra de ${hora_inicio.slice(0, 5)} a ${hora_fin.slice(0, 5)}.`,
      });
    }

    const queryInsert = `
      INSERT INTO cafeteria_entregas (id_paciente, tipo_comida, lugar_entrega, platillo, fecha, hora_entrega, id_usuario_registro)
      VALUES (?, ?, ?, ?, CURDATE(), NOW(), ?)
    `;

    db.query(
      queryInsert,
      [id_paciente, tipo_comida, lugar_entrega, platillo || null, id_usuario_registro || null],
      (err2, result) => {
        if (err2) {
          if (err2.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, mensaje: 'Ya se registró esta comida hoy para este paciente.' });
          }
          console.error('Error en INSERT de cafeteria_entregas:', err2);
          return res.status(500).json({ success: false, mensaje: 'Error al registrar la entrega' });
        }
        res.status(200).json({ success: true, id: result.insertId });
      }
    );
  });
});

// --- HISTORIAL DE ENTREGAS (filtrable por día, piso, nombre y tipo de comida) ---
app.get('/api/cafeteria/historial', (req, res) => {
  const { piso, nombre, fecha, tipo_comida } = req.query;

  let query = `
    SELECT
      e.id,
      e.tipo_comida,
      e.lugar_entrega,
      e.platillo,
      DATE_FORMAT(e.hora_entrega, '%H:%i') AS hora,
      IF(e.fecha = CURDATE(), 'Hoy', DATE_FORMAT(e.fecha, '%d/%m/%Y')) AS fecha_label,
      p.piso,
      p.habitacion,
      p.nombre,
      u.name AS registrado_por
    FROM cafeteria_entregas e
    JOIN cafeteria_pacientes p ON p.id = e.id_paciente
    LEFT JOIN users u ON u.id = e.id_usuario_registro
    WHERE 1 = 1
  `;
  const params = [];
  if (fecha) { query += ' AND e.fecha = ?'; params.push(fecha); }
  if (piso) { query += ' AND p.piso = ?'; params.push(piso); }
  if (nombre) { query += ' AND (p.nombre LIKE ? OR p.habitacion LIKE ?)'; params.push(`%${nombre}%`, `%${nombre}%`); }
  if (tipo_comida) { query += ' AND e.tipo_comida = ?'; params.push(tipo_comida); }
  query += ' ORDER BY e.hora_entrega DESC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al consultar historial' });
    res.status(200).json(results);
  });
});

const PORT = process.env.PORT || 3000;
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