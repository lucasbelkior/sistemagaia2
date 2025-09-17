// Gerenciamento do painel administrativo
class AdminManager {
    constructor() {
        this.currentTab = 'environments';
        this.init();
    }

    init() {
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.showTab(tab);
            });
        });

        // Botões de ação
        document.getElementById('addUnitBtn').addEventListener('click', () => {
            window.uiManager.showToast('Funcionalidade em desenvolvimento', 'info');
        });

        document.getElementById('addRoomBtn').addEventListener('click', () => {
            this.showRoomForm();
        });

        // Form de ambiente
        document.getElementById('roomForm').addEventListener('submit', (e) => {
            this.handleRoomSubmit(e);
        });

        document.getElementById('cancelRoomForm').addEventListener('click', () => {
            window.uiManager.hideModal('roomForm');
        });

        document.getElementById('closeRoomForm').addEventListener('click', () => {
            window.uiManager.hideModal('roomForm');
        });
    }

    showTab(tabName) {
        // Atualizar botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Mostrar conteúdo
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.currentTab = tabName;
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'environments':
                this.loadEnvironments();
                break;
            case 'schedules':
                this.loadAdminSchedules();
                break;
            case 'users':
                this.loadUsers();
                break;
        }
    }

    loadAdminData() {
        this.loadTabData(this.currentTab);
    }

    loadEnvironments() {
        const tbody = document.getElementById('environmentsTableBody');
        const rooms = window.dataManager.getRooms();
        
        tbody.innerHTML = rooms.map(room => {
            const unit = window.dataManager.units.find(u => u.id === room.unit);
            return `
                <tr>
                    <td>
                        <strong>${room.name}</strong><br>
                        <small>${room.id}</small>
                    </td>
                    <td>${unit.name}</td>
                    <td>
                        <span class="resource-tag">
                            ${room.type === 'auditorium' ? 'Auditório' : 'Sala de Aula'}
                        </span>
                    </td>
                    <td>${room.capacity} pessoas</td>
                    <td>
                        <span class="status-indicator ${room.status}">
                            ${room.status === 'available' ? 'Disponível' : 'Ocupado'}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn view" onclick="adminManager.viewRoom('${room.id}')">
                                Ver
                            </button>
                            <button class="action-btn edit" onclick="adminManager.editRoom('${room.id}')">
                                Editar
                            </button>
                            <button class="action-btn delete" onclick="adminManager.deleteRoom('${room.id}')">
                                Excluir
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadAdminSchedules() {
        const tbody = document.getElementById('schedulesTableBody');
        const schedules = window.dataManager.getSchedules();
        
        tbody.innerHTML = schedules.map(schedule => `
            <tr>
                <td>
                    <strong>${window.uiManager.formatDate(schedule.date)}</strong><br>
                    <small>${schedule.startTime} - ${schedule.endTime}</small>
                </td>
                <td>
                    <strong>${schedule.room.name}</strong><br>
                    <small>${window.dataManager.units.find(u => u.id === schedule.room.unit).name}</small>
                </td>
                <td>
                    <strong>${schedule.user.name}</strong><br>
                    <small>${schedule.user.email}</small>
                </td>
                <td>${schedule.purpose}</td>
                <td>
                    <span class="status-indicator ${schedule.status}">
                        ${window.uiManager.getStatusText(schedule.status)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn view" onclick="adminManager.viewSchedule(${schedule.id})">
                            Ver
                        </button>
                        <button class="action-btn delete" onclick="adminManager.deleteSchedule(${schedule.id})">
                            Cancelar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadUsers() {
        const tbody = document.getElementById('usersTableBody');
        const users = window.dataManager.users;
        
        tbody.innerHTML = users.map(user => {
            const userSchedules = window.dataManager.schedules.filter(s => s.userId === user.id);
            return `
                <tr>
                    <td>
                        <strong>${user.name}</strong><br>
                        <small>ID: ${user.id}</small>
                    </td>
                    <td>${user.email}</td>
                    <td>
                        <span class="resource-tag">
                            ${this.getUserTypeText(user.type)}
                            ${user.isAdmin ? ' (Admin)' : ''}
                        </span>
                    </td>
                    <td>${userSchedules.length} agendamentos</td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn view" onclick="adminManager.viewUser(${user.id})">
                                Ver
                            </button>
                            <button class="action-btn edit" onclick="adminManager.editUser(${user.id})">
                                Editar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    showRoomForm(roomId = null) {
        const form = document.getElementById('roomForm');
        const title = document.getElementById('roomFormTitle');
        
        if (roomId) {
            const room = window.dataManager.getRoom(roomId);
            title.textContent = 'Editar Ambiente';
            
            document.getElementById('roomName').value = room.name;
            document.getElementById('roomUnit').value = room.unit;
            document.getElementById('roomType').value = room.type;
            document.getElementById('roomCapacity').value = room.capacity;
            document.getElementById('roomResources').value = room.resources.join(', ');
            
            form.dataset.editingId = roomId;
        } else {
            title.textContent = 'Novo Ambiente';
            form.reset();
            delete form.dataset.editingId;
        }
        
        window.uiManager.showModal('roomForm');
    }

    handleRoomSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('roomName').value,
            unit: document.getElementById('roomUnit').value,
            type: document.getElementById('roomType').value,
            capacity: parseInt(document.getElementById('roomCapacity').value),
            resources: document.getElementById('roomResources').value
                .split(',')
                .map(r => r.trim())
                .filter(r => r.length > 0)
        };

        const form = document.getElementById('roomForm');
        const editingId = form.dataset.editingId;

        if (editingId) {
            window.dataManager.updateRoom(editingId, formData);
            window.uiManager.showToast('Ambiente atualizado com sucesso!', 'success');
        } else {
            window.dataManager.addRoom(formData);
            window.uiManager.showToast('Ambiente criado com sucesso!', 'success');
        }

        window.uiManager.hideModal('roomForm');
        form.reset();
        delete form.dataset.editingId;
        
        if (this.currentTab === 'environments') {
            this.loadEnvironments();
        }
    }

    viewRoom(roomId) {
        window.uiManager.showRoomDetails(roomId);
    }

    editRoom(roomId) {
        this.showRoomForm(roomId);
    }

    deleteRoom(roomId) {
        const room = window.dataManager.getRoom(roomId);
        if (confirm(`Tem certeza que deseja excluir o ambiente "${room.name}"?`)) {
            window.dataManager.deleteRoom(roomId);
            this.loadEnvironments();
            window.uiManager.showToast('Ambiente excluído com sucesso!', 'success');
        }
    }

    viewSchedule(scheduleId) {
        const schedule = window.dataManager.schedules.find(s => s.id === scheduleId);
        if (schedule) {
            const room = window.dataManager.getRoom(schedule.roomId);
            const user = window.dataManager.users.find(u => u.id === schedule.userId);
            
            const details = `
                Ambiente: ${room.name}
                Usuário: ${user.name}
                Data: ${window.uiManager.formatDate(schedule.date)}
                Horário: ${schedule.startTime} - ${schedule.endTime}
                Finalidade: ${schedule.purpose}
            `;
            
            alert(details);
        }
    }

    deleteSchedule(scheduleId) {
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            window.dataManager.deleteSchedule(scheduleId);
            this.loadAdminSchedules();
            window.uiManager.showToast('Agendamento cancelado com sucesso!', 'success');
        }
    }

    viewUser(userId) {
        const user = window.dataManager.users.find(u => u.id === userId);
        const userSchedules = window.dataManager.schedules.filter(s => s.userId === userId);
        
        const details = `
            Nome: ${user.name}
            Email: ${user.email}
            Tipo: ${this.getUserTypeText(user.type)}
            Admin: ${user.isAdmin ? 'Sim' : 'Não'}
            Agendamentos: ${userSchedules.length}
        `;
        
        alert(details);
    }

    editUser(userId) {
        window.uiManager.showToast('Funcionalidade de edição de usuário em desenvolvimento', 'info');
    }

    getUserTypeText(type) {
        const types = {
            professor: 'Professor',
            coordenador: 'Coordenador',
            aluno: 'Aluno',
            funcionario: 'Funcionário'
        };
        return types[type] || type;
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});