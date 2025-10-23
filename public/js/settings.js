class SettingsManager {
    constructor() {
        this.schedules = [];
        this.devices = [];
        this.init();
    }

    async init() {
        await this.loadSchedules();
        await this.loadDevices();
        this.setupEventListeners();
    }

    async loadSchedules() {
        try {
            const response = await fetch('/api/schedules');
            this.schedules = await response.json();
            this.renderSchedules();
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    }

    async loadDevices() {
        try {
            const response = await fetch('/api/devices');
            this.devices = await response.json();
            this.populateDeviceSelect();
        } catch (error) {
            console.error('Error loading devices:', error);
        }
    }

    renderSchedules() {
        const container = document.getElementById('schedulesList');
        container.innerHTML = '';

        this.schedules.forEach(schedule => {
            const scheduleElement = this.createScheduleElement(schedule);
            container.appendChild(scheduleElement);
        });
    }

    createScheduleElement(schedule) {
        const element = document.createElement('div');
        element.className = 'flex items-center justify-between p-4 border rounded-lg';
        
        element.innerHTML = `
            <div class="flex-1">
                <h4 class="font-medium">${schedule.name}</h4>
                <p class="text-sm text-gray-600">
                    ${this.getDeviceName(schedule.deviceId)} • 
                    ${schedule.action.toUpperCase()} at ${schedule.scheduledTime} • 
                    ${schedule.days.split(',').map(d => d.substring(0, 3)).join(', ')}
                </p>
            </div>
            <div class="flex items-center space-x-3">
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" ${schedule.enabled ? 'checked' : ''} 
                           onchange="settings.toggleSchedule(${schedule.id}, this.checked)"
                           class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <button onclick="settings.deleteSchedule(${schedule.id})" class="text-red-600 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        `;

        return element;
    }

    getDeviceName(deviceId) {
        const device = this.devices.find(d => d.deviceId === deviceId);
        return device ? device.name : 'Unknown Device';
    }

    populateDeviceSelect() {
        const select = document.querySelector('select[name="deviceId"]');
        select.innerHTML = '';
        
        this.devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.name;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        document.getElementById('scheduleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleScheduleSubmit(e);
        });
    }

    async handleScheduleSubmit(e) {
        const formData = new FormData(e.target);
        const days = Array.from(formData.getAll('days')).join(',');
        
        const scheduleData = {
            name: formData.get('name'),
            deviceId: formData.get('deviceId'),
            action: formData.get('action'),
            scheduledTime: formData.get('scheduledTime'),
            days: days
        };

        try {
            const response = await fetch('/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scheduleData)
            });

            if (response.ok) {
                this.hideAddScheduleModal();
                await this.loadSchedules();
                this.showNotification('Schedule created successfully', 'success');
            }
        } catch (error) {
            console.error('Error creating schedule:', error);
            this.showNotification('Error creating schedule', 'error');
        }
    }

    async toggleSchedule(scheduleId, enabled) {
        try {
            await fetch(`/api/schedules/${scheduleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled })
            });
        } catch (error) {
            console.error('Error updating schedule:', error);
        }
    }

    async deleteSchedule(scheduleId) {
        if (confirm('Are you sure you want to delete this schedule?')) {
            try {
                await fetch(`/api/schedules/${scheduleId}`, {
                    method: 'DELETE'
                });
                await this.loadSchedules();
                this.showNotification('Schedule deleted', 'success');
            } catch (error) {
                console.error('Error deleting schedule:', error);
                this.showNotification('Error deleting schedule', 'error');
            }
        }
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global functions for modal control
function showAddScheduleModal() {
    document.getElementById('addScheduleModal').classList.remove('hidden');
    document.getElementById('addScheduleModal').classList.add('flex');
}

function hideAddScheduleModal() {
    document.getElementById('addScheduleModal').classList.add('hidden');
    document.getElementById('addScheduleModal').classList.remove('flex');
    document.getElementById('scheduleForm').reset();
}

// Quick action functions
async function turnAllLightsOn() {
    try {
        const response = await fetch('/api/devices');
        const devices = await response.json();
        
        const promises = devices.map(device => 
            fetch(`/api/devices/${device.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'on', brightness: 100 })
            })
        );
        
        await Promise.all(promises);
        settings.showNotification('All lights turned on', 'success');
    } catch (error) {
        console.error('Error turning on lights:', error);
        settings.showNotification('Error turning on lights', 'error');
    }
}

async function turnAllLightsOff() {
    try {
        const response = await fetch('/api/devices');
        const devices = await response.json();
        
        const promises = devices.map(device => 
            fetch(`/api/devices/${device.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'off', brightness: 0 })
            })
        );
        
        await Promise.all(promises);
        settings.showNotification('All lights turned off', 'success');
    } catch (error) {
        console.error('Error turning off lights:', error);
        settings.showNotification('Error turning off lights', 'error');
    }
}

async function setEveningMode() {
    try {
        const response = await fetch('/api/devices');
        const devices = await response.json();
        
        const promises = devices.map(device => 
            fetch(`/api/devices/${device.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'on', brightness: 30, color: '#ffd700' })
            })
        );
        
        await Promise.all(promises);
        settings.showNotification('Evening mode activated', 'success');
    } catch (error) {
        console.error('Error setting evening mode:', error);
        settings.showNotification('Error setting evening mode', 'error');
    }
}

// Initialize settings manager
const settings = new SettingsManager();