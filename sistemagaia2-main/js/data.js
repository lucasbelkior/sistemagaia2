// Dados simulados do sistema
class DataManager {
    constructor() {
        this.users = [
            {
                id: 1,
                name: 'João Silva',
                email: 'joao@sesi.org.br',
                type: 'professor',
                isAdmin: false
            },
            {
                id: 2,
                name: 'Maria Santos',
                email: 'maria@senai.org.br',
                type: 'coordenador',
                isAdmin: true
            },
            {
                id: 3,
                name: 'Pedro Costa',
                email: 'pedro@sesi.org.br',
                type: 'aluno',
                isAdmin: false
            }
        ];

        this.units = [
            {
                id: 'sesi',
                name: 'SESI - Unidade Central',
                address: 'Rua das Indústrias, 123',
                status: 'available'
            },
            {
                id: 'senai',
                name: 'SENAI - Unidade Tecnológica',
                address: 'Av. Tecnologia, 456',
                status: 'busy'
            }
        ];

        this.rooms = [
            {
                id: 'aud-001',
                name: 'Auditório Principal',
                unit: 'sesi',
                type: 'auditorium',
                capacity: 200,
                resources: ['Projetor', 'Sistema de Som', 'Ar-condicionado', 'Microfones'],
                status: 'available'
            },
            {
                id: 'sala-101',
                name: 'Sala 101',
                unit: 'sesi',
                type: 'classroom',
                capacity: 30,
                resources: ['Projetor', 'Ar-condicionado', 'Quadro Branco'],
                status: 'available'
            },
            {
                id: 'sala-102',
                name: 'Sala 102',
                unit: 'sesi',
                type: 'classroom',
                capacity: 25,
                resources: ['TV', 'Ar-condicionado'],
                status: 'available'
            },
            {
                id: 'sala-103',
                name: 'Sala 103',
                unit: 'sesi',
                type: 'classroom',
                capacity: 35,
                resources: ['Projetor', 'Computadores', 'Ar-condicionado'],
                status: 'available'
            },
            {
                id: 'aud-002',
                name: 'Auditório Tech',
                unit: 'senai',
                type: 'auditorium',
                capacity: 150,
                resources: ['Projetor 4K', 'Sistema de Som', 'Ar-condicionado', 'Transmissão Online'],
                status: 'available'
            },
            {
                id: 'lab-201',
                name: 'Lab 201',
                unit: 'senai',
                type: 'classroom',
                capacity: 20,
                resources: ['Computadores', 'Projetor', 'Bancadas'],
                status: 'available'
            },
            {
                id: 'lab-202',
                name: 'Lab 202',
                unit: 'senai',
                type: 'classroom',
                capacity: 18,
                resources: ['Computadores', 'Impressora 3D', 'Ferramentas'],
                status: 'available'
            },
            {
                id: 'lab-203',
                name: 'Lab 203',
                unit: 'senai',
                type: 'classroom',
                capacity: 22,
                resources: ['Computadores', 'Simuladores', 'Ar-condicionado'],
                status: 'occupied'
            }
        ];

        this.schedules = [
            {
                id: 1,
                roomId: 'aud-001',
                userId: 1,
                date: '2025-01-15',
                startTime: '09:00',
                endTime: '11:00',
                purpose: 'Palestra sobre Segurança no Trabalho',
                status: 'confirmed',
                createdAt: new Date('2025-01-10')
            },
            {
                id: 2,
                roomId: 'sala-101',
                userId: 2,
                date: '2025-01-15',
                startTime: '14:00',
                endTime: '16:00',
                purpose: 'Aula de Matemática Aplicada',
                status: 'confirmed',
                createdAt: new Date('2025-01-12')
            },
            {
                id: 3,
                roomId: 'lab-203',
                userId: 3,
                date: '2025-01-15',
                startTime: '08:00',
                endTime: '12:00',
                purpose: 'Prática de Programação',
                status: 'confirmed',
                createdAt: new Date('2025-01-13')
            }
        ];

        this.currentUser = null;
        this.loadFromStorage();
    }

    // Métodos de autenticação
    login(email, password) {
        const user = this.users.find(u => u.email === email);
        if (user && password === '123456') { // Senha simples para demo
            this.currentUser = user;
            this.saveToStorage();
            return { success: true, user };
        }
        return { success: false, message: 'Email ou senha incorretos' };
    }

    logout() {
        this.currentUser = null;
        this.saveToStorage();
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }

    // Métodos de dados
    getUnits() {
        return this.units;
    }

