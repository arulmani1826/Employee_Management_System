const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");
const JWT_SECRET = "employee-management-demo-secret";
const cron = require("node-cron");

const app = express();

app.use(cors());
app.use(express.json());


// ================================
// TEST
// ================================

app.get("/", (req, res) => {
    res.json({
        message: "Employee Management API is running"
    });
});


// ================================
// LOGIN
// ================================

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const user = db.prepare(`
        SELECT *
        FROM users
        WHERE email = ?
    `).get(email);

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const passwordMatch = bcrypt.compareSync(
        password,
        user.password
    );

    if (!passwordMatch) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "2h"
        }
    );

    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department
        }
    });
});
// ================================
// REGISTRATION
// ================================

app.post("/api/register", async (req, res) => {

    const {
        name,
        email,
        password,
        department,
        role
    } = req.body;


    // Validate fields
    if (
        !name ||
        !email ||
        !password ||
        !department ||
        !role
    ) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }


    // Validate role
    if (
        !["EMPLOYEE", "MANAGEMENT"].includes(role)
    ) {
        return res.status(400).json({
            message: "Invalid role"
        });
    }


    try {

        // Check existing email
        const existingUser = db.prepare(`
            SELECT id
            FROM users
            WHERE email = ?
        `).get(email);


        if (existingUser) {

            return res.status(409).json({
                message: "Email already exists"
            });

        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create account
        const result = db.prepare(`
            INSERT INTO users
            (
                name,
                email,
                password,
                role,
                department
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            name,
            email,
            hashedPassword,
            role,
            department
        );


        res.status(201).json({

            message:
                "Registration successful",

            userId:
                result.lastInsertRowid

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        res.status(500).json({
            message:
                "Failed to register user"
        });

    }

});

function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token = authHeader &&
        authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    jwt.verify(
        token,
        JWT_SECRET,
        (err, user) => {

            if (err) {
                return res.status(403).json({
                    message: "Invalid or expired token"
                });
            }

            req.user = user;

            next();
        }
    );
}
// ================================
// GET PROFILE
// ================================

app.get(
    "/api/profile",
    authenticateToken,
    (req, res) => {

        try {

            const user = db.prepare(`
                SELECT
                    id,
                    name,
                    email,
                    role,
                    department,
                    created_at
                FROM users
                WHERE id = ?
            `).get(req.user.id);


            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });

            }


            res.json(user);


        } catch (error) {

            console.error(
                "Profile error:",
                error
            );


            res.status(500).json({
                message:
                    "Could not load profile"
            });

        }

    }
);


// ================================
// UPDATE PROFILE
// ================================

app.put(
    "/api/profile",
    authenticateToken,
    (req, res) => {

        const {
            name,
            email,
            department
        } = req.body;


        if (!name || !email) {

            return res.status(400).json({
                message:
                    "Name and email are required"
            });

        }


        try {

            // Check whether email belongs
            // to another user

            const existingUser =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                    AND id != ?
                `).get(
                    email,
                    req.user.id
                );


            if (existingUser) {

                return res.status(409).json({
                    message:
                        "Email already exists"
                });

            }


            db.prepare(`
                UPDATE users
                SET
                    name = ?,
                    email = ?,
                    department = ?
                WHERE id = ?
            `).run(
                name,
                email,
                department || "",
                req.user.id
            );


            const updatedUser =
                db.prepare(`
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        department,
                        created_at
                    FROM users
                    WHERE id = ?
                `).get(
                    req.user.id
                );


            res.json({

                message:
                    "Profile updated successfully",

                user:
                    updatedUser

            });


        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );


            res.status(500).json({
                message:
                    "Could not update profile"
            });

        }

    }
);

// ================================
// EMPLOYEES
// ================================

app.get(
    "/api/employees",
    authenticateToken,
    managementOnly,
    (req, res) => {

    const employees = db.prepare(`
        SELECT id, name, email, department
        FROM users
        WHERE role = 'EMPLOYEE'
    `).all();

    res.json(employees);
});


