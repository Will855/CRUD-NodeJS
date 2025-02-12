import User from "./user.js";

const usuario = new User();
// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const paymentSection = document.getElementById('paymentSection');
const messageDiv = document.getElementById('message');

// Manejador de Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        // Validación básica en front
        if (!email || !password) {
            throw new Error('Todos los campos son obligatorios');
        }

        // Usamos los valores directamente sin asignar al objeto
        await usuario.login(email, password);
        
        // Sanitizar campos después del login exitoso
        loginForm.reset();
        
        updateUI();
        showMessage('Autenticación exitosa!', 'green');

    } catch (error) {
        showMessage(error.message, 'red');
        document.getElementById('password').value = ''; // Limpiar solo el password en errores
    }
});

// Manejador de Logout
logoutBtn.addEventListener('click', () => {
    usuario.logout();
    updateUI();
    showMessage('Sesión cerrada correctamente', 'blue');
    loginForm.reset();
});

// Actualizar interfaz
function updateUI() {
    const currentUser = usuario.user;

    // Toggle sections
    userInfo.classList.toggle('hidden', !usuario.isAuth);
    paymentSection.classList.toggle('hidden', !usuario.isAuth);
    logoutBtn.classList.toggle('hidden', !usuario.isAuth);
    loginForm.classList.toggle('hidden', usuario.isAuth);

    // Actualizar datos usuario
    if (currentUser) {
        document.getElementById('userName').textContent = `Nombre: ${currentUser.name}`;
        document.getElementById('userEmail').textContent = `Email: ${currentUser.email}`;
    }
}

// Mostrar mensajes
function showMessage(text, color = 'blue') {
    messageDiv.textContent = text;
    messageDiv.className = `mt-4 text-center text-${color}-600`;
    setTimeout(() => messageDiv.textContent = '', 3000);
}