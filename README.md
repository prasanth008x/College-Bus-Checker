# VSB College Bus Tracking System

A comprehensive real-time bus tracking and management system for VSB College with three distinct portals for students, drivers, and administrators.

## Features

### 🎓 Student Portal
- **Real-time Bus Tracking**: View assigned driver details and current status
- **Automatic Attendance**: Attendance is automatically marked when logging in with correct bus number
- **Bus Stop Information**: View all stops for your assigned bus route
- **Driver Contact**: Access driver phone number for direct communication
- **Status Updates**: Real-time driver active/inactive status
- **Help & Support**: Direct email contact to administration

### 🚌 Driver Portal
- **Route Management**: View assigned bus route and stops
- **Attendance Tracking**: See which students have logged in today
- **Status Control**: Mark yourself as active/inactive for student visibility
- **Real-time Updates**: Student attendance updates in real-time

### ⚙️ Admin Portal
- **Driver Assignment**: Assign drivers to specific bus numbers
- **Route Management**: Define bus stops for each route
- **Contact Information**: Manage driver phone numbers
- **Real-time Monitoring**: View all assignments and make updates instantly
- **Data Persistence**: All data syncs across devices using localStorage

## System Workflow

1. **Admin Setup**: Admin logs in and assigns drivers to bus numbers with contact details and routes
2. **Driver Login**: Drivers log in with their name and assigned bus number
3. **Student Access**: Students log in with their name and bus number to view driver info
4. **Automatic Attendance**: System automatically marks attendance when students log in
5. **Real-time Sync**: All data synchronizes across devices for instant updates

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Download all files to a folder on your computer
2. Open `index.html` in your web browser
3. Start using the system immediately!

### Default Admin Password
- **Password**: `admin123`
- **Email Contact**: `prasanth@vsbcollege.edu`

## Usage Guide

### For Administrators
1. Click on "Admin" portal
2. Enter admin password: `admin123`
3. Add driver assignments with:
   - Driver name
   - Bus number
   - Phone number
   - Bus stops (one per line)
4. Save assignments - they'll be available instantly to all users

### For Drivers
1. Click on "Driver Login"
2. Enter your exact name and assigned bus number
3. View your route information and student attendance
4. Use "End Route" button to go inactive when done

### For Students
1. Click on "Student Login"
2. Enter your name and bus number
3. View driver information, contact details, and bus stops
4. Your attendance is automatically recorded

## Technical Features

### Real-time Synchronization
- Uses localStorage for cross-device data persistence
- No internet connection required after initial load
- Data syncs automatically between different browser sessions

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Modern, intuitive user interface
- Accessible design with clear navigation

### Data Management
- Automatic attendance tracking
- Driver status management
- Route and stop information storage
- Contact information management

## File Structure
```
vsb-college-bus-system/
├── index.html          # Main application file
├── styles.css          # Styling and responsive design
├── script.js           # Core functionality and logic
└── README.md           # This documentation
```

## Browser Compatibility
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Data Storage
The system uses browser localStorage to store:
- Driver assignments and contact information
- Bus routes and stop information
- Daily attendance records
- Driver active/inactive status

**Note**: Data persists across browser sessions but is device-specific. For true cross-device synchronization, consider implementing a backend database.

## Support & Contact
For technical support or feature requests, contact:
**Email**: prasanth@vsbcollege.edu

## Credits
© 2025 VSB College Bus System. All rights reserved by Prasanth @2025

## Future Enhancements
- GPS tracking integration
- SMS notifications
- Mobile app version
- Backend database for true cross-device sync
- Advanced reporting and analytics