// ================================
// CREATE TASK
// ================================

app.post(
    "/api/tasks",
    authenticateToken,
    managementOnly,
    (req, res) => {

    const {
        title,
        description,
        priority,
        deadline,
        assigned_to,
        created_by
    } = req.body;

    if (!title || !assigned_to || !deadline) {
        return res.status(400).json({
            message: "Title, employee and deadline are required"
        });
    }

    const result = db.prepare(`
        INSERT INTO tasks
        (title, description, priority, deadline, assigned_to, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        title,
        description || "",
        priority || "MEDIUM",
        deadline,
        assigned_to,
        created_by
    );
    createNotification(
    assigned_to,
    "📋 New Task Assigned",
    `You have been assigned a new task: ${title}`,
    "TASK"
);

    res.json({
        message: "Task assigned successfully",
        taskId: result.lastInsertRowid
    });
});
// Notify employee about new task



// ================================
// ALL TASKS
// ================================

app.get("/api/tasks", (req, res) => {

    const tasks = db.prepare(`
        SELECT
            tasks.*,
            users.name AS employee_name
        FROM tasks
        LEFT JOIN users
        ON tasks.assigned_to = users.id
        ORDER BY tasks.id DESC
    `).all();

    res.json(tasks);
});

function managementOnly(req, res, next) {

    if (req.user.role !== "MANAGEMENT") {
        return res.status(403).json({
            message: "Management access required"
        });
    }

    next();
}

function employeeOnly(req, res, next) {

    if (req.user.role !== "EMPLOYEE") {
        return res.status(403).json({
            message: "Employee access required"
        });
    }

    next();
}

// ================================
// EMPLOYEE TASKS
// ================================

app.get("/api/tasks/employee/:id", (req, res) => {

    const employeeId = req.params.id;

    const tasks = db.prepare(`
        SELECT *
        FROM tasks
        WHERE assigned_to = ?
        ORDER BY deadline ASC
    `).all(employeeId);

    res.json(tasks);
});


// ================================
// UPDATE TASK STATUS
// ================================

app.put(
    "/api/tasks/:id/status",
    authenticateToken,
    (req, res) => {

        const { status } = req.body;
        const taskId = req.params.id;

        if (
            !["PENDING", "IN_PROGRESS", "COMPLETED"]
                .includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid task status"
            });
        }

        try {

            // Get task BEFORE updating it
            const task = db.prepare(`
                SELECT
                    t.*,
                    u.name AS employee_name
                FROM tasks t
                LEFT JOIN users u
                    ON u.id = t.assigned_to
                WHERE t.id = ?
            `).get(taskId);


            if (!task) {

                return res.status(404).json({
                    message: "Task not found"
                });

            }


            // Update task
            db.prepare(`
                UPDATE tasks
                SET status = ?
                WHERE id = ?
            `).run(
                status,
                taskId
            );


            // ========================================
            // EMPLOYEE COMPLETED TASK
            // ========================================

            if (
                status === "COMPLETED" &&
                task.status !== "COMPLETED"
            ) {

                // Get ALL management users

                const managers = db.prepare(`
                    SELECT id
                    FROM users
                    WHERE role = 'MANAGEMENT'
                `).all();


                console.log(
                    "Management users:",
                    managers
                );


                // Send notification to each manager

                managers.forEach(manager => {

                    createNotification(
                        manager.id,
                        "✅ Task Completed",
                        `${task.employee_name || "An employee"} completed the task: ${task.title}`,
                        "TASK"
                    );

                });


                console.log(
                    `Task completion notification sent to ${managers.length} management user(s)`
                );

            }


            res.json({
                message:
                    "Task status updated successfully"
            });


        } catch (error) {

            console.error(
                "Task status update error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not update task status"
            });

        }

    }
);

app.get(
    "/api/tasks/:id/history",
    authenticateToken,
    (req, res) => {

        const history = db.prepare(`
            SELECT
                task_history.id,
                task_history.old_status,
                task_history.new_status,
                task_history.changed_at,
                users.name AS changed_by_name
            FROM task_history
            JOIN users
                ON task_history.changed_by = users.id
            WHERE task_history.task_id = ?
            ORDER BY task_history.changed_at DESC
        `).all(req.params.id);

        res.json(history);
    }
);

// ================================
// APPLY LEAVE
// ================================

app.post("/api/leave", (req, res) => {

    const {
        employee_id,
        leave_type,
        from_date,
        to_date,
        reason
    } = req.body;

    if (!employee_id || !from_date || !to_date) {
        return res.status(400).json({
            message: "Required fields are missing"
        });
    }

    const result = db.prepare(`
        INSERT INTO leave_requests
        (employee_id, leave_type, from_date, to_date, reason)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        employee_id,
        leave_type,
        from_date,
        to_date,
        reason || ""
    );

    res.json({
        message: "Leave application submitted",
        leaveId: result.lastInsertRowid
    });
});


