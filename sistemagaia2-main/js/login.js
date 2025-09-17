function togglePassword(inputId, el) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        el.textContent = "🙈";
    } else {
        input.type = "password";
        el.textContent = "👁️";
    }
}

// Troca de abas
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

tabLogin.onclick = () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginForm.style.display = '';
    registerForm.style.display = 'none';
};
tabRegister.onclick = () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    registerForm.style.display = '';
    loginForm.style.display = 'none';
};

function showLoginScreen() {
    document.getElementById('loginContainer').style.display = '';
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.main').style.display = 'none';
    // Mostra só o formulário de login por padrão
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
}

function showAppScreen() {
    document.getElementById('loginContainer').style.display = 'none';
    document.querySelector('.header').style.display = '';
    document.querySelector('.main').style.display = '';
}

// Exibe a tela correta ao carregar
document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        showAppScreen();
    } else {
        showLoginScreen();
    }

    // Evento de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('loggedUser');
            showLoginScreen();
        });
    }
});

// Login simples (exemplo)
loginForm.onsubmit = function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('loggedUser', JSON.stringify(user));
        localStorage.setItem('usuarioLogado', '1');
        showAppScreen();
    } else {
        alert('Email ou senha inválidos');
    }
};

// Cadastro simples (exemplo)
registerForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const password2 = document.getElementById('registerPassword2').value;
    if (password !== password2) {
        alert('As senhas não coincidem');
        return;
    }
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        alert('Email já cadastrado');
        return;
    }
    const user = { name, email, password };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedUser', JSON.stringify(user));
    localStorage.setItem('usuarioLogado', '1');
    showAppScreen();
};