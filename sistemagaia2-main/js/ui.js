// Gerenciamento da interface do usuário
class UIManager {
    constructor() {
        this.currentPage = 'home';
        this.modals = {
            room: document.getElementById('roomModal'),
            schedule: document.getElementById('scheduleModal'),
            roomForm: document.getElementById('roomFormModal')
        };
        
        this.init();
    }

    init() {
        // Navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
            });
        });

        // Rooms
        document.addEventListener('click', (e) => {
            if (e.target.closest('.room')) {
                const room = e.target.closest('.room');
                const roomId = room.dataset.room;
                this.showRoomDetails(roomId);
            }
        });

        // Schedule modal
        document.getElementById('newScheduleBtn').addEventListener('click', () => {
            this.showScheduleModal();
        });

        document.getElementById('scheduleRoomBtn').addEventListener('click', () => {
            const roomId = this.modals.room.dataset.currentRoom;
            this.showScheduleModal(roomId);
            this.hideModal('room');
        });

        document.getElementById('scheduleForm').addEventListener('submit', (e) => {
            this.handleScheduleSubmit(e);
        });

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.classList.remove('show');
            });
        });

        // Fechar modais ao clicar fora
        Object.values(this.modals).forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Filtros de agendamento
        document.getElementById('unitFilter').addEventListener('change', () => this.filterSchedules());
        document.getElementById('typeFilter').addEventListener('change', () => this.filterSchedules());
        document.getElementById('dateFilter').addEventListener('change', () => this.filterSchedules());

        // Cancelar agendamento
        document.getElementById('cancelSchedule').addEventListener('click', () => {
            this.hideModal('schedule');
        });

        this.loadSchedules();
        this.loadReports();

        // --- LOGIN/CADASTRO MODAL ---
        this.loginScreen = document.getElementById('loginScreen');
        this.loginForm = document.getElementById('loginForm');

        // Login
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            // Usuário fixo de exemplo
            if (email === 'admin@admin.com' && password === '1234') {
                localStorage.setItem('loggedUser', email);
                this.hideLoginScreen();
                location.reload();
            } else {
                alert('Email ou senha inválidos');
            }
        });

        // Checa login ao iniciar
        this.checkLogin();
    }

    showPage(pageId) {
        // Atualizar navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // Mostrar página
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`${pageId}Page`).classList.add('active');

        this.currentPage = pageId;

        // Carregar dados específicos da página
        if (pageId === 'schedule') {
            this.loadSchedules();
        } else if (pageId === 'reports') {
            this.loadReports();
        } else if (pageId === 'admin') {
            window.adminManager.loadAdminData();
        }
    }

    showModal(modalName, data = null) {
        const modal = this.modals[modalName];
        if (modal) {
            if (data) {
                modal.dataset.currentRoom = data;
            }
            modal.classList.add('show');
        }
    }

    hideModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.remove('show');
        }
    }

    showRoomDetails(roomId) {
        const room = window.dataManager.getRoom(roomId);
        if (!room) return;

        const unit = window.dataManager.units.find(u => u.id === room.unit);
        
        document.getElementById('roomTitle').textContent = room.name;
        
        const roomDetails = document.getElementById('roomDetails');
        roomDetails.innerHTML = `
            <div class="room-info">
                <div class="info-item">
                    <span class="info-label">Unidade</span>
                    <span class="info-value">${unit.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tipo</span>
                    <span class="info-value">${room.type === 'auditorium' ? 'Auditório' : 'Sala de Aula'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Capacidade</span>
                    <span class="info-value">${room.capacity} pessoas</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="info-value status-indicator ${room.status}">
                        ${room.status === 'available' ? 'Disponível' : 'Ocupado'}
                    </span>
                </div>
            </div>
            <div class="room-resources">
                <h4>Recursos Disponíveis</h4>
                <div class="resources-list">
                    ${room.resources.map(resource => 
                        `<span class="resource-tag">${resource}</span>`
                    ).join('')}
                </div>
            </div>
        `;

        this.showModal('room', roomId);
    }

    showScheduleModal(roomId = null) {
        const scheduleRoom = document.getElementById('scheduleRoom');
        
        // Limpar e popular opções de salas
        scheduleRoom.innerHTML = '<option value="">Selecione um ambiente</option>';
        
        const rooms = window.dataManager.getRooms();
        rooms.forEach(room => {
            const unit = window.dataManager.units.find(u => u.id === room.unit);
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `${room.name} - ${unit.name}`;
            if (room.id === roomId) {
                option.selected = true;
            }
            scheduleRoom.appendChild(option);
        });

        // Definir data mínima como hoje
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('scheduleDate').min = today;
        document.getElementById('scheduleDate').value = today;

        this.showModal('schedule');
    }

    handleScheduleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            roomId: document.getElementById('scheduleRoom').value,
            date: document.getElementById('scheduleDate').value,
            startTime: document.getElementById('scheduleStartTime').value,
            endTime: document.getElementById('scheduleEndTime').value,
            purpose: document.getElementById('schedulePurpose').value
        };

        // Validações
        if (formData.startTime >= formData.endTime) {
            this.showToast('Hora de início deve ser anterior à hora de fim', 'error');
            return;
        }

        if (!window.dataManager.isRoomAvailable(
            formData.roomId, 
            formData.date, 
            formData.startTime, 
            formData.endTime
        )) {
            this.showToast('Ambiente não disponível neste horário', 'error');
            return;
        }

        // Criar agendamento
        window.dataManager.addSchedule(formData);
        this.hideModal('schedule');
        document.getElementById('scheduleForm').reset();
        this.showToast('Agendamento criado com sucesso!', 'success');
        
        if (this.currentPage === 'schedule') {
            this.loadSchedules();
        }
    }

    loadSchedules() {
        const scheduleList = document.getElementById('scheduleList');
        const schedules = window.dataManager.getSchedules();

        if (schedules.length === 0) {
            scheduleList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 64 64" fill="currentColor">
                        <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 4c11.1 0 20 8.9 20 20s-8.9 20-20 20-20-8.9-20-20 8.9-20 20-20zm-2 8v12l8 8 2.8-2.8L34 22.4V20h-4z"/>
                    </svg>
                    <h3>Nenhum agendamento encontrado</h3>
                    <p>Clique em "Novo Agendamento" para criar seu primeiro agendamento</p>
                </div>
            `;
            return;
        }

        scheduleList.innerHTML = schedules.map(schedule => `
            <div class="schedule-item">
                <div class="schedule-header">
                    <div>
                        <div class="schedule-title">${schedule.room.name}</div>
                        <div class="schedule-time">
                            ${this.formatDate(schedule.date)} • ${schedule.startTime} - ${schedule.endTime}
                        </div>
                    </div>
                    <span class="status-indicator ${schedule.status}">${this.getStatusText(schedule.status)}</span>
                </div>
                <div class="schedule-details">
                    <strong>Finalidade:</strong> ${schedule.purpose}
                </div>
                <div class="schedule-actions">
                    <button class="btn btn-secondary btn-sm" onclick="uiManager.editSchedule(${schedule.id})">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="uiManager.cancelSchedule(${schedule.id})">
                        Cancelar
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterSchedules() {
        const unitFilter = document.getElementById('unitFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        const filters = {};
        if (unitFilter) filters.unitId = unitFilter;
        if (typeFilter) filters.type = typeFilter;
        if (dateFilter) filters.date = dateFilter;

        const scheduleList = document.getElementById('scheduleList');
        const schedules = window.dataManager.getSchedules(filters);

        if (schedules.length === 0) {
            scheduleList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 64 64" fill="currentColor">
                        <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 4c11.1 0 20 8.9 20 20s-8.9 20-20 20-20-8.9-20-20 8.9-20 20-20zm-2 8v12l8 8 2.8-2.8L34 22.4V20h-4z"/>
                    </svg>
                    <h3>Nenhum agendamento encontrado</h3>
                    <p>Tente ajustar os filtros ou criar um novo agendamento</p>
                </div>
            `;
            return;
        }

        scheduleList.innerHTML = schedules.map(schedule => `
            <div class="schedule-item">
                <div class="schedule-header">
                    <div>
                        <div class="schedule-title">${schedule.room.name}</div>
                        <div class="schedule-time">
                            ${this.formatDate(schedule.date)} • ${schedule.startTime} - ${schedule.endTime}
                        </div>
                    </div>
                    <span class="status-indicator ${schedule.status}">${this.getStatusText(schedule.status)}</span>
                </div>
                <div class="schedule-details">
                    <strong>Finalidade:</strong> ${schedule.purpose}
                    ${window.dataManager.isAdmin() ? `<br><strong>Usuário:</strong> ${schedule.user.name}` : ''}
                </div>
                <div class="schedule-actions">
                    <button class="btn btn-secondary btn-sm" onclick="uiManager.editSchedule(${schedule.id})">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="uiManager.cancelSchedule(${schedule.id})">
                        Cancelar
                    </button>
                </div>
            </div>
        `).join('');
    }

    cancelSchedule(scheduleId) {
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            window.dataManager.deleteSchedule(scheduleId);
            this.loadSchedules();
            this.showToast('Agendamento cancelado com sucesso!', 'success');
        }
    }

    editSchedule(scheduleId) {
        // Por simplicidade, vamos apenas mostrar uma mensagem
        this.showToast('Funcionalidade de edição em desenvolvimento', 'warning');
    }

    loadReports() {
        const stats = window.dataManager.getUsageStats();
        const unitStats = window.dataManager.getUnitStats();

        // Simular gráficos com canvas
        this.drawUnitChart(unitStats);
        this.drawTimeChart();
    }

    drawUnitChart(unitStats) {
        const canvas = document.getElementById('unitChart');
        const ctx = canvas.getContext('2d');
        
        // Limpar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar gráfico simples
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#374151';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Gráfico de Ocupação por Unidade', canvas.width / 2, 30);
        
        // Desenhar barras
        const barWidth = 80;
        const barSpacing = 40;
        const startX = (canvas.width - (unitStats.length * barWidth + (unitStats.length - 1) * barSpacing)) / 2;
        
        unitStats.forEach((unit, index) => {
            const x = startX + index * (barWidth + barSpacing);
            const barHeight = (unit.occupationRate / 100) * 120;
            const y = 150 - barHeight;
            
            // Barra
            ctx.fillStyle = '#2dd4bf';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Label
            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(unit.name.split(' - ')[0], x + barWidth / 2, 170);
            ctx.fillText(`${unit.occupationRate}%`, x + barWidth / 2, y - 5);
        });
    }

    drawTimeChart() {
        const canvas = document.getElementById('timeChart');
        const ctx = canvas.getContext('2d');
        
        // Limpar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar gráfico simples
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#374151';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Horários de Maior Utilização', canvas.width / 2, 30);
        
        // Dados simulados de horários
        const timeData = [
            { hour: '08:00', usage: 45 },
            { hour: '10:00', usage: 80 },
            { hour: '14:00', usage: 95 },
            { hour: '16:00', usage: 70 },
            { hour: '18:00', usage: 30 }
        ];
        
        // Desenhar linha
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        timeData.forEach((point, index) => {
            const x = 50 + (index * 40);
            const y = 150 - (point.usage / 100) * 80;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Pontos
            ctx.fillStyle = '#0f766e';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Labels
            ctx.fillStyle = '#374151';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(point.hour, x, 170);
            ctx.fillText(`${point.usage}%`, x, y - 10);
        });
        
        ctx.stroke();
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${this.getToastTitle(type)}</span>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Mostrar toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remover toast automaticamente
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
        
        // Botão de fechar
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }

    getToastTitle(type) {
        const titles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Informação'
        };
        return titles[type] || 'Notificação';
    }

    getStatusText(status) {
        const statusTexts = {
            confirmed: 'Confirmado',
            pending: 'Pendente',
            cancelled: 'Cancelado'
        };
        return statusTexts[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    checkLogin() {
        const user = localStorage.getItem('loggedUser');
        if (!user) {
            this.showLoginScreen();
        } else {
            this.hideLoginScreen();
        }
    }

    showLoginScreen() {
        if (this.loginScreen) this.loginScreen.style.display = 'flex';
    }

    hideLoginScreen() {
        if (this.loginScreen) this.loginScreen.style.display = 'none';
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});