// ================================
// EMPLOYEE LEAVE
// ================================

app.get("/api/leave/employee/:id", (req, res) => {

    const leaves = db.prepare(`
        SELECT *
        FROM leave_requests
        WHERE employee_id = ?
        ORDER BY id DESC
    `).all(req.params.id);

    res.json(leaves);
});


// ================================
// ALL LEAVE REQUESTS
// ================================

app.get(
    "/api/leave",
    authenticateToken,
    managementOnly,
    (req, res) => {

    const leaves = db.prepare(`
        SELECT
            leave_requests.*,
            users.name AS employee_name
        FROM leave_requests
        JOIN users
        ON leave_requests.employee_id = users.id
        ORDER BY leave_requests.id DESC
    `).all();

    res.json(leaves);
});


// ================================
// APPROVE / REJECT LEAVE
// ================================

app.put(
    "/api/leave/:id/status",
    authenticateToken,
    managementOnly,
    (req, res) => {

        const { status } = req.body;


        // Validate status

        if (
            !["APPROVED", "REJECTED"].includes(status)
        ) {

            return res.status(400).json({
                message: "Invalid leave status"
            });

        }


        try {

            // ========================================
            // GET LEAVE REQUEST
            // ========================================

            const leave = db.prepare(`
                SELECT
                    leave_requests.*,
                    users.name AS employee_name
                FROM leave_requests
                JOIN users
                    ON leave_requests.employee_id = users.id
                WHERE leave_requests.id = ?
            `).get(req.params.id);


            if (!leave) {

                return res.status(404).json({
                    message:
                        "Leave request not found"
                });

            }


            // ========================================
            // UPDATE LEAVE STATUS
            // ========================================

            db.prepare(`
                UPDATE leave_requests
                SET status = ?
                WHERE id = ?
            `).run(
                status,
                req.params.id
            );


            // ========================================
            // NOTIFY EMPLOYEE
            // ========================================

            const title =
                status === "APPROVED"
                    ? "🗓 Leave Approved"
                    : "❌ Leave Rejected";


            const message =
                status === "APPROVED"
                    ? `Your leave request from ${leave.from_date} to ${leave.to_date} has been approved.`
                    : `Your leave request from ${leave.from_date} to ${leave.to_date} has been rejected.`;


            createNotification(
                leave.employee_id,
                title,
                message,
                "LEAVE"
            );


            // ========================================
            // RESPONSE
            // ========================================

            res.json({

                message:
                    `Leave ${status.toLowerCase()}`

            });


        } catch (error) {

            console.error(
                "Leave status error:",
                error
            );


            res.status(500).json({

                message:
                    "Could not update leave status"

            });

        }

    }
);


// ================================
// MANAGEMENT DASHBOARD
// ================================

