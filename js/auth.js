/**
 * Módulo de autenticación para MoviSimple
 * Maneja el registro y login de usuarios
 */

// Clase para manejar la autenticación
class Auth {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.loadUsers();
    }

    // Cargar usuarios desde localStorage (simulando users.txt)
    loadUsers() {
        const storedUsers = localStorage.getItem('movisimple_users');
        if (storedUsers) {
            this.users = JSON.parse(storedUsers);
        }
    }

    // Guardar usuarios en localStorage (simulando users.txt)
    saveUsers() {
        localStorage.setItem('movisimple_users', JSON.stringify(this.users));
    }

    // Registrar un nuevo usuario
    register(name, email, password) {
        // Verificar si el correo ya está registrado
        if (this.users.some(user => user.email === email)) {
            throw new Error('Este correo electrónico ya está registrado');
        }

        // Crear nuevo usuario
        const newUser = {
            name,
            email,
            password // En una aplicación real, la contraseña debería estar hasheada
        };

        // Agregar a la lista y guardar
        this.users.push(newUser);
        this.saveUsers();
        return true;
    }

    // Iniciar sesión
    login(email, password) {
        const user = this.users.find(user => user.email === email && user.password === password);
        
        if (!user) {
            throw new Error('Correo o contraseña incorrectos');
        }

        // Guardar sesión
        this.currentUser = user;
        localStorage.setItem('movisimple_current_user', JSON.stringify(user));
        return user;
    }

    // Cerrar sesión
    logout() {
        this.currentUser = null;
        localStorage.removeItem('movisimple_current_user');
    }

    // Verificar si hay una sesión activa
    checkSession() {
        const storedUser = localStorage.getItem('movisimple_current_user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            return this.currentUser;
        }
        return null;
    }
}

// Instancia global de autenticación
const auth = new Auth();

// Elementos DOM para navegación entre pantallas
const welcomeScreen = document.getElementById('welcome-screen');
const registerScreen = document.getElementById('register-screen');
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');

// Botones de navegación
const toLoginBtn = document.getElementById('to-login-btn');
const toRegisterBtn = document.getElementById('to-register-btn');
const registerBackBtn = document.getElementById('register-back-btn');
const loginBackBtn = document.getElementById('login-back-btn');
const registerToLogin = document.getElementById('register-to-login');
const loginToRegister = document.getElementById('login-to-register');
const logoutBtn = document.getElementById('logout-btn');

// Formularios
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// Elementos para mostrar información de usuario
const userNameDisplay = document.getElementById('user-name');

// Función para mostrar una pantalla específica
function showScreen(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla solicitada
    document.getElementById(screenId).classList.add('active');
}

// Función para mostrar mensajes de error o éxito
function showMessage(message, isError = false, parentElement = null) {
    // Eliminar mensajes anteriores
    const oldMessages = document.querySelectorAll('.message');
    oldMessages.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isError ? 'error' : 'success'}`;
    messageElement.textContent = message;
    
    // Insertar mensaje en el elemento padre o en el formulario activo
    if (parentElement) {
        parentElement.insertBefore(messageElement, parentElement.firstChild);
    } else {
        const activeScreen = document.querySelector('.screen.active');
        const form = activeScreen.querySelector('form');
        if (form) {
            form.insertBefore(messageElement, form.firstChild);
        } else {
            activeScreen.querySelector('.auth-container, .welcome-content, .main-content').insertBefore(messageElement, activeScreen.querySelector('.auth-container, .welcome-content, .main-content').firstChild);
        }
    }
    
    // Eliminar mensaje después de 5 segundos
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// Eventos para navegación entre pantallas
toLoginBtn.addEventListener('click', () => showScreen('login-screen'));
toRegisterBtn.addEventListener('click', () => showScreen('register-screen'));
registerBackBtn.addEventListener('click', () => showScreen('welcome-screen'));
loginBackBtn.addEventListener('click', () => showScreen('welcome-screen'));
registerToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('login-screen');
});
loginToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('register-screen');
});

// Evento para el formulario de registro
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    
    try {
        auth.register(name, email, password);
        showMessage('Registro exitoso. Ahora puedes iniciar sesión.');
        
        // Limpiar formulario
        registerForm.reset();
        
        // Redirigir a login
        setTimeout(() => {
            showScreen('login-screen');
        }, 1500);
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Evento para el formulario de login
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    try {
        const user = auth.login(email, password);
        showMessage('Inicio de sesión exitoso.');
        
        // Mostrar nombre de usuario
        userNameDisplay.textContent = user.name;
        
        // Limpiar formulario
        loginForm.reset();
        
        // Redirigir a la pantalla principal
        setTimeout(() => {
            showScreen('main-screen');
        }, 1000);
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Evento para cerrar sesión
logoutBtn.addEventListener('click', function() {
    auth.logout();
    showScreen('welcome-screen');
});

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const user = auth.checkSession();
    if (user) {
        userNameDisplay.textContent = user.name;
        showScreen('main-screen');
    } else {
        showScreen('welcome-screen');
    }
});
