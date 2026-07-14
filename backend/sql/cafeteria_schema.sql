-- Módulo de Cafetería: control de comidas por paciente/habitación.
-- Ejecutar en Workbench sobre la base ya existente `registro_visitas`.

USE registro_visitas;

CREATE TABLE cafeteria_horarios (
  tipo_comida VARCHAR(20) NOT NULL PRIMARY KEY,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL
);

INSERT INTO cafeteria_horarios (tipo_comida, hora_inicio, hora_fin) VALUES
  ('desayuno', '07:00:00', '11:00:00'),
  ('comida',   '13:00:00', '16:00:00'),
  ('cena',     '19:00:00', '21:00:00');

CREATE TABLE cafeteria_pacientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  piso VARCHAR(50) NOT NULL,
  habitacion VARCHAR(20) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_ingreso DATE NOT NULL DEFAULT (CURRENT_DATE),
  fecha_alta DATE NULL,
  id_usuario_registro BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cafeteria_pacientes_usuario FOREIGN KEY (id_usuario_registro) REFERENCES users(id),
  INDEX idx_cafeteria_pacientes_piso (piso, activo)
);

CREATE TABLE cafeteria_entregas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT NOT NULL,
  tipo_comida VARCHAR(20) NOT NULL,
  lugar_entrega ENUM('habitacion', 'comedor') NOT NULL,
  platillo VARCHAR(150) NULL,
  fecha DATE NOT NULL,
  hora_entrega DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario_registro BIGINT UNSIGNED NULL,
  CONSTRAINT fk_cafeteria_entregas_paciente FOREIGN KEY (id_paciente) REFERENCES cafeteria_pacientes(id),
  CONSTRAINT fk_cafeteria_entregas_tipo FOREIGN KEY (tipo_comida) REFERENCES cafeteria_horarios(tipo_comida),
  CONSTRAINT fk_cafeteria_entregas_usuario FOREIGN KEY (id_usuario_registro) REFERENCES users(id),
  UNIQUE KEY uq_cafeteria_entrega_dia (id_paciente, tipo_comida, fecha)
);