app.get(
    "/api/dashboard",
    authenticateToken,
    managementOnly,
    (req, res) => {

    const employees = db.prepare(`
        SELECT COUNT(*) AS count
        FROM users
        WHERE role = 'EMPLOYEE'
    `).get().count;

    const tasks = db.prepare(`
        SELECT COUNT(*) AS count
        FROM tasks
    `).get().count;

    const completed = db.prepare(`
        SELECT COUNT(*) AS count
        FROM tasks
        WHERE status = 'COMPLETED'
    `).get().count;

    const pending = db.prepare(`
        SELECT COUNT(*) AS count
        FROM tasks
        WHERE status = 'PENDING'
    `).get().count;

    const inProgress = db.prepare(`
        SELECT COUNT(*) AS count
        FROM tasks
        WHERE status = 'IN_PROGRESS'
    `).get().count;

    const overdue = db.prepare(`
        SELECT COUNT(*) AS count
        FROM tasks
        WHERE deadline < date('now')
        AND status != 'COMPLETED'
    `).get().count;

    const leaves = db.prepare(`
        SELECT COUNT(*) AS count
        FROM leave_requests
        WHERE status = 'PENDING'
    `).get().count;

    res.json({
        employees,
        tasks,
        completed,
        pending,
        inProgress,
        overdue,
        leaves
    });
});


// Get All employees
app.get(
    "/api/employees",
    authenticateToken,
    managementOnly,
    (req, res) => {

        const employees = db.prepare(`
            SELECT
                id,
                name,
                email,
                department,
                created_at
            FROM users
            WHERE role = 'EMPLOYEE'
            ORDER BY id DESC
        `).all();

        res.json(employees);
    }
);

// Add employee
app.post(
    "/api/employees",
    authenticateToken,
    managementOnly,
    async (req, res) => {

        const {
            name,
            email,
            password,
            department
        } = req.body;

        if (!name || !email || !password || !department) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        try {

            const bcrypt = require("bcryptjs");

            const hashedPassword =
                await bcrypt.hash(password, 10);

            const result = db.prepare(`
                INSERT INTO users
                (name, email, password, role, department)
                VALUES (?, ?, ?, 'EMPLOYEE', ?)
            `).run(
                name,
                email,
                hashedPassword,
                department
            );

            res.status(201).json({
                message: "Employee created successfully",
                employeeId: result.lastInsertRowid
            });

        } catch (error) {

            if (
                error.message.includes("UNIQUE")
            ) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }

            console.error(error);

            res.status(500).json({
                message: "Failed to create employee"
            });
        }
    }
);

// edit employee
app.put(
    "/api/employees/:id",
    authenticateToken,
    managementOnly,
    (req, res) => {

        const employeeId = req.params.id;

        const {
            name,
            email,
            department
        } = req.body;

        if (!name || !email || !department) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const employee = db.prepare(`
            SELECT *
            FROM users
            WHERE id = ?
            AND role = 'EMPLOYEE'
        `).get(employeeId);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        try {

            db.prepare(`
                UPDATE users
                SET
                    name = ?,
                    email = ?,
                    department = ?
                WHERE id = ?
                AND role = 'EMPLOYEE'
            `).run(
                name,
                email,
                department,
                employeeId
            );

            res.json({
                message: "Employee updated successfully"
            });

        } catch (error) {

            if (
                error.message.includes("UNIQUE")
            ) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }

            res.status(500).json({
                message: "Failed to update employee"
            });
        }
    }
);

