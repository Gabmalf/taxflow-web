
USE DB_TAXFLOW;
GO

-- ==========================================
-- 1. TABLAS MAESTRAS (PARAMÉTRICAS)
-- ==========================================
CREATE TABLE monedas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo VARCHAR(3) NOT NULL UNIQUE CHECK(codigo IN ('PEN', 'USD')),
    nombre VARCHAR(50) NOT NULL,
    simbolo VARCHAR(5) NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'INACTIVO'))
);

CREATE TABLE tipos_renta (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'INACTIVO'))
);

CREATE TABLE tipos_ingreso (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_renta_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'INACTIVO')),
    CONSTRAINT fk_tipos_ingreso_renta FOREIGN KEY (tipo_renta_id) REFERENCES tipos_renta(id)
);

CREATE TABLE categorias_gasto (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    porcentaje_deduccion DECIMAL(5,2) NOT NULL CHECK(porcentaje_deduccion >= 0 AND porcentaje_deduccion <= 100),
    descripcion VARCHAR(255) NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'INACTIVO'))
);

CREATE TABLE tipos_comprobante (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'INACTIVO'))
);

-- ==========================================
-- 2. GESTIÓN DE USUARIOS
-- ==========================================
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    ruc VARCHAR(11) NULL UNIQUE CHECK(LEN(ruc) = 11 AND ruc NOT LIKE '%[^0-9]%'),
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'INACTIVO', 'BLOQUEADO')),
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE perfiles_tributarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    tipo_renta_principal_id INT NULL,
    suspension_cuarta_categoria BIT DEFAULT 0,
    agente_retencion BIT DEFAULT 0,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_perfil_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_perfil_renta FOREIGN KEY (tipo_renta_principal_id) REFERENCES tipos_renta(id)
);

CREATE TABLE configuracion_accesibilidad (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    modo_oscuro BIT DEFAULT 0,
    tamano_fuente VARCHAR(20) DEFAULT 'MEDIANO' CHECK(tamano_fuente IN ('PEQUENO', 'MEDIANO', 'GRANDE')),
    alto_contraste BIT DEFAULT 0,
    CONSTRAINT fk_accesibilidad_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE sesiones_usuario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    fecha_expiracion DATETIME2 NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'REVOCADO', 'EXPIRADO')),
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_sesion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ==========================================
-- 3. MÓDULOS TRANSACCIONALES
-- ==========================================
CREATE TABLE comprobantes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_comprobante_id INT NOT NULL,
    serie VARCHAR(10) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    emisor_ruc VARCHAR(11) NOT NULL CHECK(LEN(emisor_ruc) = 11 AND emisor_ruc NOT LIKE '%[^0-9]%'),
    emisor_razon_social VARCHAR(150) NOT NULL,
    fecha_emision DATE NOT NULL,
    moneda_id INT NOT NULL,
    monto_total DECIMAL(12,2) NOT NULL CHECK(monto_total >= 0),
    url_archivo VARCHAR(255) NULL,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_comprobante_tipo FOREIGN KEY (tipo_comprobante_id) REFERENCES tipos_comprobante(id),
    CONSTRAINT fk_comprobante_moneda FOREIGN KEY (moneda_id) REFERENCES monedas(id)
);

CREATE TABLE ingresos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_ingreso_id INT NOT NULL,
    moneda_id INT NOT NULL,
    monto DECIMAL(12,2) NOT NULL CHECK(monto >= 0),
    fecha_ingreso DATE NOT NULL,
    descripcion VARCHAR(255) NULL,
    retencion_aplicada DECIMAL(12,2) DEFAULT 0 CHECK(retencion_aplicada >= 0),
    comprobante_id INT NULL,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_ingreso_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_ingreso_tipo FOREIGN KEY (tipo_ingreso_id) REFERENCES tipos_ingreso(id),
    CONSTRAINT fk_ingreso_moneda FOREIGN KEY (moneda_id) REFERENCES monedas(id),
    CONSTRAINT fk_ingreso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobantes(id)
);

CREATE TABLE gastos_deducibles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    categoria_gasto_id INT NOT NULL,
    comprobante_id INT NULL UNIQUE,
    monto_total DECIMAL(12,2) NOT NULL CHECK(monto_total >= 0),
    monto_deducible DECIMAL(12,2) NOT NULL CHECK(monto_deducible >= 0),
    fecha_gasto DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_gasto_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_gasto_categoria FOREIGN KEY (categoria_gasto_id) REFERENCES categorias_gasto(id),
    CONSTRAINT fk_gasto_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobantes(id)
);

