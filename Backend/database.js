const Database = require("better-sqlite3");

const db = new Database("employee_management.db");

const bcrypt = require("bcryptjs");

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Users table
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('EMPLOYEE', 'MANAGEMENT')),
    department TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Tasks table
db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'MEDIUM',
    deadline TEXT,
    status TEXT DEFAULT 'PENDING',
    assigned_to INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (assigned_to)
        REFERENCES users(id),

    FOREIGN KEY (created_by)
        REFERENCES users(id)
);
`);

// Leave requests table
db.exec(`
CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type TEXT NOT NULL,
    from_date TEXT NOT NULL,
    to_date TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id)
        REFERENCES users(id)
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS task_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by INTEGER NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id)
        REFERENCES tasks(id),

    FOREIGN KEY (changed_by)
        REFERENCES users(id)
);
`);
// ========================================
// ATTENDANCE TABLE
// ========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        employee_id INTEGER NOT NULL,

        attendance_date TEXT NOT NULL,

        status TEXT NOT NULL DEFAULT 'PRESENT',

        check_in TEXT,

        check_out TEXT,

        working_hours REAL DEFAULT 0,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(employee_id, attendance_date),

        FOREIGN KEY(employee_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    )
`);
// ========================================
// NOTIFICATIONS TABLE
// ========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER NOT NULL,

        title TEXT NOT NULL,

        message TEXT NOT NULL,

        type TEXT DEFAULT 'INFO',

        is_read INTEGER DEFAULT 0,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    )
`);
// Insert demo users if they don't exist
const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users
    (name, email, password, role, department)
    VALUES (?, ?, ?, ?, ?)
`);

const employeePassword = bcrypt.hashSync("1234", 10);
const managementPassword = bcrypt.hashSync("1234", 10);

insertUser.run(
    "Arul Mani",
    "employee@gmail.com",
    employeePassword,
    "EMPLOYEE",
    "IT"
);

insertUser.run(
    "Admin",
    "admin@gmail.com",
    managementPassword,
    "MANAGEMENT",
    "Management"
);

// ========================================
// DEMO EMPLOYEES
// ========================================

insertUser.run(
    "Kumar",
    "kumar@gmail.com",
    bcrypt.hashSync("1234", 10),
    "EMPLOYEE",
    "HR"
);

insertUser.run(
    "Priya",
    "priya@gmail.com",
    bcrypt.hashSync("1234", 10),
    "EMPLOYEE",
    "Finance"
);

insertUser.run(
    "Rahul",
    "rahul@gmail.com",
    bcrypt.hashSync("1234", 10),
    "EMPLOYEE",
    "IT"
);

insertUser.run(
    "Divya",
    "divya@gmail.com",
    bcrypt.hashSync("1234", 10),
    "EMPLOYEE",
    "Marketing"
);
// // ========================================
// // DEMO TASKS
// // ========================================

// const insertTask = db.prepare(`
//     INSERT INTO tasks
//     (
//         title,
//         description,
//         priority,
//         deadline,
//         status,
//         assigned_to,
//         created_by
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?)
// `);

// // Get IDs
// const admin = db.prepare(`
//     SELECT id
//     FROM users
//     WHERE email = 'admin@gmail.com'
// `).get();

// const arul = db.prepare(`
//     SELECT id
//     FROM users
//     WHERE email = 'employee@gmail.com'
// `).get();

// const kumar = db.prepare(`
//     SELECT id
//     FROM users
//     WHERE email = 'kumar@gmail.com'
// `).get();

// const priya = db.prepare(`
//     SELECT id
//     FROM users
//     WHERE email = 'priya@gmail.com'
// `).get();

// const rahul = db.prepare(`
//     SELECT id
//     FROM users
//     WHERE email = 'rahul@gmail.com'
// `).get();

// const divya = db.prepare(`
//     SELECT id
//     FROM users
//     WHERE email = 'divya@gmail.com'
// `).get();


// // Arul tasks

// insertTask.run(
//     "Build Login Page",
//     "Create React login interface",
//     "HIGH",
//     "2026-09-02",
//     "COMPLETED",
//     arul.id,
//     admin.id
// );

// insertTask.run(
//     "Employee Dashboard",
//     "Develop employee dashboard",
//     "HIGH",
//     "2026-09-05",
//     "IN_PROGRESS",
//     arul.id,
//     admin.id
// );

// insertTask.run(
//     "API Integration",
//     "Connect React with backend APIs",
//     "MEDIUM",
//     "2026-09-08",
//     "PENDING",
//     arul.id,
//     admin.id
// );


// // Kumar tasks

// insertTask.run(
//     "HR Report",
//     "Prepare monthly HR report",
//     "MEDIUM",
//     "2026-09-03",
//     "COMPLETED",
//     kumar.id,
//     admin.id
// );

// insertTask.run(
//     "Employee Records",
//     "Update employee records",
//     "LOW",
//     "2026-09-10",
//     "IN_PROGRESS",
//     kumar.id,
//     admin.id
// );


// // Priya tasks

// insertTask.run(
//     "Financial Report",
//     "Prepare monthly financial report",
//     "HIGH",
//     "2026-09-04",
//     "COMPLETED",
//     priya.id,
//     admin.id
// );

// insertTask.run(
//     "Expense Analysis",
//     "Analyze department expenses",
//     "MEDIUM",
//     "2026-09-09",
//     "PENDING",
//     priya.id,
//     admin.id
// );


// // Rahul tasks

// insertTask.run(
//     "Database Design",
//     "Design employee database",
//     "HIGH",
//     "2026-09-01",
//     "COMPLETED",
//     rahul.id,
//     admin.id
// );

// insertTask.run(
//     "Backend API",
//     "Develop REST APIs",
//     "HIGH",
//     "2026-09-06",
//     "IN_PROGRESS",
//     rahul.id,
//     admin.id
// );

// insertTask.run(
//     "Testing",
//     "Test backend APIs",
//     "MEDIUM",
//     "2026-08-20",
//     "PENDING",
//     rahul.id,
//     admin.id
// );


// // Divya tasks

// insertTask.run(
//     "Marketing Plan",
//     "Prepare marketing strategy",
//     "MEDIUM",
//     "2026-09-07",
//     "COMPLETED",
//     divya.id,
//     admin.id
// );

// // ========================================
// // DEMO LEAVE REQUESTS
// // ========================================

// const insertLeave = db.prepare(`
//     INSERT INTO leave_requests
//     (
//         employee_id,
//         leave_type,
//         from_date,
//         to_date,
//         reason,
//         status
//     )
//     VALUES (?, ?, ?, ?, ?, ?)
// `);


// insertLeave.run(
//     arul.id,
//     "Casual Leave",
//     "2026-09-12",
//     "2026-09-13",
//     "Personal work",
//     "PENDING"
// );


// insertLeave.run(
//     kumar.id,
//     "Sick Leave",
//     "2026-09-01",
//     "2026-09-02",
//     "Not feeling well",
//     "APPROVED"
// );


// insertLeave.run(
//     priya.id,
//     "Casual Leave",
//     "2026-09-15",
//     "2026-09-16",
//     "Family function",
//     "REJECTED"
// );


// insertLeave.run(
//     rahul.id,
//     "Emergency Leave",
//     "2026-09-05",
//     "2026-09-05",
//     "Family emergency",
//     "PENDING"
// );

console.log("SQLite database initialized successfully.");

module.exports = db;