// Delete employee
app.delete(
    "/api/employees/:id",
    authenticateToken,
    managementOnly,
    (req, res) => {

        const employeeId = req.params.id;

        const employee = db.prepare(`
            SELECT *
            FROM users
            WHERE id = ?
            AND role = 'EMPLOYEE'
        `).get(employeeId);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const tasks = db.prepare(`
            SELECT COUNT(*) AS count
            FROM tasks
            WHERE assigned_to = ?
        `).get(employeeId).count;

        if (tasks > 0) {
            return res.status(400).json({
                message:
                    "Cannot delete employee with assigned tasks"
            });
        }

        db.prepare(`
            DELETE FROM users
            WHERE id = ?
            AND role = 'EMPLOYEE'
        `).run(employeeId);

        res.json({
            message: "Employee deleted successfully"
        });
    }
);

app.get(
    "/api/analytics/employees",
    authenticateToken,
    managementOnly,
    (req, res) => {

        try {

            const employees = db.prepare(`
                SELECT
                    users.id,
                    users.name,
                    users.email,
                    users.department,

                    COUNT(tasks.id) AS assigned,

                    SUM(
                        CASE
                            WHEN tasks.status = 'PENDING'
                            THEN 1
                            ELSE 0
                        END
                    ) AS pending,

                    SUM(
                        CASE
                            WHEN tasks.status = 'IN_PROGRESS'
                            THEN 1
                            ELSE 0
                        END
                    ) AS in_progress,

                    SUM(
                        CASE
                            WHEN tasks.status = 'COMPLETED'
                            THEN 1
                            ELSE 0
                        END
                    ) AS completed

                FROM users

                LEFT JOIN tasks
                    ON users.id = tasks.assigned_to

                WHERE users.role = 'EMPLOYEE'

                GROUP BY users.id

                ORDER BY users.name
            `).all();


            const result = employees.map(employee => {

                const assigned =
                    Number(employee.assigned) || 0;

                const pending =
                    Number(employee.pending) || 0;

                const in_progress =
                    Number(employee.in_progress) || 0;

                const completed =
                    Number(employee.completed) || 0;


                const completionRate =
                    assigned > 0
                        ? Math.round(
                            (completed / assigned) * 100
                        )
                        : 0;


                return {
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                    department: employee.department,
                    assigned,
                    pending,
                    in_progress,
                    completed,
                    completionRate
                };
            });


            console.log(
                "Analytics data:",
                result
            );


            res.json(result);


        } catch (error) {

            console.error(
                "Analytics API error:",
                error
            );

            res.status(500).json({
                message: "Failed to load analytics",
                error: error.message
            });
        }
    }
);

// ========================================
// REPORTS
// ========================================

// 1. Employee-wise task report
app.get(
    "/api/reports/employees",
    authenticateToken,
    managementOnly,
    (req, res) => {

        try {

            const report = db.prepare(`
                SELECT
                    u.id,
                    u.name,
                    u.email,
                    u.department,

                    COUNT(t.id) AS assigned,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.status = 'COMPLETED'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS completed,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.status = 'PENDING'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS pending,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.status = 'IN_PROGRESS'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS in_progress

                FROM users u

                LEFT JOIN tasks t
                    ON u.id = t.assigned_to

                WHERE u.role = 'EMPLOYEE'

                GROUP BY
                    u.id,
                    u.name,
                    u.email,
                    u.department

                ORDER BY u.name
            `).all();


            const result = report.map(employee => {

                const assigned =
                    Number(employee.assigned) || 0;

                const completed =
                    Number(employee.completed) || 0;

                const pending =
                    Number(employee.pending) || 0;

                const inProgress =
                    Number(employee.in_progress) || 0;


                const completionRate =
                    assigned > 0
                        ? Math.round(
                            completed /
                            assigned *
                            100
                        )
                        : 0;


                return {
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                    department: employee.department,

                    assigned,
                    completed,
                    pending,
                    in_progress: inProgress,

                    completionRate
                };
            });


            console.log(
                "Employee report:",
                result
            );


            res.json(result);


        } catch (error) {

            console.error(
                "Employee report error:",
                error
            );


            res.status(500).json({
                message: "Could not generate employee report"
            });
        }
    }
);


// ========================================
// 2. Department-wise workload
// ========================================

