// VSB College Bus Tracking System - API Version
// Cross-device synchronization using backend API

class BusTrackingSystem {
    constructor() {
        this.apiBase = window.location.origin + '/api';
        this.currentUser = null;
        this.currentUserType = null;
        this.bindEvents();
    }

    bindEvents() {
        // Student login form
        document.getElementById('studentLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStudentLogin();
        });

        // Driver login form
        document.getElementById('driverLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDriverLogin();
        });

        // Admin login form
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin();
        });
    }

    // API helper methods
    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.apiBase}${endpoint}`, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Modal functions
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Student login handler
    async handleStudentLogin() {
        const studentName = document.getElementById('studentName').value.trim();
        const busNumber = document.getElementById('studentBusNumber').value.trim();

        if (!studentName || !busNumber) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // Mark attendance
            await this.apiCall('/attendance', 'POST', {
                studentName,
                busNumber
            });

            this.currentUser = { name: studentName, busNumber: busNumber };
            this.currentUserType = 'student';
            
            this.closeModal('studentModal');
            await this.showStudentDashboard();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    // Driver login handler
    async handleDriverLogin() {
        const driverName = document.getElementById('driverName').value.trim();
        const busNumber = document.getElementById('driverBusNumber').value.trim();

        if (!driverName || !busNumber) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // Verify driver assignment
            await this.apiCall('/verify-driver', 'POST', {
                driverName,
                busNumber
            });

            // Update driver status to active
            await this.apiCall('/status', 'POST', {
                busNumber,
                status: 'active'
            });

            this.currentUser = { name: driverName, busNumber: busNumber };
            this.currentUserType = 'driver';
            
            this.closeModal('driverModal');
            await this.showDriverDashboard();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    // Admin login handler
    async handleAdminLogin() {
        const password = document.getElementById('adminPassword').value;

        try {
            await this.apiCall('/admin-login', 'POST', { password });

            this.currentUser = { name: 'Admin' };
            this.currentUserType = 'admin';
            
            this.closeModal('adminModal');
            await this.showAdminDashboard();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    // Student Dashboard
    async showStudentDashboard() {
        try {
            const busNumber = this.currentUser.busNumber;
            const [drivers, stops, status] = await Promise.all([
                this.apiCall('/drivers'),
                this.apiCall('/stops'),
                this.apiCall('/status')
            ]);

            const assignedDriver = drivers[busNumber];
            const busStops = stops[busNumber] || [];
            const isDriverActive = status[busNumber] === 'active';

            let dashboardHTML = `
                <div class="dashboard active">
                    <div class="dashboard-header">
                        <h2>Student Dashboard</h2>
                        <button class="logout-btn" onclick="busSystem.logout()">Logout</button>
                    </div>
                    <div class="dashboard-content">
                        <div class="info-card">
                            <h3>Welcome, ${this.currentUser.name}!</h3>
                            <p><strong>Bus Number:</strong> ${busNumber}</p>
                        </div>
            `;

            if (assignedDriver) {
                dashboardHTML += `
                    <div class="info-card">
                        <h3>Bus Driver Information</h3>
                        <p><strong>Driver Name:</strong> ${assignedDriver.name}</p>
                        <p><strong>Phone:</strong> ${assignedDriver.phone}</p>
                        <p><strong>Status:</strong> <span class="${isDriverActive ? 'status-active' : 'status-inactive'}">${isDriverActive ? 'Active' : 'Inactive'}</span></p>
                    </div>
                `;

                if (busStops.length > 0) {
                    dashboardHTML += `
                        <div class="info-card">
                            <h3>Bus Stops</h3>
                            ${busStops.map(stop => `<p>• ${stop}</p>`).join('')}
                        </div>
                    `;
                }

                dashboardHTML += `
                    <div class="alert alert-success">
                        <strong>Attendance Marked!</strong> Your attendance has been automatically recorded for today.
                    </div>
                `;
            } else {
                dashboardHTML += `
                    <div class="alert alert-error">
                        <strong>No Driver Assigned</strong><br>
                        There is no driver assigned for bus number ${busNumber}. Please contact the administration for more details.
                    </div>
                `;
            }

            dashboardHTML += `
                        <div class="contact-info">
                            <h4>Need Help?</h4>
                            <p>Contact Administration: <a href="mailto:prasanth@vsbcollege.edu">prasanth@vsbcollege.edu</a></p>
                        </div>
                    </div>
                </div>
            `;

            this.hidePreviousDashboards();
            document.querySelector('.container').insertAdjacentHTML('beforeend', dashboardHTML);
        } catch (error) {
            alert('Error loading dashboard: ' + error.message);
        }
    }

    // Driver Dashboard
    async showDriverDashboard() {
        try {
            const busNumber = this.currentUser.busNumber;
            const [drivers, stops, attendance] = await Promise.all([
                this.apiCall('/drivers'),
                this.apiCall('/stops'),
                this.apiCall('/attendance')
            ]);

            const driverInfo = drivers[busNumber];
            const busStops = stops[busNumber] || [];
            const today = new Date().toISOString().split('T')[0];
            const todayAttendance = attendance[today] || {};
            const busAttendance = todayAttendance[busNumber] || [];

            let dashboardHTML = `
                <div class="dashboard active">
                    <div class="dashboard-header">
                        <h2>Driver Dashboard</h2>
                        <button class="logout-btn" onclick="busSystem.logout()">Logout</button>
                    </div>
                    <div class="dashboard-content">
                        <div class="info-card">
                            <h3>Welcome, ${this.currentUser.name}!</h3>
                            <p><strong>Bus Number:</strong> ${busNumber}</p>
                            <p><strong>Phone:</strong> ${driverInfo ? driverInfo.phone : 'N/A'}</p>
                            <p><strong>Status:</strong> <span class="status-active">Active</span></p>
                        </div>
            `;

            if (busStops.length > 0) {
                dashboardHTML += `
                    <div class="info-card">
                        <h3>Your Bus Stops</h3>
                        ${busStops.map(stop => `<p>• ${stop}</p>`).join('')}
                    </div>
                `;
            }

            dashboardHTML += `
                    <div class="info-card">
                        <h3>Today's Attendance</h3>
                        <p><strong>Students Present:</strong> ${busAttendance.length}</p>
                        ${busAttendance.length > 0 ? 
                            `<div style="margin-top: 10px;">
                                ${busAttendance.map(student => `<p>• ${student}</p>`).join('')}
                            </div>` : 
                            '<p>No students have logged in yet today.</p>'
                        }
                    </div>
                    <div class="attendance-section">
                        <h3>Driver Actions</h3>
                        <button class="attendance-btn" onclick="busSystem.updateDriverStatus('${busNumber}', 'inactive')">
                            End Route / Go Inactive
                        </button>
                        <div class="alert alert-info">
                            <strong>Note:</strong> Students automatically get attendance when they log in with your bus number.
                        </div>
                    </div>
                </div>
            `;

            this.hidePreviousDashboards();
            document.querySelector('.container').insertAdjacentHTML('beforeend', dashboardHTML);
        } catch (error) {
            alert('Error loading dashboard: ' + error.message);
        }
    }

    // Admin Dashboard
    async showAdminDashboard() {
        try {
            const [drivers, stops] = await Promise.all([
                this.apiCall('/drivers'),
                this.apiCall('/stops')
            ]);

            let dashboardHTML = `
                <div class="dashboard active">
                    <div class="dashboard-header">
                        <h2>Admin Dashboard</h2>
                        <button class="logout-btn" onclick="busSystem.logout()">Logout</button>
                    </div>
                    <div class="dashboard-content">
                        <div class="admin-form">
                            <h3>Add/Update Driver Assignment</h3>
                            <form id="driverForm">
                                <div class="form-group">
                                    <label>Driver Name:</label>
                                    <input type="text" id="driverNameInput" required>
                                </div>
                                <div class="form-group">
                                    <label>Bus Number:</label>
                                    <input type="text" id="busNumberInput" required>
                                </div>
                                <div class="form-group">
                                    <label>Phone Number:</label>
                                    <input type="tel" id="phoneInput" required>
                                </div>
                                <div class="form-group">
                                    <label>Bus Stops (one per line):</label>
                                    <textarea id="stopsInput" placeholder="Enter bus stops, one per line"></textarea>
                                </div>
                                <button type="submit" class="btn-primary">Save Driver Assignment</button>
                            </form>
                        </div>
                        <div class="driver-list">
                            <h3>Current Driver Assignments</h3>
                            <div id="driverListContainer">
                                ${this.generateDriverList(drivers, stops)}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.hidePreviousDashboards();
            document.querySelector('.container').insertAdjacentHTML('beforeend', dashboardHTML);

            // Bind admin form event
            document.getElementById('driverForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveDriverAssignment();
            });
        } catch (error) {
            alert('Error loading admin dashboard: ' + error.message);
        }
    }

    generateDriverList(drivers, stops) {
        if (Object.keys(drivers).length === 0) {
            return '<p>No drivers assigned yet.</p>';
        }

        return Object.entries(drivers).map(([busNumber, driver]) => {
            const busStops = stops[busNumber] || [];
            return `
                <div class="driver-item">
                    <div class="driver-info">
                        <h4>${driver.name}</h4>
                        <p><strong>Bus:</strong> ${busNumber} | <strong>Phone:</strong> ${driver.phone}</p>
                        ${busStops.length > 0 ? `<p><strong>Stops:</strong> ${busStops.join(', ')}</p>` : ''}
                    </div>
                    <button class="btn-danger" onclick="busSystem.removeDriver('${busNumber}')">Remove</button>
                </div>
            `;
        }).join('');
    }

    async saveDriverAssignment() {
        const driverName = document.getElementById('driverNameInput').value.trim();
        const busNumber = document.getElementById('busNumberInput').value.trim();
        const phone = document.getElementById('phoneInput').value.trim();
        const stopsText = document.getElementById('stopsInput').value.trim();

        if (!driverName || !busNumber || !phone) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            // Save driver
            await this.apiCall('/drivers', 'POST', {
                busNumber,
                name: driverName,
                phone
            });

            // Save stops if provided
            if (stopsText) {
                const stopsArray = stopsText.split('\n').map(stop => stop.trim()).filter(stop => stop);
                await this.apiCall('/stops', 'POST', {
                    busNumber,
                    stops: stopsArray
                });
            }

            // Clear form
            document.getElementById('driverForm').reset();

            // Refresh driver list
            const [drivers, stops] = await Promise.all([
                this.apiCall('/drivers'),
                this.apiCall('/stops')
            ]);
            document.getElementById('driverListContainer').innerHTML = this.generateDriverList(drivers, stops);

            alert('Driver assignment saved successfully!');
        } catch (error) {
            alert('Error saving driver: ' + error.message);
        }
    }

    async removeDriver(busNumber) {
        if (confirm('Are you sure you want to remove this driver assignment?')) {
            try {
                await this.apiCall(`/drivers/${busNumber}`, 'DELETE');

                // Refresh driver list
                const [drivers, stops] = await Promise.all([
                    this.apiCall('/drivers'),
                    this.apiCall('/stops')
                ]);
                document.getElementById('driverListContainer').innerHTML = this.generateDriverList(drivers, stops);

                alert('Driver assignment removed successfully!');
            } catch (error) {
                alert('Error removing driver: ' + error.message);
            }
        }
    }

    async updateDriverStatus(busNumber, status) {
        try {
            await this.apiCall('/status', 'POST', {
                busNumber,
                status
            });

            if (status === 'inactive') {
                alert('Status updated to inactive. Students will see you as offline.');
                this.logout();
            }
        } catch (error) {
            alert('Error updating status: ' + error.message);
        }
    }

    hidePreviousDashboards() {
        const existingDashboards = document.querySelectorAll('.dashboard');
        existingDashboards.forEach(dashboard => dashboard.remove());
    }

    logout() {
        this.currentUser = null;
        this.currentUserType = null;
        this.hidePreviousDashboards();
        
        // Clear form inputs
        document.querySelectorAll('input').forEach(input => input.value = '');
        
        // Show main portals
        document.querySelector('.login-portals').style.display = 'grid';
    }
}

// Global functions for HTML onclick events
function openStudentLogin() {
    busSystem.openModal('studentModal');
}

function openDriverLogin() {
    busSystem.openModal('driverModal');
}

function openAdminLogin() {
    busSystem.openModal('adminModal');
}

function closeModal(modalId) {
    busSystem.closeModal(modalId);
}

// Initialize the system
const busSystem = new BusTrackingSystem();

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Auto-refresh student dashboard every 30 seconds for real-time updates
setInterval(async () => {
    if (busSystem.currentUserType === 'student') {
        const dashboards = document.querySelectorAll('.dashboard.active');
        if (dashboards.length > 0) {
            // Refresh student dashboard to show updated driver status
            await busSystem.showStudentDashboard();
        }
    }
}, 30000);