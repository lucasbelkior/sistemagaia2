// Gerenciamento de autenticação
class AuthManager {
    constructor() {
        this.loginModal = document.getElementById('loginModal');
        this.loginForm = document.getElementById('loginForm');
        this.userBtn = document.getElementById('userBtn');
        this.userDropdown = document.getElementById('userDropdown');
        this.userName = document.getElementById('userName');
        this.adminLink = document.getElementById('adminLink');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.closeLogin = document.getElementById('closeLogin');
        
        this.init();
    }

    init() {
        // Event listeners
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.userBtn.addEventListener('click', () => this.toggleUserDropdown());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        this.adminLink.addEventListener('click', (e) => this.handleAdminAccess(e));
        this.closeLogin.addEventListener('click', () => this.hideLoginModal());
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.userBtn.contains(e.target)) {
                this.userDropdown.classList.remove('show');
            }
        });

        // Fechar modal ao clicar fora
        this.loginModal.addEventListener('click', (e) => {
            if (e.target === this.loginModal) {
                this.hideLoginModal();
            }
        });

        // Verificar se usuário está logado
        this.checkAuthState();
    }

    checkAuthState() {
        if (window.dataManager.isLoggedIn()) {
            this.updateUI();
        } else {
            this.showLoginModal();
        }
    }

    showLoginModal() {
        this.loginModal.classList.add('show');
        document.getElementById('email').focus();
    }

    hideLoginModal() {
        this.loginModal.classList.remove('show');
        this.loginForm.reset();
    }

    toggleUserDropdown() {
        this.userDropdown.classList.toggle('show');
    }

    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const result = window.dataManager.login(email, password);
        
        if (result.success) {
            this.hideLoginModal();
            this.updateUI();
            window.uiManager.showToast('Login realizado com sucesso!', 'success');
        } else {
            window.uiManager.showToast(result.message, 'error');
        }
    }

    handleLogout() {
        window.dataManager.logout();
        this.userDropdown.classList.remove('show');
        document.body.classList.remove('admin');
        window.uiManager.showPage('home');
        this.showLoginModal();
        window.uiManager.showToast('Logout realizado com sucesso!', 'success');
    }

    handleAdminAccess(e) {
        e.preventDefault();
        if (window.dataManager.isAdmin()) {
            window.uiManager.showPage('admin');
            this.userDropdown.classList.remove('show');
        }
    }

    updateUI() {
        const user = window.dataManager.currentUser;
        if (user) {
            this.userName.textContent = user.name;
            
            if (user.isAdmin) {
                document.body.classList.add('admin');
                this.adminLink.style.display = 'block';
            } else {
                document.body.classList.remove('admin');
                this.adminLink.style.display = 'none';
            }
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});