app.get(
    "/api/reports/departments",
    authenticateToken,
    managementOnly,
    (req, res) => {

        try {

            const report = db.prepare(`
                SELECT
                    u.department,

                    COUNT(t.id) AS assigned,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.status = 'COMPLETED'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS completed,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.status = 'PENDING'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS pending,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.status = 'IN_PROGRESS'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS in_progress

                FROM users u

                LEFT JOIN tasks t
                    ON u.id = t.assigned_to

                WHERE u.role = 'EMPLOYEE'

                GROUP BY u.department

                ORDER BY assigned DESC
            `).all();


            res.json(
                report.map(row => ({
                    department:
                        row.department || "Unassigned",

                    assigned:
                        Number(row.assigned) || 0,

                    completed:
                        Number(row.completed) || 0,

                    pending:
                        Number(row.pending) || 0,

                    in_progress:
                        Number(row.in_progress) || 0
                }))
            );


        } catch (error) {

            console.error(
                "Department report error:",
                error
            );


            res.status(500).json({
                message:
                    "Could not generate department report"
            });
        }
    }
);


// ========================================
// 3. Monthly task report
// ========================================

app.get(
    "/api/reports/monthly",
    authenticateToken,
    managementOnly,
    (req, res) => {

        try {

            const report = db.prepare(`
                SELECT
                    strftime(
                        '%Y-%m',
                        created_at
                    ) AS month,

                    COUNT(id) AS assigned,

                    SUM(
                        CASE
                            WHEN status = 'COMPLETED'
                            THEN 1
                            ELSE 0
                        END
                    ) AS completed,

                    SUM(
                        CASE
                            WHEN status = 'PENDING'
                            THEN 1
                            ELSE 0
                        END
                    ) AS pending,

                    SUM(
                        CASE
                            WHEN status = 'IN_PROGRESS'
                            THEN 1
                            ELSE 0
                        END
                    ) AS in_progress

                FROM tasks

                GROUP BY
                    strftime(
                        '%Y-%m',
                        created_at
                    )

                ORDER BY month DESC
            `).all();


            res.json(
                report.map(row => ({
                    month:
                        row.month || "Unknown",

                    assigned:
                        Number(row.assigned) || 0,

                    completed:
                        Number(row.completed) || 0,

                    pending:
                        Number(row.pending) || 0,

                    in_progress:
                        Number(row.in_progress) || 0
                }))
            );


        } catch (error) {

            console.error(
                "Monthly report error:",
                error
            );


            res.status(500).json({
                message:
                    "Could not generate monthly report"
            });
        }
    }
);


// ========================================
// 4. Employee leave report
// ========================================

app.get(
    "/api/reports/leaves",
    authenticateToken,
    managementOnly,
    (req, res) => {

        try {

            const report = db.prepare(`
                SELECT
                    u.id,
                    u.name,
                    u.department,

                    COUNT(l.id) AS total_leaves,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN l.status = 'APPROVED'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS approved,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN l.status = 'REJECTED'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS rejected,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN l.status = 'PENDING'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS pending

                FROM users u

                LEFT JOIN leave_requests l
                    ON u.id = l.employee_id

                WHERE u.role = 'EMPLOYEE'

                GROUP BY
                    u.id,
                    u.name,
                    u.department

                ORDER BY u.name
            `).all();


            res.json(
                report.map(row => ({
                    id: row.id,

                    name: row.name,

                    department:
                        row.department || "Unassigned",

                    total_leaves:
                        Number(row.total_leaves) || 0,

                    approved:
                        Number(row.approved) || 0,

                    rejected:
                        Number(row.rejected) || 0,

                    pending:
                        Number(row.pending) || 0
                }))
            );


        } catch (error) {

            console.error(
                "Leave report error:",
                error
            );


            res.status(500).json({
                message:
                    "Could not generate leave report"
            });
        }
    }
);
// ========================================
// EMPLOYEE - TODAY'S ATTENDANCE
// ========================================

