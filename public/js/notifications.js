class NotificationManager {
    constructor() {
        this.notifications = [];
        this.filteredNotifications = [];
        this.filters = {
            type: 'all',
            status: 'all'
        };
        this.currentPage = 1;
        this.notificationsPerPage = 10;
        this.init();
    }

    async init() {
        await this.loadNotifications();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    async loadNotifications() {
        try {
            const response = await fetch('/api/notifications');
            this.notifications = await response.json();
            this.applyFilters();
            this.renderNotifications();
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Error loading notifications:', error);
            // Generate sample data if API fails
            this.generateSampleData();
            this.applyFilters();
            this.renderNotifications();
            this.updateNotificationBadge();
        }
    }

    generateSampleData() {
        const types = ['info', 'warning', 'error', 'success'];
        const messages = [
            'Living Room Light was turned on',
            'Bedroom Light is offline',
            'High power consumption detected in Kitchen',
            'Evening lighting schedule executed',
            'Front Door Light bulb needs replacement',
            'All lights turned off by automation',
            'New device connected: Porch Light',
            'Energy saving mode activated',
            'Color changed in Living Room',
            'Schedule "Morning Wake-up" completed'
        ];

        this.notifications = [];

        for (let i = 0; i < 25; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const message = messages[Math.floor(Math.random() * messages.length)];
            const hoursAgo = Math.floor(Math.random() * 24 * 3); // Within last 3 days
            
            this.notifications.push({
                id: i + 1,
                title: this.getNotificationTitle(type),
                message: message,
                type: type,
                read: Math.random() > 0.7, // 30% are unread
                createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
            });
        }

        // Sort by creation date descending
        this.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getNotificationTitle(type) {
        const titles = {
            'info': 'Information',
            'warning': 'Warning',
            'error': 'Alert',
            'success': 'Success'
        };
        return titles[type] || 'Notification';
    }

    setupEventListeners() {
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.applyFilters();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });
    }

    applyFilters() {
        let filtered = this.notifications;

        if (this.filters.type !== 'all') {
            filtered = filtered.filter(notification => notification.type === this.filters.type);
        }

        if (this.filters.status !== 'all') {
            const readStatus = this.filters.status === 'read';
            filtered = filtered.filter(notification => notification.read === readStatus);
        }

        this.filteredNotifications = filtered;
        this.currentPage = 1;
        this.renderNotifications();
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');
        const emptyState = document.getElementById('emptyState');
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        if (this.filteredNotifications.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            loadMoreBtn.classList.add('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        const startIndex = (this.currentPage - 1) * this.notificationsPerPage;
        const endIndex = startIndex + this.notificationsPerPage;
        const pageNotifications = this.filteredNotifications.slice(startIndex, endIndex);

        if (this.currentPage === 1) {
            container.innerHTML = '';
        }

        pageNotifications.forEach(notification => {
            const notificationElement = this.createNotificationElement(notification);
            container.appendChild(notificationElement);
        });

        // Show/hide load more button
        const hasMore = endIndex < this.filteredNotifications.length;
        if (hasMore) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `bg-white rounded-lg shadow border-l-4 ${
            notification.read ? 'border-gray-300' : this.getNotificationBorderColor(notification.type)
        }`;

        const timeAgo = this.getTimeAgo(notification.createdAt);

        element.innerHTML = `
            <div class="p-4">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3 flex-1">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center ${this.getNotificationBgColor(notification.type)}">
                                ${this.getNotificationIcon(notification.type)}
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2">
                                <p class="text-sm font-medium text-gray-900">${notification.title}</p>
                                ${!notification.read ? `
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        New
                                    </span>
                                ` : ''}
                            </div>
                            <p class="text-sm text-gray-600 mt-1">${notification.message}</p>
                            <p class="text-xs text-gray-400 mt-2">${timeAgo}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 ml-4">
                        ${!notification.read ? `
                            <button onclick="notificationManager.markAsRead(${notification.id})" 
                                    class="text-gray-400 hover:text-gray-600" title="Mark as read">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </button>
                        ` : ''}
                        <button onclick="notificationManager.deleteNotification(${notification.id})" 
                                class="text-gray-400 hover:text-red-600" title="Delete">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return element;
    }

    getNotificationBorderColor(type) {
        const colors = {
            'info': 'border-blue-500',
            'warning': 'border-yellow-500',
            'error': 'border-red-500',
            'success': 'border-green-500'
        };
        return colors[type] || 'border-gray-500';
    }

    getNotificationBgColor(type) {
        const colors = {
            'info': 'bg-blue-100 text-blue-600',
            'warning': 'bg-yellow-100 text-yellow-600',
            'error': 'bg-red-100 text-red-600',
            'success': 'bg-green-100 text-green-600'
        };
        return colors[type] || 'bg-gray-100 text-gray-600';
    }

    getNotificationIcon(type) {
        const icons = {
            'info': `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`,
            'warning': `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>`,
            'error': `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`,
            'success': `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        };
        return icons[type] || icons.info;
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
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return time.toLocaleDateString();
    }

    async markAsRead(notificationId) {
        try {
            // In a real app, call your API
            // await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
            
            // Update locally for demo
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                this.applyFilters();
                this.updateNotificationBadge();
                this.showToast('Notification marked as read', 'success');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            this.showToast('Error updating notification', 'error');
        }
    }

    async markAllAsRead() {
        try {
            // In a real app, call your API
            // await fetch('/api/notifications/read-all', { method: 'PUT' });
            
            // Update locally for demo
            this.notifications.forEach(notification => {
                notification.read = true;
            });
            this.applyFilters();
            this.updateNotificationBadge();
            this.showToast('All notifications marked as read', 'success');
        } catch (error) {
            console.error('Error marking all as read:', error);
            this.showToast('Error updating notifications', 'error');
        }
    }

    async deleteNotification(notificationId) {
        if (confirm('Are you sure you want to delete this notification?')) {
            try {
                // In a real app, call your API
                // await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
                
                // Update locally for demo
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
                this.applyFilters();
                this.updateNotificationBadge();
                this.showToast('Notification deleted', 'success');
            } catch (error) {
                console.error('Error deleting notification:', error);
                this.showToast('Error deleting notification', 'error');
            }
        }
    }

    async clearAll() {
        if (confirm('Are you sure you want to clear all notifications?')) {
            try {
                // In a real app, call your API
                // await fetch('/api/notifications', { method: 'DELETE' });
                
                // Update locally for demo
                this.notifications = [];
                this.applyFilters();
                this.updateNotificationBadge();
                this.showToast('All notifications cleared', 'success');
            } catch (error) {
                console.error('Error clearing notifications:', error);
                this.showToast('Error clearing notifications', 'error');
            }
        }
    }

    loadMore() {
        this.currentPage++;
        this.renderNotifications();
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notificationBadge');
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    startRealTimeUpdates() {
        // Simulate real-time notifications
        setInterval(() => {
            if (Math.random() > 0.8) { // 20% chance every 30 seconds
                this.simulateNewNotification();
            }
        }, 30000);
    }

    simulateNewNotification() {
        const types = ['info', 'warning'];
        const messages = [
            'Living Room Light was turned on',
            'Evening lighting schedule activated',
            'Energy usage is lower than average',
            'All devices are online and working properly'
        ];

        const newNotification = {
            id: Date.now(),
            title: 'System Update',
            message: messages[Math.floor(Math.random() * messages.length)],
            type: types[Math.floor(Math.random() * types.length)],
            read: false,
            createdAt: new Date()
        };

        this.notifications.unshift(newNotification);
        this.applyFilters();
        this.updateNotificationBadge();

        // Show desktop notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Smart Lighting', {
                body: newNotification.message,
                icon: '/favicon.ico'
            });
        }
    }

    saveSettings() {
        this.showToast('Notification settings saved', 'success');
        hideSettingsModal();
    }

    showToast(message, type = 'info') {
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
function showSettingsModal() {
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('settingsModal').classList.add('flex');
}

function hideSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
    document.getElementById('settingsModal').classList.remove('flex');
}

// Request notification permission
if ('Notification' in window) {
    Notification.requestPermission();
}

// Initialize notification manager
const notificationManager = new NotificationManager();