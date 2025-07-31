const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file paths
const DATA_DIR = './data';
const DRIVERS_FILE = path.join(DATA_DIR, 'drivers.json');
const STOPS_FILE = path.join(DATA_DIR, 'stops.json');
const ATTENDANCE_FILE = path.join(DATA_DIR, 'attendance.json');
const STATUS_FILE = path.join(DATA_DIR, 'status.json');

// Initialize data directory and files
function initializeData() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
    }
    
    const files = [
        { path: DRIVERS_FILE, default: {} },
        { path: STOPS_FILE, default: {} },
        { path: ATTENDANCE_FILE, default: {} },
        { path: STATUS_FILE, default: {} }
    ];
    
    files.forEach(file => {
        if (!fs.existsSync(file.path)) {
            fs.writeFileSync(file.path, JSON.stringify(file.default, null, 2));
        }
    });
}

// Helper functions
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return {};
    }
}

function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// API Routes

// Get all drivers
app.get('/api/drivers', (req, res) => {
    const drivers = readJSONFile(DRIVERS_FILE);
    res.json(drivers);
});

// Add or update driver
app.post('/api/drivers', (req, res) => {
    const { busNumber, name, phone } = req.body;
    
    if (!busNumber || !name || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const drivers = readJSONFile(DRIVERS_FILE);
    drivers[busNumber] = { name, phone };
    
    if (writeJSONFile(DRIVERS_FILE, drivers)) {
        res.json({ success: true, message: 'Driver saved successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save driver' });
    }
});

// Remove driver
app.delete('/api/drivers/:busNumber', (req, res) => {
    const { busNumber } = req.params;
    
    const drivers = readJSONFile(DRIVERS_FILE);
    const stops = readJSONFile(STOPS_FILE);
    const status = readJSONFile(STATUS_FILE);
    
    delete drivers[busNumber];
    delete stops[busNumber];
    delete status[busNumber];
    
    const success = writeJSONFile(DRIVERS_FILE, drivers) &&
                   writeJSONFile(STOPS_FILE, stops) &&
                   writeJSONFile(STATUS_FILE, status);
    
    if (success) {
        res.json({ success: true, message: 'Driver removed successfully' });
    } else {
        res.status(500).json({ error: 'Failed to remove driver' });
    }
});

// Get bus stops
app.get('/api/stops', (req, res) => {
    const stops = readJSONFile(STOPS_FILE);
    res.json(stops);
});

// Update bus stops
app.post('/api/stops', (req, res) => {
    const { busNumber, stops } = req.body;
    
    if (!busNumber || !Array.isArray(stops)) {
        return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const allStops = readJSONFile(STOPS_FILE);
    allStops[busNumber] = stops;
    
    if (writeJSONFile(STOPS_FILE, allStops)) {
        res.json({ success: true, message: 'Stops updated successfully' });
    } else {
        res.status(500).json({ error: 'Failed to update stops' });
    }
});

// Get driver status
app.get('/api/status', (req, res) => {
    const status = readJSONFile(STATUS_FILE);
    res.json(status);
});

// Update driver status
app.post('/api/status', (req, res) => {
    const { busNumber, status } = req.body;
    
    if (!busNumber || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const allStatus = readJSONFile(STATUS_FILE);
    allStatus[busNumber] = status;
    
    if (writeJSONFile(STATUS_FILE, allStatus)) {
        res.json({ success: true, message: 'Status updated successfully' });
    } else {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Get attendance
app.get('/api/attendance', (req, res) => {
    const attendance = readJSONFile(ATTENDANCE_FILE);
    res.json(attendance);
});

// Mark attendance
app.post('/api/attendance', (req, res) => {
    const { studentName, busNumber } = req.body;
    
    if (!studentName || !busNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const attendance = readJSONFile(ATTENDANCE_FILE);
    
    if (!attendance[today]) {
        attendance[today] = {};
    }
    if (!attendance[today][busNumber]) {
        attendance[today][busNumber] = [];
    }
    
    // Check if student already marked attendance today
    if (!attendance[today][busNumber].includes(studentName)) {
        attendance[today][busNumber].push(studentName);
        
        if (writeJSONFile(ATTENDANCE_FILE, attendance)) {
            res.json({ success: true, message: 'Attendance marked successfully' });
        } else {
            res.status(500).json({ error: 'Failed to mark attendance' });
        }
    } else {
        res.json({ success: true, message: 'Attendance already marked' });
    }
});

// Verify driver login
app.post('/api/verify-driver', (req, res) => {
    const { driverName, busNumber } = req.body;
    
    if (!driverName || !busNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const drivers = readJSONFile(DRIVERS_FILE);
    const assignedDriver = drivers[busNumber];
    
    if (!assignedDriver || assignedDriver.name.toLowerCase() !== driverName.toLowerCase()) {
        return res.status(401).json({ error: 'Driver not assigned to this bus number' });
    }
    
    res.json({ success: true, driver: assignedDriver });
});

// Admin login
app.post('/api/admin-login', (req, res) => {
    const { password } = req.body;
    
    if (password !== 'admin123') {
        return res.status(401).json({ error: 'Invalid admin password' });
    }
    
    res.json({ success: true, message: 'Admin login successful' });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize data and start server
initializeData();

app.listen(PORT, () => {
    console.log(`🚌 VSB College Bus Tracking System running on http://localhost:${PORT}`);
    console.log(`📊 Admin Portal: http://localhost:${PORT} (Password: admin123)`);
    console.log(`💾 Data stored in: ${DATA_DIR}`);
});

module.exports = app;