app.get(
    "/api/attendance/today",
    authenticateToken,
    async (req, res) => {

        try {

            if (req.user.role !== "EMPLOYEE") {
                return res.status(403).json({
                    message: "Employee access only"
                });
            }

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];

            const attendance = db.prepare(`
                SELECT
                    id,
                    employee_id,
                    attendance_date,
                    status,
                    check_in,
                    check_out,
                    working_hours
                FROM attendance
                WHERE employee_id = ?
                AND attendance_date = ?
            `).get(
                req.user.id,
                today
            );

            res.json(
                attendance || null
            );

        } catch (error) {

            console.error(
                "Today's attendance error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not load attendance"
            });
        }
    }
);


// ========================================
// EMPLOYEE - MARK ATTENDANCE
// ========================================

app.post(
    "/api/attendance/check-in",
    authenticateToken,
    async (req, res) => {

        try {

            if (req.user.role !== "EMPLOYEE") {
                return res.status(403).json({
                    message: "Employee access only"
                });
            }


            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            const existing =
                db.prepare(`
                    SELECT *
                    FROM attendance
                    WHERE employee_id = ?
                    AND attendance_date = ?
                `).get(
                    req.user.id,
                    today
                );


            if (existing) {

                return res.status(400).json({
                    message:
                        "Attendance already marked for today"
                });
            }


            const now =
                new Date().toISOString();


            const result =
                db.prepare(`
                    INSERT INTO attendance (
                        employee_id,
                        attendance_date,
                        status,
                        check_in
                    )
                    VALUES (?, ?, 'PRESENT', ?)
                `).run(
                    req.user.id,
                    today,
                    now
                );


            const attendance =
                db.prepare(`
                    SELECT *
                    FROM attendance
                    WHERE id = ?
                `).get(
                    result.lastInsertRowid
                );


            res.status(201).json({
                message:
                    "Attendance marked successfully",

                attendance
            });


        } catch (error) {

            console.error(
                "Check-in error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not mark attendance"
            });
        }
    }
);


// ========================================
// EMPLOYEE - CHECK OUT
// ========================================

app.put(
    "/api/attendance/check-out",
    authenticateToken,
    async (req, res) => {

        try {

            if (req.user.role !== "EMPLOYEE") {
                return res.status(403).json({
                    message: "Employee access only"
                });
            }


            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            const attendance =
                db.prepare(`
                    SELECT *
                    FROM attendance
                    WHERE employee_id = ?
                    AND attendance_date = ?
                `).get(
                    req.user.id,
                    today
                );


            if (!attendance) {

                return res.status(400).json({
                    message:
                        "Please mark attendance first"
                });
            }


            if (attendance.check_out) {

                return res.status(400).json({
                    message:
                        "You have already checked out"
                });
            }


            const checkOut =
                new Date();


            const checkIn =
                new Date(
                    attendance.check_in
                );


            let workingHours =
                (
                    checkOut.getTime() -
                    checkIn.getTime()
                ) /
                (1000 * 60 * 60);


            workingHours =
                Math.round(
                    workingHours * 100
                ) / 100;


            const checkOutISO =
                checkOut.toISOString();


            db.prepare(`
                UPDATE attendance
                SET
                    check_out = ?,
                    working_hours = ?
                WHERE id = ?
            `).run(
                checkOutISO,
                workingHours,
                attendance.id
            );


            const updated =
                db.prepare(`
                    SELECT *
                    FROM attendance
                    WHERE id = ?
                `).get(
                    attendance.id
                );


            res.json({
                message:
                    "Checked out successfully",

                attendance:
                    updated
            });


        } catch (error) {

            console.error(
                "Check-out error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not check out"
            });
        }
    }
);
// ========================================
// MANAGEMENT - ATTENDANCE REPORT
// ========================================

