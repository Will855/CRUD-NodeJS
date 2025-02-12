const auth = {};
const pool = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { use } = require('../app');
require('dotenv').config();

auth.login = async (req, res) => {
    // #region Configuración inicial
    console.log('[Login] Iniciando proceso de login');
    console.log('[Login] Body recibido:', { email: req.body.email, password: '***' });
    let conn; // Variable para mantener la conexión de base de datos
    // #endregion

    // 1. Validación de campos obligatorios
    const { email, password } = req.body;
    if (!email || !password) {
        console.log('[Login] Error: Campos obligatorios faltantes');
        return res.status(400).json({
            ok: false,
            message: 'Correo y contraseña son obligatorios'
        });
    }

    try {
        // #region Conexión a base de datos
        console.log('[Login] Obteniendo conexión de la base de datos...');
        conn = await pool.getConnection(); // Obtener conexión individual del pool
        console.log(`[Login] Conexión obtenida (ID: ${conn.threadId})`);
        // #endregion

        // 2. Búsqueda segura de usuario
        console.log(`[Login] Buscando usuario: ${email}`);
        const query = 'SELECT id, name, email, password FROM usuarios WHERE email = ?';
        const [rows] = await conn.query(query, [email]); // Usar conexión específica

        // 3. Validación de existencia de usuario
        if (rows.length === 0) {
            console.log('[Login] Usuario no encontrado');
            return res.status(401).json({
                ok: false,
                message: 'Credenciales inválidas'
            });
        }

        // #region Procesamiento de usuario
        const user = rows[0];
        console.log(`[Login] Usuario encontrado - ID: ${user.id}`);

        // 4. Validación de contraseña con bcrypt
        console.log('[Login] Validando contraseña...');

        const passwordValida = await bcrypt.compare(password, user.password, /*(err, result) => {
            if (err) throw err;
            console.log(result); 
        } no se puede utilizar callback y promesas al mismo tiempo*/);
        
        if (!passwordValida) {
            console.log('[Login] Contraseña incorrecta');
            return res.status(401).json({
                ok: false,
                message: 'Credenciales inválidas'
            });
        }
        // #endregion

        // 5. Generación de token JWT
        console.log('[Login] Generando token de acceso...');
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 6. Preparación de respuesta exitosa
        console.log('[Login] Preparando respuesta...');
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        // #region Limpieza de conexión
        console.log(`[Login] Liberando conexión (ID: ${conn.threadId})...`);
        await conn.release(); // Liberar conexión explícitamente
        // #endregion

        // 7. Envío de respuesta final
        console.log('[Login] Autenticación exitosa');
        res.json({
            ok: true,
            token,
            user: userData
        });

    } catch (error) {
        // #region Manejo de errores
        console.error('[Login] Error en el proceso:', error.message);

        // Manejo específico de errores de base de datos
        if (error.code && error.code.startsWith('ER_')) {
            console.error('[Login] Error de MySQL:', error.code);
            return res.status(503).json({
                ok: false,
                message: 'Error temporal en el servicio de autenticación'
            });
        }

        // Manejo genérico de errores
        res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
        // #endregion
    } finally {
        if (conn) {
            try {
                conn.release();
                console.log(`🔁 Conexión ${conn.threadId} liberada correctamente`);
            } catch (releaseError) {
                console.error('🔥 Error crítico de conexión:', {
                    threadId: conn.threadId,
                    error: releaseError.message
                });
            }
        }
    }
};

module.exports = auth;