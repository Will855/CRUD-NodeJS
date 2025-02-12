const pool = require('../database/db'); // Importar el pool de conexiones
const bcrypt = require('bcrypt'); // Para el manejo de contraseñas

const controller = {};

// Listar todos los clientes
controller.list = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios');
        res.render('customers', { data: rows });
    } catch (err) {
        console.error('Error al obtener los datos:', err);
        res.status(500).send('Error al obtener los datos');
    }
};

// Guardar un nuevo cliente
controller.save = async (req, res) => {
    const data = req.body;

    // Validar que los datos no estén vacíos
    if (!data.name || !data.email || !data.password) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    try {
        // Hashear la contraseña antes de guardarla
        data.password.trim();
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        // Reemplazar la contraseña en el objeto `data` con la contraseña hasheada
        data.password = hashedPassword;
        console.log(hashedPassword);
        
        // Guardar los datos en la base de datos
        await pool.query('INSERT INTO usuarios SET ?', [data]);
        res.redirect('/');
    } catch (err) {
        console.error('Error al guardar los datos:', err);
        res.status(500).send('Error al guardar los datos');
    }
};

// Editar un cliente
controller.edit = async (req, res) => {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!id) {
        return res.status(400).send('ID no proporcionado');
    }

    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).send('Cliente no encontrado');
        }
        res.render('_edit', { data: rows[0] });
    } catch (err) {
        console.error('Error al obtener los datos del cliente:', err);
        res.status(500).send('Error al obtener los datos del cliente');
    }
};

// Actualizar un cliente
controller.update = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Validar que los datos no estén vacíos
    if (!id || !name || !email || !password) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET name = ?, email = ?, password = ? WHERE id = ?',
            [name, email, password, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).send('Cliente no encontrado');
        }
        res.redirect('/');
    } catch (err) {
        console.error('Error al actualizar el cliente:', err);
        res.status(500).send('Error al actualizar el cliente');
    }
};

// Eliminar un cliente
controller.delete = async (req, res) => {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!id) {
        return res.status(400).send('ID no proporcionado');
    }

    try {
        const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Cliente no encontrado');
        }
        res.redirect('/');
    } catch (err) {
        console.error('Error al eliminar el cliente:', err);
        res.status(500).send('Error al eliminar el cliente');
    }
};

module.exports = controller;