    getRooms(unitId = null, type = null) {
        let rooms = this.rooms;
        if (unitId) {
            rooms = rooms.filter(r => r.unit === unitId);
        }
        if (type) {
            rooms = rooms.filter(r => r.type === type);
        }
        return rooms;
    }

    getRoom(roomId) {
        return this.rooms.find(r => r.id === roomId);
    }

    getSchedules(filters = {}) {
        let schedules = this.schedules;
        
        if (filters.unitId) {
            const unitRooms = this.getRooms(filters.unitId).map(r => r.id);
            schedules = schedules.filter(s => unitRooms.includes(s.roomId));
        }
        
        if (filters.type) {
            const typeRooms = this.getRooms(null, filters.type).map(r => r.id);
            schedules = schedules.filter(s => typeRooms.includes(s.roomId));
        }
        
        if (filters.date) {
            schedules = schedules.filter(s => s.date === filters.date);
        }
        
        if (!this.isAdmin()) {
            schedules = schedules.filter(s => s.userId === this.currentUser.id);
        }
        
        return schedules.map(schedule => ({
            ...schedule,
            room: this.getRoom(schedule.roomId),
            user: this.users.find(u => u.id === schedule.userId)
        }));
    }

    addSchedule(scheduleData) {
        const newSchedule = {
            id: Date.now(),
            ...scheduleData,
            userId: this.currentUser.id,
            status: 'confirmed',
            createdAt: new Date()
        };
        
        this.schedules.push(newSchedule);
        this.saveToStorage();
        return newSchedule;
    }

    deleteSchedule(scheduleId) {
        this.schedules = this.schedules.filter(s => s.id !== scheduleId);
        this.saveToStorage();
    }

    addRoom(roomData) {
        const newRoom = {
            id: `room-${Date.now()}`,
            ...roomData,
            status: 'available'
        };
        
        this.rooms.push(newRoom);
        this.saveToStorage();
        return newRoom;
    }

    updateRoom(roomId, roomData) {
        const roomIndex = this.rooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1) {
            this.rooms[roomIndex] = { ...this.rooms[roomIndex], ...roomData };
            this.saveToStorage();
            return this.rooms[roomIndex];
        }
        return null;
    }

    deleteRoom(roomId) {
        this.rooms = this.rooms.filter(r => r.id !== roomId);
        this.schedules = this.schedules.filter(s => s.roomId !== roomId);
        this.saveToStorage();
    }

    // Métodos de relatórios
    getUsageStats() {
        const totalRooms = this.rooms.length;
        const occupiedRooms = this.rooms.filter(r => r.status === 'occupied').length;
        const totalSchedules = this.schedules.length;
        const todaySchedules = this.schedules.filter(s => s.date === new Date().toISOString().split('T')[0]).length;
        
        return {
            totalRooms,
            occupiedRooms,
            occupationRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
            totalSchedules,
            todaySchedules
        };
    }

    getUnitStats() {
        return this.units.map(unit => {
            const unitRooms = this.getRooms(unit.id);
            const unitSchedules = this.schedules.filter(s => 
                unitRooms.some(r => r.id === s.roomId)
            );
            
            return {
                ...unit,
                roomCount: unitRooms.length,
                scheduleCount: unitSchedules.length,
                occupationRate: unitRooms.length > 0 ? 
                    Math.round((unitRooms.filter(r => r.status === 'occupied').length / unitRooms.length) * 100) : 0
            };
        });
    }

    // Persistência local
    saveToStorage() {
        localStorage.setItem('gaia_data', JSON.stringify({
            users: this.users,
            units: this.units,
            rooms: this.rooms,
            schedules: this.schedules,
            currentUser: this.currentUser
        }));
    }

    loadFromStorage() {
        const data = localStorage.getItem('gaia_data');
        if (data) {
            const parsed = JSON.parse(data);
            this.users = parsed.users || this.users;
            this.units = parsed.units || this.units;
            this.rooms = parsed.rooms || this.rooms;
            this.schedules = parsed.schedules || this.schedules;
            this.currentUser = parsed.currentUser || null;
        }
    }

    // Validações
    isRoomAvailable(roomId, date, startTime, endTime, excludeScheduleId = null) {
        const conflicts = this.schedules.filter(s => 
            s.roomId === roomId && 
            s.date === date && 
            s.status === 'confirmed' &&
            s.id !== excludeScheduleId &&
            ((startTime >= s.startTime && startTime < s.endTime) ||
             (endTime > s.startTime && endTime <= s.endTime) ||
             (startTime <= s.startTime && endTime >= s.endTime))
        );
        
        return conflicts.length === 0;
    }
}

// Instância global do gerenciador de dados
window.dataManager = new DataManager();