app.get(
    "/api/attendance/management",
    authenticateToken,
    managementOnly,
    async (req, res) => {

        try {

            const attendance =
                db.prepare(`
                    SELECT
                        a.id,
                        a.employee_id,
                        a.attendance_date,
                        a.status,
                        a.check_in,
                        a.check_out,
                        a.working_hours,

                        u.name AS employee_name,
                        u.email,
                        u.department

                    FROM attendance a

                    INNER JOIN users u
                        ON u.id = a.employee_id

                    WHERE u.role = 'EMPLOYEE'

                    ORDER BY
                        a.attendance_date DESC,
                        u.name ASC
                `).all();


            res.json(attendance);


        } catch (error) {

            console.error(
                "Management attendance error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not load attendance report"
            });
        }
    }
);

// ========================================
// EMPLOYEE - ATTENDANCE HISTORY
// ========================================

app.get(
    "/api/attendance/history",
    authenticateToken,
    async (req, res) => {

        try {

            if (req.user.role !== "EMPLOYEE") {
                return res.status(403).json({
                    message: "Employee access only"
                });
            }


            const history =
                db.prepare(`
                    SELECT *
                    FROM attendance
                    WHERE employee_id = ?
                    ORDER BY attendance_date DESC
                `).all(
                    req.user.id
                );


            res.json(history);


        } catch (error) {

            console.error(
                "Attendance history error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not load attendance history"
            });
        }
    }
);
// ========================================
// CREATE NOTIFICATION HELPER
// ========================================

function createNotification(
    userId,
    title,
    message,
    type = "INFO"
) {

    try {

        db.prepare(`
            INSERT INTO notifications
            (
                user_id,
                title,
                message,
                type
            )
            VALUES (?, ?, ?, ?)
        `).run(
            userId,
            title,
            message,
            type
        );

    } catch (error) {

        console.error(
            "Create notification error:",
            error
        );

    }
}
// ========================================
// NOTIFICATIONS - GET
// ========================================

app.get(
    "/api/notifications",
    authenticateToken,
    (req, res) => {

        try {

            const notifications = db.prepare(`
                SELECT
                    id,
                    user_id,
                    title,
                    message,
                    type,
                    is_read,
                    created_at
                FROM notifications
                WHERE user_id = ?
                ORDER BY id DESC
                LIMIT 50
            `).all(req.user.id);


            res.json(notifications);

        } catch (error) {

            console.error(
                "Notification load error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not load notifications"
            });

        }

    }
);
// ========================================
// NOTIFICATIONS - MARK AS READ
// ========================================

app.put(
    "/api/notifications/:id/read",
    authenticateToken,
    (req, res) => {

        try {

            const notification =
                db.prepare(`
                    SELECT *
                    FROM notifications
                    WHERE id = ?
                    AND user_id = ?
                `).get(
                    req.params.id,
                    req.user.id
                );


            if (!notification) {

                return res.status(404).json({
                    message:
                        "Notification not found"
                });

            }


            db.prepare(`
                UPDATE notifications
                SET is_read = 1
                WHERE id = ?
                AND user_id = ?
            `).run(
                req.params.id,
                req.user.id
            );


            res.json({
                message:
                    "Notification marked as read"
            });

        } catch (error) {

            console.error(
                "Notification read error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not update notification"
            });

        }

    }
);
// ========================================
// NOTIFICATIONS - MARK ALL AS READ
// ========================================

app.put(
    "/api/notifications/read-all",
    authenticateToken,
    (req, res) => {

        try {

            db.prepare(`
                UPDATE notifications
                SET is_read = 1
                WHERE user_id = ?
            `).run(
                req.user.id
            );


            res.json({
                message:
                    "All notifications marked as read"
            });

        } catch (error) {

            console.error(
                "Mark all notifications error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not update notifications"
            });

        }

    }
);
// ================================
// START SERVER
// ================================

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});