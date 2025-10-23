class LightingMonitor {
    constructor() {
        this.devices = [];
        this.chart = null;
        this.init();
    }

    async init() {
        await this.loadDevices();
        await this.loadNotifications();
        this.initChart();
        this.startRealTimeUpdates();
    }

    async loadDevices() {
        try {
            const response = await fetch('/api/devices');
            this.devices = await response.json();
            this.renderDevices();
            this.updateStats();
        } catch (error) {
            console.error('Error loading devices:', error);
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('/api/notifications');
            const notifications = await response.json();
            const unreadCount = notifications.filter(n => !n.read).length;
            
            const badge = document.getElementById('notificationBadge');
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    renderDevices() {
        const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6');
        container.innerHTML = '';

        this.devices.forEach(device => {
            const deviceCard = this.createDeviceCard(device);
            container.appendChild(deviceCard);
        });
    }

    createDeviceCard(device) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow p-6';
        
        const statusColor = device.status === 'on' ? 'text-green-600' : 
                           device.status === 'off' ? 'text-red-600' : 'text-yellow-600';
        
        const statusText = device.status.charAt(0).toUpperCase() + device.status.slice(1);

        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">${device.name}</h3>
                <span class="px-2 py-1 text-xs rounded-full ${statusColor} bg-${statusColor.replace('text-', 'bg-')} bg-opacity-20">
                    ${statusText}
                </span>
            </div>
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Location:</span>
                    <span>${device.location || 'Unknown'}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Brightness:</span>
                    <span>${device.brightness}%</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Power:</span>
                    <span>${device.powerConsumption}W</span>
                </div>
                <div class="flex space-x-2 mt-4">
                    <button onclick="monitor.toggleDevice('${device.id}')" 
                            class="flex-1 ${device.status === 'on' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white py-2 px-3 rounded text-sm">
                        ${device.status === 'on' ? 'Turn Off' : 'Turn On'}
                    </button>
                    <button onclick="monitor.showDeviceControls('${device.id}')" 
                            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm">
                        Controls
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    updateStats() {
        const onlineCount = this.devices.filter(d => d.lastSeen && new Date(d.lastSeen) > new Date(Date.now() - 5 * 60 * 1000)).length;
        const lightsOnCount = this.devices.filter(d => d.status === 'on').length;
        const totalPower = this.devices.reduce((sum, device) => sum + device.powerConsumption, 0);

        document.getElementById('onlineCount').textContent = onlineCount;
        document.getElementById('lightsOnCount').textContent = lightsOnCount;
        document.getElementById('powerUsage').textContent = `${totalPower}W`;
    }

    initChart() {
        const ctx = document.getElementById('powerChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Power Consumption (W)',
                    data: Array.from({length: 24}, () => Math.random() * 100),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async toggleDevice(deviceId) {
        try {
            const device = this.devices.find(d => d.id == deviceId);
            const newStatus = device.status === 'on' ? 'off' : 'on';
            
            const response = await fetch(`/api/devices/${deviceId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    brightness: newStatus === 'on' ? 100 : 0
                })
            });

            if (response.ok) {
                await this.loadDevices();
                this.showNotification('Device status updated', 'success');
            }
        } catch (error) {
            console.error('Error toggling device:', error);
            this.showNotification('Error updating device', 'error');
        }
    }

    showDeviceControls(deviceId) {
        // Implement device controls modal
        alert(`Show controls for device ${deviceId}`);
    }

    showNotification(message, type = 'info') {
        // Create and show notification toast
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

    startRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            this.simulateDeviceUpdates();
        }, 10000);
    }

    simulateDeviceUpdates() {
        // In a real app, this would come from WebSocket updates
        this.devices.forEach(device => {
            if (device.status === 'on') {
                device.powerConsumption = Math.random() * 50 + 10;
            }
        });
        this.updateStats();
    }
}

// Initialize the monitor when the page loads
const monitor = new LightingMonitor();