-- ==========================================
-- 4. INFORMACIÓN, ALERTAS Y SOPORTE
-- ==========================================
CREATE TABLE normativas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    enlace_oficial VARCHAR(255) NULL,
    fecha_publicacion DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'VIGENTE' CHECK(estado IN ('VIGENTE', 'DEROGADA')),
    fecha_creacion DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE calendario_sunat (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ultimo_digito_ruc CHAR(1) NOT NULL CHECK(ultimo_digito_ruc IN ('0','1','2','3','4','5','6','7','8','9')),
    periodo_mes INT NOT NULL CHECK(periodo_mes BETWEEN 1 AND 12),
    periodo_anio INT NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'PROXIMO' CHECK(estado IN ('PROXIMO', 'CUMPLIDO', 'VENCIDO'))
);

CREATE TABLE notificaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje VARCHAR(500) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK(tipo IN ('ALERTA', 'INFORMATIVO', 'VENCIMIENTO')),
    estado VARCHAR(20) DEFAULT 'NO_LEIDO' CHECK(estado IN ('NO_LEIDO', 'LEIDO', 'ARCHIVADO')),
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE consultas_soporte (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CERRADO')),
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_consulta_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
GO

-- ==========================================
-- INSERTS INICIALES / SEEDERS
-- ==========================================

-- Monedas
INSERT INTO monedas (codigo, nombre, simbolo) VALUES
('PEN', 'Soles', 'S/'),
('USD', 'Dólares Americanos', '$');

-- Tipos de Renta
INSERT INTO tipos_renta (nombre, descripcion) VALUES
('Cuarta Categoría', 'Ingresos por trabajo independiente (Recibos por honorarios)'),
('Quinta Categoría', 'Ingresos por trabajo dependiente (Planilla)');

-- Tipos de Ingreso
INSERT INTO tipos_ingreso (tipo_renta_id, nombre) VALUES
(1, 'Honorarios Profesionales'),
(1, 'Dietas de Directorio'),
(2, 'Sueldo Fijo'),
(2, 'Gratificaciones'),
(2, 'Utilidades');

-- Categorías de Gasto Deducible
INSERT INTO categorias_gasto (nombre, porcentaje_deduccion, descripcion) VALUES
('Restaurantes, bares y hoteles', 25.00, 'Consumos sustentados con boleta electrónica o ticket.'),
('Servicios profesionales', 30.00, 'Honorarios de médicos, odontólogos y otras profesiones.'),
('Alquiler de inmuebles', 30.00, 'Arrendamiento de bienes inmuebles para vivienda.'),
('Aportaciones a ESSALUD', 100.00, 'Aportaciones de trabajadores del hogar.');

-- Tipos de Comprobante
INSERT INTO tipos_comprobante (codigo, nombre) VALUES
('01', 'Factura Electrónica'),
('02', 'Recibo por Honorarios Electrónico'),
('03', 'Boleta de Venta Electrónica'),
('04', 'Liquidación de Compra');

-- Normativas Tributarias de Ejemplo
INSERT INTO normativas (titulo, contenido, enlace_oficial, fecha_publicacion) VALUES
('Valor de la UIT 2026', 'Se aprueba el nuevo valor de la Unidad Impositiva Tributaria (UIT) aplicable para el año 2026 por un valor de S/ 5,400.', 'https://www.gob.pe/sunat', '2025-12-28'),
('Nuevo cronograma de obligaciones mensuales', 'Resolución que aprueba el cronograma para la declaración y pago de impuestos de cuarta categoría correspondientes al ejercicio.', 'https://www.gob.pe/sunat', '2026-01-10');

-- Calendario SUNAT Simulado 2026 (Periodo Enero)
INSERT INTO calendario_sunat (ultimo_digito_ruc, periodo_mes, periodo_anio, fecha_vencimiento) VALUES
('0', 1, 2026, '2026-02-14'), ('1', 1, 2026, '2026-02-15'),
('2', 1, 2026, '2026-02-16'), ('3', 1, 2026, '2026-02-17'),
('4', 1, 2026, '2026-02-18'), ('5', 1, 2026, '2026-02-19'),
('6', 1, 2026, '2026-02-20'), ('7', 1, 2026, '2026-02-21'),
('8', 1, 2026, '2026-02-22'), ('9', 1, 2026, '2026-02-23');

-- Usuario de Ejemplo para Notificaciones
INSERT INTO usuarios (correo, password_hash, nombres, apellidos, ruc) VALUES
('contribuyente@taxflow.com', 'hash_protegido_xyz_890', 'Carlos', 'Mendoza', '10456789123');

INSERT INTO perfiles_tributarios (usuario_id, tipo_renta_principal_id) VALUES
(1, 1);

-- Notificaciones de Ejemplo
INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES
(1, 'Vencimiento Próximo', 'Su declaración mensual de Enero vence en 3 días. Recuerde declarar a tiempo para evitar multas.', 'VENCIMIENTO'),
(1, 'Bienvenido a TAXFLOW', 'Complete su perfil tributario para empezar a simular sus impuestos de manera precisa.', 'INFORMATIVO');
GO
