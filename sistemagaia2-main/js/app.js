// Aplicação principal
class GaiaApp {
    constructor() {
        this.init();
    }

    init() {
        // Aguardar todos os managers serem carregados
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.updateRoomStatus();
            this.startPeriodicUpdates();
        });
    }

    setupEventListeners() {
        // Atualizar status dos ambientes em tempo real
        setInterval(() => {
            this.updateRoomStatus();
        }, 30000); // Atualizar a cada 30 segundos

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        if (window.dataManager.isLoggedIn()) {
                            window.uiManager.showScheduleModal();
                        }
                        break;
                    case 'h':
                        e.preventDefault();
                        window.uiManager.showPage('home');
                        break;
                    case 's':
                        e.preventDefault();
                        window.uiManager.showPage('schedule');
                        break;
                    case 'r':
                        e.preventDefault();
                        window.uiManager.showPage('reports');
                        break;
                }
            }
        });

        // Responsive menu toggle
        this.setupResponsiveMenu();
    }

    updateRoomStatus() {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5);

        // Atualizar status das salas baseado nos agendamentos
        window.dataManager.rooms.forEach(room => {
            const currentSchedule = window.dataManager.schedules.find(schedule => 
                schedule.roomId === room.id &&
                schedule.date === currentDate &&
                schedule.startTime <= currentTime &&
                schedule.endTime > currentTime &&
                schedule.status === 'confirmed'
            );

            room.status = currentSchedule ? 'occupied' : 'available';
        });

        // Atualizar UI
        this.updateRoomElements();
        this.updateUnitStatus();
    }

    updateRoomElements() {
        document.querySelectorAll('.room').forEach(roomElement => {
            const roomId = roomElement.dataset.room;
            const room = window.dataManager.getRoom(roomId);
            
            if (room) {
                roomElement.classList.toggle('occupied', room.status === 'occupied');
            }
        });
    }

    updateUnitStatus() {
        document.querySelectorAll('.unit-card').forEach(unitCard => {
            const unitId = unitCard.dataset.unit;
            const unitRooms = window.dataManager.getRooms(unitId);
            const occupiedRooms = unitRooms.filter(r => r.status === 'occupied').length;
            const occupationRate = unitRooms.length > 0 ? Math.round((occupiedRooms / unitRooms.length) * 100) : 0;
            
            const statusElement = unitCard.querySelector('.unit-status');
            const statsElement = unitCard.querySelector('.stat-number:last-child');
            
            if (occupationRate >= 80) {
                statusElement.className = 'unit-status busy';
                statusElement.textContent = 'Ocupado';
            } else if (occupationRate >= 50) {
                statusElement.className = 'unit-status partial';
                statusElement.textContent = 'Parcial';
            } else {
                statusElement.className = 'unit-status available';
                statusElement.textContent = 'Disponível';
            }
            
            if (statsElement) {
                statsElement.textContent = `${occupationRate}%`;
            }
        });
    }

    setupResponsiveMenu() {
        // Adicionar funcionalidade de menu mobile se necessário
        const header = document.querySelector('.header');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }

    startPeriodicUpdates() {
        // Atualizar dados periodicamente
        setInterval(() => {
            if (window.dataManager.isLoggedIn()) {
                this.refreshCurrentPageData();
            }
        }, 60000); // Atualizar a cada minuto
    }

    refreshCurrentPageData() {
        const currentPage = window.uiManager.currentPage;
        
        switch (currentPage) {
            case 'schedule':
                window.uiManager.loadSchedules();
                break;
            case 'reports':
                window.uiManager.loadReports();
                break;
            case 'admin':
                window.adminManager.loadAdminData();
                break;
        }
    }

    // Métodos utilitários
    formatDateTime(date, time) {
        const dateObj = new Date(`${date}T${time}`);
        return dateObj.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    calculateDuration(startTime, endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const diff = end - start;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
        }
        return `${minutes}min`;
    }

    // Exportar dados para relatórios
    exportScheduleData() {
        const schedules = window.dataManager.getSchedules();
        const csvContent = this.convertToCSV(schedules);
        this.downloadCSV(csvContent, 'agendamentos_gaia.csv');
    }

    convertToCSV(data) {
        const headers = ['Data', 'Horário', 'Ambiente', 'Usuário', 'Finalidade', 'Status'];
        const rows = data.map(schedule => [
            window.uiManager.formatDate(schedule.date),
            `${schedule.startTime} - ${schedule.endTime}`,
            schedule.room.name,
            schedule.user.name,
            schedule.purpose,
            window.uiManager.getStatusText(schedule.status)
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Notificações push (simulado)
    checkUpcomingSchedules() {
        if (!window.dataManager.isLoggedIn()) return;

        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5);
        
        const userSchedules = window.dataManager.getSchedules().filter(s => 
            s.userId === window.dataManager.currentUser.id &&
            s.date === currentDate &&
            s.status === 'confirmed'
        );

        userSchedules.forEach(schedule => {
            const scheduleTime = new Date(`${schedule.date}T${schedule.startTime}`);
            const timeDiff = scheduleTime - now;
            
            // Notificar 15 minutos antes
            if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000) {
                window.uiManager.showToast(
                    `Lembrete: Você tem um agendamento em ${schedule.room.name} às ${schedule.startTime}`,
                    'warning'
                );
            }
        });
    }
}

// Inicializar aplicação
window.gaiaApp = new GaiaApp();

// Verificar agendamentos próximos a cada 5 minutos
setInterval(() => {
    window.gaiaApp.checkUpcomingSchedules();
}, 5 * 60 * 1000);