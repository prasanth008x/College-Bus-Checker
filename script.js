// VSB College Bus Tracking System
// Data storage using localStorage for cross-device synchronization

class BusTrackingSystem {
    constructor() {
        this.adminPassword = 'admin123';
        this.currentUser = null;
        this.currentUserType = null;
        this.initializeData();
        this.bindEvents();
    }

    initializeData() {
        // Initialize default data if not exists
        if (!localStorage.getItem('busDrivers')) {
            localStorage.setItem('busDrivers', JSON.stringify({}));
        }
        if (!localStorage.getItem('busStops')) {
            localStorage.setItem('busStops', JSON.stringify({}));
        }
        if (!localStorage.getItem('attendance')) {
            localStorage.setItem('attendance', JSON.stringify({}));
        }
        if (!localStorage.getItem('driverStatus')) {
            localStorage.setItem('driverStatus', JSON.stringify({}));
        }
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

    // Modal functions
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Student login handler
    handleStudentLogin() {
        const studentName = document.getElementById('studentName').value.trim();
        const busNumber = document.getElementById('studentBusNumber').value.trim();

        if (!studentName || !busNumber) {
            alert('Please fill in all fields');
            return;
        }

        this.currentUser = { name: studentName, busNumber: busNumber };
        this.currentUserType = 'student';
        
        this.closeModal('studentModal');
        this.showStudentDashboard();
        this.markAttendance(studentName, busNumber);
    }

    // Driver login handler
    handleDriverLogin() {
        const driverName = document.getElementById('driverName').value.trim();
        const busNumber = document.getElementById('driverBusNumber').value.trim();

        if (!driverName || !busNumber) {
            alert('Please fill in all fields');
            return;
        }

        // Check if driver is assigned to this bus
        const drivers = JSON.parse(localStorage.getItem('busDrivers'));
        const assignedDriver = drivers[busNumber];

        if (!assignedDriver || assignedDriver.name.toLowerCase() !== driverName.toLowerCase()) {
            alert('Driver not assigned to this bus number. Please contact admin.');
            return;
        }

        this.currentUser = { name: driverName, busNumber: busNumber };
        this.currentUserType = 'driver';
        
        this.closeModal('driverModal');
        this.showDriverDashboard();
        this.updateDriverStatus(driverName, busNumber, 'active');
    }

    // Admin login handler
    handleAdminLogin() {
        const password = document.getElementById('adminPassword').value;

        if (password !== this.adminPassword) {
            alert('Invalid admin password');
            return;
        }

        this.currentUser = { name: 'Admin' };
        this.currentUserType = 'admin';
        
        this.closeModal('adminModal');
        this.showAdminDashboard();
    }

    // Student Dashboard
    showStudentDashboard() {
        const busNumber = this.currentUser.busNumber;
        const drivers = JSON.parse(localStorage.getItem('busDrivers'));
        const busStops = JSON.parse(localStorage.getItem('busStops'));
        const driverStatus = JSON.parse(localStorage.getItem('driverStatus'));

        const assignedDriver = drivers[busNumber];
        const stops = busStops[busNumber] || [];
        const isDriverActive = driverStatus[busNumber] === 'active';

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

            if (stops.length > 0) {
                dashboardHTML += `
                    <div class="info-card">
                        <h3>Bus Stops</h3>
                        ${stops.map(stop => `<p>• ${stop}</p>`).join('')}
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
    }

    // Driver Dashboard
    showDriverDashboard() {
        const busNumber = this.currentUser.busNumber;
        const drivers = JSON.parse(localStorage.getItem('busDrivers'));
        const busStops = JSON.parse(localStorage.getItem('busStops'));
        const attendance = JSON.parse(localStorage.getItem('attendance'));

        const driverInfo = drivers[busNumber];
        const stops = busStops[busNumber] || [];
        const todayAttendance = attendance[this.getTodayDate()] || {};
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

        if (stops.length > 0) {
            dashboardHTML += `
                <div class="info-card">
                    <h3>Your Bus Stops</h3>
                    ${stops.map(stop => `<p>• ${stop}</p>`).join('')}
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
                    <button class="attendance-btn" onclick="busSystem.updateDriverStatus('${this.currentUser.name}', '${busNumber}', 'inactive')">
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
    }

    // Admin Dashboard
    showAdminDashboard() {
        const drivers = JSON.parse(localStorage.getItem('busDrivers'));
        const busStops = JSON.parse(localStorage.getItem('busStops'));

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
                            ${this.generateDriverList(drivers, busStops)}
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
    }

    generateDriverList(drivers, busStops) {
        if (Object.keys(drivers).length === 0) {
            return '<p>No drivers assigned yet.</p>';
        }

        return Object.entries(drivers).map(([busNumber, driver]) => {
            const stops = busStops[busNumber] || [];
            return `
                <div class="driver-item">
                    <div class="driver-info">
                        <h4>${driver.name}</h4>
                        <p><strong>Bus:</strong> ${busNumber} | <strong>Phone:</strong> ${driver.phone}</p>
                        ${stops.length > 0 ? `<p><strong>Stops:</strong> ${stops.join(', ')}</p>` : ''}
                    </div>
                    <button class="btn-danger" onclick="busSystem.removeDriver('${busNumber}')">Remove</button>
                </div>
            `;
        }).join('');
    }

    saveDriverAssignment() {
        const driverName = document.getElementById('driverNameInput').value.trim();
        const busNumber = document.getElementById('busNumberInput').value.trim();
        const phone = document.getElementById('phoneInput').value.trim();
        const stopsText = document.getElementById('stopsInput').value.trim();

        if (!driverName || !busNumber || !phone) {
            alert('Please fill in all required fields');
            return;
        }

        const drivers = JSON.parse(localStorage.getItem('busDrivers'));
        const busStops = JSON.parse(localStorage.getItem('busStops'));

        drivers[busNumber] = {
            name: driverName,
            phone: phone
        };

        if (stopsText) {
            busStops[busNumber] = stopsText.split('\n').map(stop => stop.trim()).filter(stop => stop);
        }

        localStorage.setItem('busDrivers', JSON.stringify(drivers));
        localStorage.setItem('busStops', JSON.stringify(busStops));

        // Clear form
        document.getElementById('driverForm').reset();

        // Refresh driver list
        document.getElementById('driverListContainer').innerHTML = this.generateDriverList(drivers, busStops);

        alert('Driver assignment saved successfully!');
    }

    removeDriver(busNumber) {
        if (confirm('Are you sure you want to remove this driver assignment?')) {
            const drivers = JSON.parse(localStorage.getItem('busDrivers'));
            const busStops = JSON.parse(localStorage.getItem('busStops'));
            const driverStatus = JSON.parse(localStorage.getItem('driverStatus'));

            delete drivers[busNumber];
            delete busStops[busNumber];
            delete driverStatus[busNumber];

            localStorage.setItem('busDrivers', JSON.stringify(drivers));
            localStorage.setItem('busStops', JSON.stringify(busStops));
            localStorage.setItem('driverStatus', JSON.stringify(driverStatus));

            // Refresh driver list
            document.getElementById('driverListContainer').innerHTML = this.generateDriverList(drivers, busStops);

            alert('Driver assignment removed successfully!');
        }
    }

    markAttendance(studentName, busNumber) {
        const today = this.getTodayDate();
        const attendance = JSON.parse(localStorage.getItem('attendance'));

        if (!attendance[today]) {
            attendance[today] = {};
        }
        if (!attendance[today][busNumber]) {
            attendance[today][busNumber] = [];
        }

        // Check if student already marked attendance today
        if (!attendance[today][busNumber].includes(studentName)) {
            attendance[today][busNumber].push(studentName);
            localStorage.setItem('attendance', JSON.stringify(attendance));
        }
    }

    updateDriverStatus(driverName, busNumber, status) {
        const driverStatus = JSON.parse(localStorage.getItem('driverStatus'));
        driverStatus[busNumber] = status;
        localStorage.setItem('driverStatus', JSON.stringify(driverStatus));

        if (status === 'inactive') {
            alert('Status updated to inactive. Students will see you as offline.');
            this.logout();
        }
    }

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
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

// Auto-refresh driver status every 30 seconds for real-time updates
setInterval(() => {
    if (busSystem.currentUserType === 'student') {
        const dashboards = document.querySelectorAll('.dashboard.active');
        if (dashboards.length > 0) {
            // Refresh student dashboard to show updated driver status
            busSystem.showStudentDashboard();
        }
    }
}, 30000);