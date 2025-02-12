// database/db.js
const mysql = require('mysql2/promise');

/**
 * Configuración avanzada del pool de conexiones MySQL
 * @returns {Promise<mysql.Pool>} Instancia del pool de conexiones
 */
const createPool = () => {
    // 1. Configuración desde variables de entorno
    const poolConfig = {
        host: process.env.DB_HOST || '127.0.0.1', // Mejor usar IPv4 explícito
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'users',
        port: parseInt(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 10,
        queueLimit: 0, // Ilimitadas peticiones en cola
        namedPlaceholders: true, // Habilita parámetros nombrados
        timezone: 'local', // Sincroniza zona horaria
        charset: 'utf8mb4_unicode_ci' // Codificación correcta para caracteres especiales
    };

    // 2. Crear pool de conexiones
    const pool = mysql.createPool(poolConfig);

    // 3. Manejadores de eventos para monitoreo
    pool.on('acquire', (connection) => {
        console.log(`🔄 Conexión ${connection.threadId} adquirida`);
    });

    pool.on('release', (connection) => {
        console.log(`🔁 Conexión ${connection.threadId} liberada`);
    });

    pool.on('enqueue', () => {
        console.log('⌛ Petición en cola esperando conexión disponible');
    });

    // 4. Prueba inicial de conexión
    const testConnection = async () => {
        let conn;
        try {
            conn = await pool.getConnection();
            console.log('✅ Prueba de conexión exitosa');
            
            // Verificar versión de MySQL
            const [rows] = await conn.query('SELECT VERSION() AS version');
            console.log(`📌 Versión de MySQL: ${rows[0].version}`);
            
        } catch (error) {
            console.error('❌ Error en prueba de conexión:', error.message);
            process.exit(1); // Falla crítica, detener aplicación
        } finally {
            if (conn) conn.release();
        }
    };

    testConnection();

    return pool;
};

// 5. Exportar pool configurado
module.exports = createPool();