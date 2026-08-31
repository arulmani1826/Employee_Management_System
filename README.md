# Employee Management System

A web-based Employee Management System for managing employees, tasks, leave, attendance, analytics, reports, and role-based access.

## Features

### Employee
- Employee registration and login
- Employee profile
- View assigned tasks
- Update task status
- View task history
- Apply for leave
- Track leave status
- Attendance check-in/check-out
- View working hours
- View notifications

### Management
- Management login and registration
- Manage employees
- Create and assign tasks
- Set task priority and deadlines
- Track task progress
- Manage leave requests
- Approve/reject leave
- Monitor attendance
- Employee analytics
- Management reports
- Export reports
- View notifications

### Task Management
- Pending
- In Progress
- Completed
- Overdue task identification
- Task allocation and completion history

### Attendance
- Employee check-in
- Employee check-out
- Working-hours calculation
- Attendance records
- Management attendance view

### Analytics & Reports
- Employee workload
- Task completion statistics
- Pending and overdue tasks
- Leave summary
- Attendance summary
- Employee-wise reports
- Department/team reports
- Monthly reports
- Exportable management reports

### Notifications
- In-app notification system
- Unread notification count
- Notification panel
- Employee and management notifications

## Role-Based Access

| Role | Access |
|------|--------|
| Employee | Tasks, Leave, Attendance, Profile, Notifications |
| Management | Employees, Tasks, Leave, Attendance, Analytics, Reports, Notifications |

## Technologies Used

### Frontend
- React
- Vite
- JavaScript
- CSS
- Axios

### Backend
- Node.js
- Express.js
- SQLite

## Project Structure

```text
employee-management-demo/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md