require('dotenv').config(); // Carga variables de entorno
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const pool = require('./database/db');

// Configuración inicial
const app = express();

app.use((req, res, next) => {
    req.db = require('./database/db'); // Adjunta el pool al request
    next();
});

// ========================
//  Configuración Básica
// ========================
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========================
//  Middlewares Generales
// ========================
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de CORS dinámica (Desarrollo/Producción)
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN_PROD
        : process.env.CORS_ORIGIN_DEV,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Logging condicional según entorno
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined')); // Logs detallados en producción
    app.disable('x-powered-by'); // Seguridad: Ocultar tecnología
} else {
    app.use(morgan('dev')); // Logs simples en desarrollo
}

// ========================
//  Configuración de BD
// ========================
app.get('/data', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.query('SELECT * FROM customers');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error de base de datos');
    } finally {
        if (conn) conn.release();
    }
});

// ========================
//        Rutas
// ========================
const customerRoutes = require('./routes/customer');
app.use('/', customerRoutes);

// ========================
//  Manejo de Errores
// ========================
app.use((err, req, res, next) => {
    console.error('🔥 Error Global:', {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : 'Oculto en producción',
        url: req.originalUrl,
        method: req.method
    });

    res.status(err.statusCode || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err.details
        })
    });
});

// ========================
//  Inicio del Servidor
// ========================
app.listen(app.get('port'), () => {
    console.log(`🚀 Servidor iniciado en puerto ${app.get('port')}`);
    console.log(`👉 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`👉 Acceso: http://localhost:${app.get('port')}`);
});

module.exports = app;