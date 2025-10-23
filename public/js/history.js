class HistoryManager {
    constructor() {
        this.historyData = [];
        this.devices = [];
        this.filters = {
            timeRange: '7d',
            device: 'all',
            action: 'all'
        };
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.energyChart = null;
        this.usageChart = null;
        this.init();
    }

    async init() {
        await this.loadDevices();
        await this.loadNotifications();
        await this.loadHistory();
        this.setupEventListeners();
    }

    async loadDevices() {
        try {
            const response = await fetch('/api/devices');
            this.devices = await response.json();
            this.populateDeviceFilter();
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

    async loadHistory() {
        try {
            // In a real app, this would fetch from your API with filters
            // For now, we'll generate sample data
            this.generateSampleData();
            this.renderActivityTable();
            this.updateStatistics();
            this.initCharts();
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    generateSampleData() {
        const actions = ['on', 'off', 'dim', 'color_changed'];
        const devices = this.devices.length > 0 ? this.devices : [
            { id: 1, name: 'Living Room Light', deviceId: 'lr1' },
            { id: 2, name: 'Bedroom Light', deviceId: 'br1' },
            { id: 3, name: 'Kitchen Light', deviceId: 'kt1' }
        ];

        this.historyData = [];
        
        for (let i = 0; i < 50; i++) {
            const device = devices[Math.floor(Math.random() * devices.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const hoursAgo = Math.floor(Math.random() * 24 * 7); // Within last 7 days
            
            this.historyData.push({
                id: i + 1,
                deviceId: device.deviceId,
                deviceName: device.name,
                action: action,
                brightness: action === 'dim' ? Math.floor(Math.random() * 100) + 1 : null,
                color: action === 'color_changed' ? this.getRandomColor() : null,
                powerConsumed: action === 'on' ? (Math.random() * 50 + 10) : 0,
                duration: action === 'on' ? Math.floor(Math.random() * 240) + 1 : null,
                timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
            });
        }

        // Sort by timestamp descending
        this.historyData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getRandomColor() {
        const colors = ['#ffffff', '#ffd700', '#ff7f50', '#87ceeb', '#98fb98', '#dda0dd'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    populateDeviceFilter() {
        const select = document.getElementById('deviceFilter');
        select.innerHTML = '<option value="all">All Devices</option>';
        
        this.devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.name;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderActivityTable();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = Math.ceil(this.historyData.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderActivityTable();
            }
        });

        // Add filter change listeners
        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.filters.timeRange = e.target.value;
        });

        document.getElementById('deviceFilter').addEventListener('change', (e) => {
            this.filters.device = e.target.value;
        });

        document.getElementById('actionFilter').addEventListener('change', (e) => {
            this.filters.action = e.target.value;
        });
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadHistory();
    }

    getFilteredData() {
        let filtered = this.historyData;

        if (this.filters.device !== 'all') {
            filtered = filtered.filter(item => item.deviceId === this.filters.device);
        }

        if (this.filters.action !== 'all') {
            filtered = filtered.filter(item => item.action === this.filters.action);
        }

        // Apply time range filter
        const now = new Date();
        let startTime;
        switch (this.filters.timeRange) {
            case '24h':
                startTime = new Date(now - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startTime = new Date(now - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startTime = new Date(0);
        }

        filtered = filtered.filter(item => new Date(item.timestamp) >= startTime);

        return filtered;
    }

    renderActivityTable() {
        const filteredData = this.getFilteredData();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);

        const tbody = document.getElementById('activityTable');
        tbody.innerHTML = '';

        pageData.forEach(item => {
            const row = this.createActivityRow(item);
            tbody.appendChild(row);
        });

        this.updatePaginationInfo(filteredData.length);
    }

    createActivityRow(item) {
        const row = document.createElement('tr');
        
        const actionText = this.getActionText(item.action);
        const details = this.getActionDetails(item);
        const timeAgo = this.getTimeAgo(item.timestamp);
        const duration = item.duration ? `${item.duration} min` : '-';

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${item.deviceName}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getActionColor(item.action)}">
                    ${actionText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${details}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${timeAgo}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${duration}
            </td>
        `;

        return row;
    }

    getActionText(action) {
        const actions = {
            'on': 'Turned On',
            'off': 'Turned Off',
            'dim': 'Dimmed',
            'color_changed': 'Color Changed'
        };
        return actions[action] || action;
    }

    getActionColor(action) {
        const colors = {
            'on': 'bg-green-100 text-green-800',
            'off': 'bg-red-100 text-red-800',
            'dim': 'bg-yellow-100 text-yellow-800',
            'color_changed': 'bg-purple-100 text-purple-800'
        };
        return colors[action] || 'bg-gray-100 text-gray-800';
    }

    getActionDetails(item) {
        switch (item.action) {
            case 'dim':
                return `Brightness: ${item.brightness}%`;
            case 'color_changed':
                return `<div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${item.color}"></div>
                    Color changed
                </div>`;
            case 'on':
                return `Power: ${item.powerConsumed.toFixed(1)}W`;
            default:
                return '-';
        }
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return time.toLocaleDateString();
    }

    updatePaginationInfo(totalItems) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(startIndex + this.itemsPerPage - 1, totalItems);
        
        document.getElementById('paginationInfo').textContent = 
            `Showing ${startIndex} to ${endIndex} of ${totalItems} entries`;

        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        
        prevButton.disabled = this.currentPage === 1;
        nextButton.disabled = endIndex >= totalItems;
    }

    updateStatistics() {
        const filteredData = this.getFilteredData();
        
        // Calculate statistics
        const totalEnergy = filteredData.reduce((sum, item) => sum + (item.powerConsumed || 0), 0) / 1000; // Convert to kWh
        const totalDuration = filteredData.reduce((sum, item) => sum + (item.duration || 0), 0) / 60; // Convert to hours
        const avgUsage = totalDuration / Math.max(1, filteredData.length);
        const costEstimate = totalEnergy * 0.12; // Assuming $0.12 per kWh

        document.getElementById('totalEnergy').textContent = `${totalEnergy.toFixed(2)} kWh`;
        document.getElementById('activeHours').textContent = `${totalDuration.toFixed(1)}h`;
        document.getElementById('avgUsage').textContent = `${avgUsage.toFixed(1)}h`;
        document.getElementById('costEstimate').textContent = `$${costEstimate.toFixed(2)}`;
    }

    initCharts() {
        this.initEnergyChart();
        this.initUsageChart();
    }

    initEnergyChart() {
        const ctx = document.getElementById('energyChart').getContext('2d');
        
        if (this.energyChart) {
            this.energyChart.destroy();
        }

        // Sample data for energy consumption
        const labels = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const data = labels.map(() => Math.random() * 10 + 2);

        this.energyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Energy (kWh)',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
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
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'kWh'
                        }
                    }
                }
            }
        });
    }

    initUsageChart() {
        const ctx = document.getElementById('usageChart').getContext('2d');
        
        if (this.usageChart) {
            this.usageChart.destroy();
        }

        // Sample data for usage patterns by hour
        const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        const usageData = labels.map((_, i) => {
            // Simulate higher usage during evening hours
            const baseUsage = i >= 6 && i <= 22 ? Math.random() * 40 + 10 : Math.random() * 10;
            return Math.round(baseUsage);
        });

        this.usageChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Usage (%)',
                    data: usageData,
                    borderColor: 'rgb(139, 69, 19)',
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    tension: 0.4,
                    fill: true
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
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Usage %'
                        }
                    }
                }
            }
        });
    }
}

// Initialize history manager
const historyManager = new HistoryManager();