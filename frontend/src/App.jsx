import { useEffect, useState } from "react";
import axios from "axios";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

import "./App.css";

const API = "http://localhost:5000/api";

/* ========================================
   AUTH CONFIG
======================================== */

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});


/* ========================================
   CSV EXPORT HELPER
======================================== */

const downloadCSV = (filename, headers, rows) => {

    const csvContent = [

        headers.join(","),

        ...rows.map(row =>
            row
                .map(value =>
                    `"${String(value ?? "").replace(
                        /"/g,
                        '""'
                    )}"`
                )
                .join(",")
        )

    ].join("\n");


    const blob = new Blob(
        [csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = filename;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};


/* ========================================
   APP
======================================== */

function App() {

    // Always show login after browser refresh
    const [user, setUser] = useState(null);


    const handleLogin = (userData, token) => {

        localStorage.setItem("token", token);

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
    };


    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);
    };


    if (!user) {

        return (
            <Login
                setUser={handleLogin}
            />
        );
    }


    if (user.role === "EMPLOYEE") {

        return (
            <EmployeePortal
                user={user}
                logout={logout}
            />
        );
    }


    if (user.role === "MANAGEMENT") {

        return (
            <ManagementPortal
                user={user}
                logout={logout}
            />
        );
    }


    logout();

    return null;
}


/* ========================================
   LOGIN + REGISTRATION
======================================== */

function Login({ setUser }) {

    const [mode, setMode] = useState("login");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [name, setName] = useState("");

    const [department, setDepartment] =
        useState("");

    const [role, setRole] =
        useState("EMPLOYEE");

    const [loading, setLoading] =
        useState(false);


    // ========================================
    // LOGIN
    // ========================================

    const login = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const response = await axios.post(
                `${API}/login`,
                {
                    email,
                    password
                }
            );


            setUser(
                response.data.user,
                response.data.token
            );


        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Invalid email or password"
            );

        } finally {

            setLoading(false);

        }
    };


    // ========================================
    // REGISTER
    // ========================================

    const register = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const response = await axios.post(
                `${API}/register`,
                {
                    name,
                    email,
                    password,
                    department,
                    role
                }
            );


            alert(
                response.data.message ||
                "Registration successful"
            );


            // Clear form

            setName("");

            setEmail("");

            setPassword("");

            setDepartment("");

            setRole("EMPLOYEE");


            // Go back to login

            setMode("login");


        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);

        }
    };


    // ========================================
    // LOGIN PAGE
    // ========================================

    if (mode === "login") {

        return (

            <div className="login-page">

                <form
                    className="login-box"
                    onSubmit={login}
                >

                    <div className="logo">
                        EMP
                    </div>


                    <h1>
                        Employee Management
                    </h1>


                    <p>
                        Workforce Management Portal
                    </p>


                    <label>
                        Email
                    </label>


                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />


                    <label>
                        Password
                    </label>


                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />


                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"
                        }

                    </button>


                    {/* REGISTER LINK */}

                    <div className="auth-switch">

                        <span>
                            Don't have an account?
                        </span>


                        <button
                            type="button"
                            className="link-button"
                            onClick={() =>
                                setMode("register")
                            }
                        >
                            Register
                        </button>

                    </div>


            

                </form>

            </div>

        );
    }


    // ========================================
    // REGISTRATION PAGE
    // ========================================

    return (

        <div className="login-page">

            <form
                className="login-box registration-box"
                onSubmit={register}
            >

                <div className="logo">
                    EMP
                </div>


                <h1>
                    Create Account
                </h1>


                <p>
                    Register for the Workforce Management Portal
                </p>


                {/* ROLE */}

                <label>
                    Register As
                </label>


                <div className="role-selector">

                    <button
                        type="button"
                        className={
                            role === "EMPLOYEE"
                                ? "role-option active"
                                : "role-option"
                        }
                        onClick={() =>
                            setRole("EMPLOYEE")
                        }
                    >
                        👨‍💻 Employee
                    </button>


                    <button
                        type="button"
                        className={
                            role === "MANAGEMENT"
                                ? "role-option active"
                                : "role-option"
                        }
                        onClick={() =>
                            setRole("MANAGEMENT")
                        }
                    >
                        👨‍💼 Management
                    </button>

                </div>


                {/* NAME */}

                <label>
                    Full Name
                </label>


                <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    required
                />


                {/* EMAIL */}

                <label>
                    Email
                </label>


                <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    required
                />


                {/* PASSWORD */}

                <label>
                    Password
                </label>


                <input
                    type="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    minLength={4}
                    required
                />


                {/* DEPARTMENT */}

                <label>
                    Department
                </label>


                <input
                    type="text"
                    placeholder="IT / HR / Finance / Marketing"
                    value={department}
                    onChange={(e) =>
                        setDepartment(e.target.value)
                    }
                    required
                />


                {/* REGISTER */}

                <button
                    type="submit"
                    disabled={loading}
                >

                    {loading
                        ? "Creating Account..."
                        : "Create Account"
                    }

                </button>


                {/* BACK TO LOGIN */}

                <div className="auth-switch">

                    <span>
                        Already have an account?
                    </span>


                    <button
                        type="button"
                        className="link-button"
                        onClick={() =>
                            setMode("login")
                        }
                    >
                        Login
                    </button>

                </div>

            </form>

        </div>

    );
}


/* ========================================
   EMPLOYEE PORTAL
======================================== */

function EmployeePortal({
    user,
    logout
}) {

    const [page, setPage] =
        useState("dashboard");

    return (

        <Layout
            title="Employee Portal"
            user={user}
            page={page}
            setPage={setPage}
            logout={logout}
            employee
        >

            {page === "dashboard" && (
                <EmployeeDashboard
                    user={user}
                />
            )}

            {page === "tasks" && (
                <EmployeeTasks
                    user={user}
                />
            )}

            {page === "attendance" && (
                <EmployeeAttendance
                    user={user}
                />
            )}

            {page === "leave" && (
                <EmployeeLeave
                    user={user}
                />
            )}
            {page === "profile" && (
                <EmployeeProfile
                    user={user}
                />
)}

        </Layout>
    );
}

/* ========================================
   EMPLOYEE DASHBOARD
======================================== */

/* ========================================
   EMPLOYEE DASHBOARD
======================================== */

function EmployeeDashboard({ user }) {

    const [tasks, setTasks] = useState([]);

    const [attendance, setAttendance] = useState(null);

    const [attendanceLoading, setAttendanceLoading] =
        useState(true);

    const [tasksLoading, setTasksLoading] =
        useState(true);

    const [currentTime, setCurrentTime] =
        useState(new Date());


    // ========================================
    // LOAD TASKS
    // ========================================

    const loadTasks = async () => {

        try {

            const response = await axios.get(
                `${API}/tasks/employee/${user.id}`,
                {
                    ...getAuthConfig(),
                    timeout: 5000
                }
            );

            setTasks(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load tasks:",
                error
            );

            // Keep dashboard working
            setTasks([]);

        } finally {

            setTasksLoading(false);

        }
    };


    // ========================================
    // LOAD ATTENDANCE
    // ========================================

    const loadAttendance = async () => {

        try {

            const response = await axios.get(
                `${API}/attendance/today`,
                {
                    ...getAuthConfig(),
                    timeout: 5000
                }
            );

            setAttendance(response.data);

        } catch (error) {

            console.error(
                "Attendance error:",
                error
            );

            setAttendance(null);

        } finally {

            setAttendanceLoading(false);

        }
    };


    // ========================================
    // CHECK IN
    // ========================================

    const markAttendance = async () => {

        try {

            const response = await axios.post(
                `${API}/attendance/check-in`,
                {},
                {
                    ...getAuthConfig(),
                    timeout: 5000
                }
            );

            alert(response.data.message);

            await loadAttendance();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Could not mark attendance"
            );

        }
    };


    // ========================================
    // CHECK OUT
    // ========================================

    const checkOut = async () => {

        try {

            const response = await axios.put(
                `${API}/attendance/check-out`,
                {},
                {
                    ...getAuthConfig(),
                    timeout: 5000
                }
            );

            alert(response.data.message);

            await loadAttendance();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Could not check out"
            );

        }
    };


    // ========================================
    // INITIAL LOAD
    // ========================================

    useEffect(() => {

        loadTasks();

        loadAttendance();

    }, [user.id]);


    // ========================================
    // LIVE WORKING TIME
    // ========================================

    useEffect(() => {

        const timer = setInterval(() => {

            setCurrentTime(
                new Date()
            );

        }, 60000);


        return () => {

            clearInterval(timer);

        };

    }, []);


    // ========================================
    // CALCULATE WORKING TIME
    // ========================================

    const getWorkingTime = () => {

        if (!attendance?.check_in) {

            return "00h 00m";

        }


        const checkIn =
            new Date(
                attendance.check_in
            );


        const endTime =
            attendance.check_out
                ? new Date(
                    attendance.check_out
                )
                : currentTime;


        const difference =
            endTime.getTime() -
            checkIn.getTime();


        if (difference <= 0) {

            return "00h 00m";

        }


        const totalMinutes =
            Math.floor(
                difference /
                (1000 * 60)
            );


        const hours =
            Math.floor(
                totalMinutes / 60
            );


        const minutes =
            totalMinutes % 60;


        return (
            `${String(hours).padStart(2, "0")}h ` +
            `${String(minutes).padStart(2, "0")}m`
        );

    };


    // ========================================
    // TASK COUNTS
    // ========================================

    const completed =
        tasks.filter(
            task =>
                task.status === "COMPLETED"
        ).length;


    const pending =
        tasks.filter(
            task =>
                task.status === "PENDING"
        ).length;


    const inProgress =
        tasks.filter(
            task =>
                task.status === "IN_PROGRESS"
        ).length;


    const onDuty =
        attendance &&
        attendance.check_in &&
        !attendance.check_out;


    // ========================================
    // DASHBOARD
    // ========================================

    return (

        <>

            <PageHeader
                title={`Welcome, ${user.name} 👋`}
                subtitle="Here's your current work overview"
            />


            {/* ==================================
                TODAY'S ATTENDANCE
            ================================== */}

            <div className="panel attendance-panel">

                <div className="attendance-header">

                    <div>

                        <h2>
                            🕘 Today's Attendance
                        </h2>

                        <p className="section-subtitle">
                            Track your work hours
                        </p>

                    </div>


                    <div
                        className={
                            onDuty
                                ? "attendance-indicator on"
                                : "attendance-indicator off"
                        }
                    >

                        {onDuty
                            ? "● ON DUTY"
                            : "● OFF DUTY"
                        }

                    </div>

                </div>


                {attendanceLoading ? (

                    <div className="attendance-content">

                        <div>

                            <div className="attendance-main-status off">
                                Checking status...
                            </div>

                            <p>
                                Loading today's attendance
                            </p>

                        </div>

                    </div>

                ) : !attendance ? (

                    <div className="attendance-content">

                        <div>

                            <div className="attendance-main-status off">
                                🔴 OFF DUTY
                            </div>

                            <p>
                                You haven't checked in yet.
                            </p>

                        </div>


                        <button
                            className="attendance-checkin"
                            onClick={markAttendance}
                        >
                            🟢 CHECK IN
                        </button>

                    </div>

                ) : !attendance.check_out ? (

                    <div className="attendance-content">

                        <div>

                            <div className="attendance-main-status on">
                                🟢 ON DUTY
                            </div>


                            <div className="attendance-details">

                                <span>

                                    Checked in

                                    <strong>

                                        {attendance.check_in
                                            ? new Date(
                                                attendance.check_in
                                            ).toLocaleTimeString()
                                            : "-"
                                        }

                                    </strong>

                                </span>


                                <span>

                                    Working time

                                    <strong className="live-working-time">

                                        {getWorkingTime()}

                                    </strong>

                                </span>

                            </div>

                        </div>


                        <button
                            className="attendance-checkout"
                            onClick={checkOut}
                        >
                            🔴 CHECK OUT
                        </button>

                    </div>

                ) : (

                    <div className="attendance-content">

                        <div>

                            <div className="attendance-main-status off">
                                ⚪ OFF DUTY
                            </div>


                            <div className="attendance-details">

                                <span>

                                    Check-in

                                    <strong>

                                        {new Date(
                                            attendance.check_in
                                        ).toLocaleTimeString()}

                                    </strong>

                                </span>


                                <span>

                                    Check-out

                                    <strong>

                                        {new Date(
                                            attendance.check_out
                                        ).toLocaleTimeString()}

                                    </strong>

                                </span>


                                <span>

                                    Total hours

                                    <strong>

                                        {getWorkingTime()}

                                    </strong>

                                </span>

                            </div>

                        </div>


                        <div className="attendance-completed">

                            ✓ Work completed

                        </div>

                    </div>

                )}

            </div>


            {/* ==================================
                TASK SUMMARY
            ================================== */}

            <div className="cards">

                <Card
                    title="Assigned"
                    value={
                        tasksLoading
                            ? "..."
                            : tasks.length
                    }
                />


                <Card
                    title="Pending"
                    value={
                        tasksLoading
                            ? "..."
                            : pending
                    }
                />


                <Card
                    title="In Progress"
                    value={
                        tasksLoading
                            ? "..."
                            : inProgress
                    }
                />


                <Card
                    title="Completed"
                    value={
                        tasksLoading
                            ? "..."
                            : completed
                    }
                />

            </div>


            {/* ==================================
                RECENT TASKS
            ================================== */}

            <div className="panel">

                <div className="section-heading">

                    <div>

                        <h2>
                            Recent Tasks
                        </h2>

                        <p className="section-subtitle">
                            Your assigned work
                        </p>

                    </div>

                </div>


                {tasksLoading ? (

                    <p className="empty">
                        Loading tasks...
                    </p>

                ) : tasks.length === 0 ? (

                    <p className="empty">
                        No tasks assigned yet.
                    </p>

                ) : (

                    <TaskTable
                        tasks={tasks}
                    />

                )}

            </div>

        </>
    );
}
/* ========================================
   EMPLOYEE TASKS
======================================== */

function EmployeeTasks({ user }) {

    const [tasks, setTasks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    const loadTasks = async () => {

        try {

            const response =
                await axios.get(
                    `${API}/tasks/employee/${user.id}`,
                    getAuthConfig()
                );

            setTasks(response.data);

        } catch (error) {

            console.error(
                "Failed to load tasks:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadTasks();

    }, [user.id]);


    const updateStatus =
        async (id, status) => {

            try {

                await axios.put(
                    `${API}/tasks/${id}/status`,
                    {
                        status
                    },
                    getAuthConfig()
                );

                await loadTasks();

            } catch (error) {

                alert(
                    error.response?.data?.message ||
                    "Could not update task"
                );
            }
        };


    return (

        <>

            <PageHeader
                title="My Tasks"
                subtitle="View and update your assigned work"
            />


            <div className="panel">

                {loading ? (

                    <p>
                        Loading tasks...
                    </p>

                ) : (

                    <TaskTable
                        tasks={tasks}
                        updateStatus={updateStatus}
                    />

                )}

            </div>

        </>
    );
}


/* ========================================
   EMPLOYEE LEAVE
======================================== */

function EmployeeLeave({ user }) {

    const [leaves, setLeaves] =
        useState([]);

    const [form, setForm] =
        useState({
            leave_type: "Casual Leave",
            from_date: "",
            to_date: "",
            reason: ""
        });

    const [loading, setLoading] =
        useState(false);


    const loadLeaves = async () => {

        try {

            const response =
                await axios.get(
                    `${API}/leave/employee/${user.id}`,
                    getAuthConfig()
                );

            setLeaves(response.data);

        } catch (error) {

            console.error(
                "Failed to load leaves:",
                error
            );
        }
    };


    useEffect(() => {

        loadLeaves();

    }, [user.id]);


    const submitLeave =
        async (e) => {

            e.preventDefault();

            setLoading(true);

            try {

                await axios.post(
                    `${API}/leave`,
                    {
                        employee_id: user.id,
                        ...form
                    },
                    getAuthConfig()
                );


                alert(
                    "Leave application submitted"
                );


                setForm({
                    leave_type: "Casual Leave",
                    from_date: "",
                    to_date: "",
                    reason: ""
                });


                loadLeaves();

            } catch (error) {

                alert(
                    error.response?.data?.message ||
                    "Could not submit leave"
                );

            } finally {

                setLoading(false);
            }
        };


    return (

        <>

            <PageHeader
                title="Leave Management"
                subtitle="Apply for leave and track requests"
            />


            <div className="two-column">


                <div className="panel">

                    <h2>
                        Apply for Leave
                    </h2>


                    <form
                        onSubmit={submitLeave}
                    >

                        <label>
                            Leave Type
                        </label>


                        <select
                            value={form.leave_type}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    leave_type:
                                        e.target.value
                                })
                            }
                        >

                            <option>
                                Casual Leave
                            </option>

                            <option>
                                Sick Leave
                            </option>

                            <option>
                                Emergency Leave
                            </option>

                        </select>


                        <label>
                            From Date
                        </label>


                        <input
                            type="date"
                            value={form.from_date}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    from_date:
                                        e.target.value
                                })
                            }
                            required
                        />


                        <label>
                            To Date
                        </label>


                        <input
                            type="date"
                            value={form.to_date}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    to_date:
                                        e.target.value
                                })
                            }
                            required
                        />


                        <label>
                            Reason
                        </label>


                        <textarea
                            placeholder="Reason for leave"
                            value={form.reason}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    reason:
                                        e.target.value
                                })
                            }
                        />


                        <button
                            type="submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Submitting..."
                                : "Submit Leave"
                            }

                        </button>

                    </form>

                </div>


                <div className="panel">

                    <h2>
                        Leave History
                    </h2>


                    {leaves.length === 0 ? (

                        <p className="empty">
                            No leave applications yet.
                        </p>

                    ) : (

                        leaves.map(leave => (

                            <div
                                className="leave-item"
                                key={leave.id}
                            >

                                <div>

                                    <strong>
                                        {leave.leave_type}
                                    </strong>


                                    <p>
                                        {leave.from_date}
                                        {" → "}
                                        {leave.to_date}
                                    </p>

                                </div>


                                <Status
                                    value={leave.status}
                                />

                            </div>

                        ))

                    )}

                </div>

            </div>

        </>
    );
}
/* ========================================
   EMPLOYEE PROFILE
======================================== */

function EmployeeProfile({ user }) {

    const [profile, setProfile] =
        useState(user);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [editing, setEditing] =
        useState(false);


    const [form, setForm] = useState({

        name: user.name || "",

        email: user.email || "",

        department:
            user.department || ""

    });


    // ========================================
    // LOAD PROFILE
    // ========================================

    const loadProfile = async () => {

        try {

            const response =
                await axios.get(
                    `${API}/profile`,
                    getAuthConfig()
                );


            setProfile(
                response.data
            );


            setForm({

                name:
                    response.data.name || "",

                email:
                    response.data.email || "",

                department:
                    response.data.department || ""

            });


        } catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadProfile();

    }, []);


    // ========================================
    // UPDATE PROFILE
    // ========================================

    const updateProfile =
        async (e) => {

            e.preventDefault();

            setSaving(true);

            try {

                const response =
                    await axios.put(
                        `${API}/profile`,
                        {
                            name:
                                form.name,

                            email:
                                form.email,

                            department:
                                form.department
                        },
                        getAuthConfig()
                    );


                const updatedUser =
                    response.data.user ||
                    response.data;


                setProfile(
                    updatedUser
                );


                // Update local user data

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        updatedUser
                    )
                );


                setEditing(false);


                alert(
                    "Profile updated successfully"
                );


            } catch (error) {

                alert(
                    error.response?.data?.message ||
                    "Could not update profile"
                );

            } finally {

                setSaving(false);

            }
        };


    if (loading) {

        return (

            <>

                <PageHeader
                    title="My Profile"
                    subtitle="View and update your profile"
                />


                <div className="panel">

                    <p className="empty">
                        Loading profile...
                    </p>

                </div>

            </>

        );
    }


    return (

        <>

            <PageHeader
                title="My Profile"
                subtitle="View and update your personal information"
            />


            <div className="profile-layout">

                {/* PROFILE CARD */}

                <div className="panel profile-card">

                    <div className="profile-avatar">

                        {(
                            profile.name ||
                            "U"
                        ).charAt(0).toUpperCase()}

                    </div>


                    <h2>
                        {profile.name}
                    </h2>


                    <p>
                        {profile.email}
                    </p>


                    <span className="profile-role">

                        {profile.role === "MANAGEMENT"
                            ? "Management"
                            : "Employee"
                        }

                    </span>

                </div>


                {/* PROFILE DETAILS */}

                <div className="panel">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Profile Information
                            </h2>

                            <p className="section-subtitle">
                                Manage your account details
                            </p>

                        </div>


                        {!editing && (

                            <button
                                type="button"
                                onClick={() =>
                                    setEditing(true)
                                }
                            >
                                ✏️ Edit Profile
                            </button>

                        )}

                    </div>


                    {!editing ? (

                        <div className="profile-details">

                            <div className="profile-detail">

                                <span>
                                    Full Name
                                </span>

                                <strong>
                                    {profile.name || "-"}
                                </strong>

                            </div>


                            <div className="profile-detail">

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {profile.email || "-"}
                                </strong>

                            </div>


                            <div className="profile-detail">

                                <span>
                                    Department
                                </span>

                                <strong>
                                    {profile.department || "-"}
                                </strong>

                            </div>


                            <div className="profile-detail">

                                <span>
                                    Role
                                </span>

                                <strong>
                                    {profile.role === "MANAGEMENT"
                                        ? "Management"
                                        : "Employee"
                                    }
                                </strong>

                            </div>

                        </div>

                    ) : (

                        <form
                            onSubmit={updateProfile}
                        >

                            <label>
                                Full Name
                            </label>


                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        name:
                                            e.target.value
                                    })
                                }
                                required
                            />


                            <label>
                                Email
                            </label>


                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        email:
                                            e.target.value
                                    })
                                }
                                required
                            />


                            <label>
                                Department
                            </label>


                            <input
                                type="text"
                                value={form.department}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        department:
                                            e.target.value
                                    })
                                }
                            />


                            <div className="profile-actions">

                                <button
                                    type="submit"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"
                                    }

                                </button>


                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => {

                                        setForm({

                                            name:
                                                profile.name ||
                                                "",

                                            email:
                                                profile.email ||
                                                "",

                                            department:
                                                profile.department ||
                                                ""

                                        });

                                        setEditing(false);

                                    }}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    )}

                </div>

            </div>

        </>
    );
}


/* ========================================
   EMPLOYEE MANAGEMENT
======================================== */

function EmployeesPage() {

    const [employees, setEmployees] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [showForm, setShowForm] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        department: ""
    });


    const loadEmployees = async () => {

        setLoading(true);

        try {

            const response =
                await axios.get(
                    `${API}/employees`,
                    getAuthConfig()
                );

            setEmployees(response.data);

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Could not load employees"
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadEmployees();

    }, []);


    const resetForm = () => {

        setForm({
            name: "",
            email: "",
            password: "",
            department: ""
        });

        setEditingId(null);

        setShowForm(false);
    };


    const saveEmployee =
        async (e) => {

            e.preventDefault();

            try {

                if (editingId) {

                    await axios.put(
                        `${API}/employees/${editingId}`,
                        {
                            name: form.name,
                            email: form.email,
                            department:
                                form.department
                        },
                        getAuthConfig()
                    );

                    alert(
                        "Employee updated successfully"
                    );

                } else {

                    await axios.post(
                        `${API}/employees`,
                        form,
                        getAuthConfig()
                    );

                    alert(
                        "Employee created successfully"
                    );
                }


                resetForm();

                loadEmployees();

            } catch (error) {

                alert(
                    error.response?.data?.message ||
                    "Could not save employee"
                );
            }
        };


    const editEmployee =
        (employee) => {

            setForm({
                name: employee.name,
                email: employee.email,
                password: "",
                department:
                    employee.department || ""
            });

            setEditingId(employee.id);

            setShowForm(true);
        };


    const deleteEmployee =
        async (id) => {

            const confirmDelete =
                window.confirm(
                    "Delete this employee?"
                );

            if (!confirmDelete) {
                return;
            }

            try {

                await axios.delete(
                    `${API}/employees/${id}`,
                    getAuthConfig()
                );

                alert(
                    "Employee deleted successfully"
                );

                loadEmployees();

            } catch (error) {

                alert(
                    error.response?.data?.message ||
                    "Could not delete employee"
                );
            }
        };


    return (

        <>

            <PageHeader
                title="Employee Management"
                subtitle="Manage employees and their details"
            />


            <div className="panel">

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}
                >

                    <div>

                        <h2>
                            Employees
                        </h2>

                        <p>
                            Total employees:
                            {" "}
                            {employees.length}
                        </p>

                    </div>


                    <button
                        onClick={() => {

                            if (showForm) {
                                resetForm();
                            } else {
                                setShowForm(true);
                            }

                        }}
                    >
                        {showForm
                            ? "Cancel"
                            : "+ Add Employee"
                        }
                    </button>

                </div>


                {showForm && (

                    <div
                        className="panel"
                        style={{
                            background: "#f8fafc"
                        }}
                    >

                        <h2>
                            {editingId
                                ? "Edit Employee"
                                : "Add Employee"
                            }
                        </h2>


                        <form
                            onSubmit={saveEmployee}
                        >

                            <label>
                                Full Name
                            </label>

                            <input
                                value={form.name}
                                placeholder="Employee name"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        name:
                                            e.target.value
                                    })
                                }
                                required
                            />


                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                value={form.email}
                                placeholder="employee@example.com"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        email:
                                            e.target.value
                                    })
                                }
                                required
                            />


                            {!editingId && (

                                <>
                                    <label>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        value={form.password}
                                        placeholder="Password"
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                password:
                                                    e.target.value
                                            })
                                        }
                                        required
                                    />
                                </>

                            )}


                            <label>
                                Department
                            </label>

                            <input
                                value={form.department}
                                placeholder="IT / HR / Finance"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        department:
                                            e.target.value
                                    })
                                }
                                required
                            />


                            <button type="submit">

                                {editingId
                                    ? "Update Employee"
                                    : "Create Employee"
                                }

                            </button>

                        </form>

                    </div>

                )}


                {loading ? (

                    <p>
                        Loading employees...
                    </p>

                ) : employees.length === 0 ? (

                    <p className="empty">
                        No employees found.
                    </p>

                ) : (

                    <div className="table-scroll">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {employees.map(
                                    employee => (

                                        <tr
                                            key={employee.id}
                                        >

                                            <td>

                                                <strong>
                                                    {employee.name}
                                                </strong>

                                            </td>


                                            <td>
                                                {employee.email}
                                            </td>


                                            <td>
                                                {employee.department}
                                            </td>


                                            <td>

                                                <div
                                                    className="actions"
                                                >

                                                    <button
                                                        onClick={() =>
                                                            editEmployee(
                                                                employee
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        className="reject"
                                                        onClick={() =>
                                                            deleteEmployee(
                                                                employee.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </>
    );
}

/* ========================================
   EMPLOYEE ANALYTICS
======================================== */

function EmployeeAnalytics() {

    const [employees, setEmployees] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ========================================
    // LOAD ANALYTICS
    // ========================================

    const loadAnalytics = async () => {

        setLoading(true);
        setError("");

        try {

            const response =
                await axios.get(
                    `${API}/analytics/employees`,
                    getAuthConfig()
                );


            console.log(
                "Analytics data:",
                response.data
            );


            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            // Make sure values are numbers

            const formattedData =
                data.map(employee => ({

                    ...employee,

                    assigned:
                        Number(employee.assigned) || 0,

                    completed:
                        Number(employee.completed) || 0,

                    pending:
                        Number(employee.pending) || 0,

                    in_progress:
                        Number(employee.in_progress) || 0

                }));


            setEmployees(
                formattedData
            );


        } catch (err) {

            console.error(
                "Analytics error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Could not load analytics data"
            );


        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadAnalytics();

    }, []);


    // ========================================
    // LOADING
    // ========================================

    if (loading) {

        return (

            <>

                <PageHeader
                    title="Employee Analytics"
                    subtitle="Workload and performance overview"
                />


                <div className="panel analytics-message">

                    Loading analytics...

                </div>

            </>

        );
    }


    // ========================================
    // ERROR
    // ========================================

    if (error) {

        return (

            <>

                <PageHeader
                    title="Employee Analytics"
                    subtitle="Workload and performance overview"
                />


                <div className="panel analytics-message">

                    <strong>
                        Unable to load analytics
                    </strong>


                    <p>
                        {error}
                    </p>


                    <button
                        onClick={loadAnalytics}
                    >
                        Try Again
                    </button>

                </div>

            </>

        );
    }


    // ========================================
    // NO DATA
    // ========================================

    if (employees.length === 0) {

        return (

            <>

                <PageHeader
                    title="Employee Analytics"
                    subtitle="Workload and performance overview"
                />


                <div className="panel analytics-message">

                    <div className="analytics-empty-icon">
                        📊
                    </div>


                    <strong>
                        No employee task data available
                    </strong>


                    <p>
                        Assign tasks to employees to see
                        analytics here.
                    </p>

                </div>

            </>

        );
    }


    // ========================================
    // FIND MAX VALUE
    // ========================================

    const maxTasks =
        Math.max(
            ...employees.map(
                employee =>
                    Math.max(
                        employee.assigned,
                        employee.completed,
                        employee.pending,
                        employee.in_progress
                    )
            ),
            1
        );


    return (

        <>

            <PageHeader
                title="Employee Analytics"
                subtitle="Workload and performance overview"
            />


            {/* ==================================
                TASK PERFORMANCE CHART
            ================================== */}

            <div className="panel analytics-panel">

                <div className="analytics-header">

                    <div>

                        <h2>
                            Employee Task Performance
                        </h2>

                        <p>
                            Task distribution by employee
                        </p>

                    </div>


                    <button
                        className="analytics-refresh"
                        onClick={loadAnalytics}
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* LEGEND */}

                <div className="analytics-legend">

                    <span>
                        <i className="legend assigned"></i>
                        Assigned
                    </span>


                    <span>
                        <i className="legend completed"></i>
                        Completed
                    </span>


                    <span>
                        <i className="legend progress"></i>
                        In Progress
                    </span>


                    <span>
                        <i className="legend pending"></i>
                        Pending
                    </span>

                </div>


                {/* ==================================
                    CHART
                ================================== */}

                <div className="employee-chart">

                    {/* Y AXIS */}

                    <div className="chart-y-axis">

                        <span>
                            {maxTasks}
                        </span>

                        <span>
                            {Math.round(
                                maxTasks * 0.75
                            )}
                        </span>

                        <span>
                            {Math.round(
                                maxTasks * 0.5
                            )}
                        </span>

                        <span>
                            {Math.round(
                                maxTasks * 0.25
                            )}
                        </span>

                        <span>
                            0
                        </span>

                    </div>


                    {/* CHART AREA */}

                    <div className="chart-area">

                        {/* GRID */}

                        <div className="chart-grid">

                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>

                        </div>


                        {/* EMPLOYEES */}

                        <div className="employee-bars">

                            {employees.map(
                                employee => (

                                    <div
                                        className="employee-bar-group"
                                        key={employee.id}
                                    >

                                        <div className="bars">

                                            {/* ASSIGNED */}

                                            <div
                                                className="bar assigned"
                                                style={{
                                                    height:
                                                        `${Math.max(
                                                            4,
                                                            (
                                                                employee.assigned /
                                                                maxTasks
                                                            ) * 100
                                                        )}%`
                                                }}
                                                title={
                                                    `Assigned: ${employee.assigned}`
                                                }
                                            >

                                                {employee.assigned > 0 && (
                                                    <span>
                                                        {employee.assigned}
                                                    </span>
                                                )}

                                            </div>


                                            {/* COMPLETED */}

                                            <div
                                                className="bar completed"
                                                style={{
                                                    height:
                                                        `${Math.max(
                                                            4,
                                                            (
                                                                employee.completed /
                                                                maxTasks
                                                            ) * 100
                                                        )}%`
                                                }}
                                                title={
                                                    `Completed: ${employee.completed}`
                                                }
                                            >

                                                {employee.completed > 0 && (
                                                    <span>
                                                        {employee.completed}
                                                    </span>
                                                )}

                                            </div>


                                            {/* IN PROGRESS */}

                                            <div
                                                className="bar progress"
                                                style={{
                                                    height:
                                                        `${Math.max(
                                                            4,
                                                            (
                                                                employee.in_progress /
                                                                maxTasks
                                                            ) * 100
                                                        )}%`
                                                }}
                                                title={
                                                    `In Progress: ${employee.in_progress}`
                                                }
                                            >

                                                {employee.in_progress > 0 && (
                                                    <span>
                                                        {employee.in_progress}
                                                    </span>
                                                )}

                                            </div>


                                            {/* PENDING */}

                                            <div
                                                className="bar pending"
                                                style={{
                                                    height:
                                                        `${Math.max(
                                                            4,
                                                            (
                                                                employee.pending /
                                                                maxTasks
                                                            ) * 100
                                                        )}%`
                                                }}
                                                title={
                                                    `Pending: ${employee.pending}`
                                                }
                                            >

                                                {employee.pending > 0 && (
                                                    <span>
                                                        {employee.pending}
                                                    </span>
                                                )}

                                            </div>

                                        </div>


                                        {/* EMPLOYEE NAME */}

                                        <div className="employee-name">

                                            {employee.name}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================
                EMPLOYEE WORKLOAD
            ================================== */}

            <div className="panel analytics-panel">

                <div className="analytics-header">

                    <div>

                        <h2>
                            Employee Workload
                        </h2>

                        <p>
                            Detailed task performance
                        </p>

                    </div>

                </div>


                <div className="table-scroll">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Employee
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Assigned
                                </th>

                                <th>
                                    Completed
                                </th>

                                <th>
                                    In Progress
                                </th>

                                <th>
                                    Pending
                                </th>

                                <th>
                                    Completion
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {employees.map(
                                employee => (

                                    <tr
                                        key={employee.id}
                                    >

                                        <td>

                                            <strong>
                                                {employee.name}
                                            </strong>

                                            <small>
                                                {employee.email}
                                            </small>

                                        </td>


                                        <td>
                                            {
                                                employee.department ||
                                                "-"
                                            }
                                        </td>


                                        <td>
                                            {employee.assigned}
                                        </td>


                                        <td>
                                            {employee.completed}
                                        </td>


                                        <td>
                                            {employee.in_progress}
                                        </td>


                                        <td>
                                            {employee.pending}
                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    employee.completionRate >= 75
                                                        ? "rate-good"
                                                        : employee.completionRate >= 50
                                                            ? "rate-medium"
                                                            : "rate-low"
                                                }
                                            >
                                                {
                                                    employee.completionRate
                                                }%
                                            </span>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </>

    );
}
/* ========================================
   MANAGEMENT PORTAL
======================================== */

function ManagementPortal({
    user,
    logout
}) {

    const [page, setPage] =
        useState("dashboard");


    return (

        <Layout
            title="Management Portal"
            user={user}
            page={page}
            setPage={setPage}
            logout={logout}
        >

            {page === "dashboard" && (
                <ManagementDashboard />
            )}


            {page === "employees" && (
                <EmployeesPage />
            )}


            {page === "tasks" && (
                <ManagementTasks
                    user={user}
                />
            )}


            {page === "analytics" && (
                <EmployeeAnalytics />
            )}


            {page === "reports" && (
                <ReportsPage />
            )}
            {page === "attendance" && (
                <ManagementAttendance />
            )}


            {page === "leave" && (
                <ManagementLeave />
            )}

        </Layout>
    );
}


/* ========================================
   MANAGEMENT DASHBOARD
======================================== */

function ManagementDashboard() {

    const [data, setData] =
        useState({});


    useEffect(() => {

        axios
            .get(
                `${API}/dashboard`,
                getAuthConfig()
            )
            .then(res =>
                setData(res.data)
            )
            .catch(error =>
                console.error(
                    "Dashboard error:",
                    error
                )
            );

    }, []);


    return (

        <>

            <PageHeader
                title="Management Dashboard"
                subtitle="Workforce overview and task performance"
            />


            <div className="cards">

                <Card
                    title="Employees"
                    value={data.employees || 0}
                />


                <Card
                    title="Total Tasks"
                    value={data.tasks || 0}
                />


                <Card
                    title="Completed"
                    value={data.completed || 0}
                />


                <Card
                    title="Pending"
                    value={data.pending || 0}
                />


                <Card
                    title="In Progress"
                    value={data.inProgress || 0}
                />


                <Card
                    title="Overdue"
                    value={data.overdue || 0}
                />


                <Card
                    title="Pending Leaves"
                    value={data.leaves || 0}
                />

            </div>


            <div className="panel">

                <h2>
                    System Overview
                </h2>


                <div className="overview">

                    <div>

                        <span>
                            Task Completion Rate
                        </span>


                        <strong>

                            {data.tasks

                                ? Math.round(
                                    data.completed /
                                    data.tasks *
                                    100
                                )

                                : 0

                            }%

                        </strong>

                    </div>


                    <div>

                        <span>
                            Pending Tasks
                        </span>

                        <strong>
                            {data.pending || 0}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Overdue Tasks
                        </span>

                        <strong>
                            {data.overdue || 0}
                        </strong>

                    </div>

                </div>

            </div>

        </>
    );
}


/* ========================================
   MANAGEMENT TASKS
======================================== */

function ManagementTasks({ user }) {

    const [employees, setEmployees] =
        useState([]);

    const [tasks, setTasks] =
        useState([]);

    const [form, setForm] =
        useState({
            title: "",
            description: "",
            priority: "MEDIUM",
            deadline: "",
            assigned_to: ""
        });

    const [loading, setLoading] =
        useState(false);


    const loadData = async () => {

        try {

            const employeeResponse =
                await axios.get(
                    `${API}/employees`,
                    getAuthConfig()
                );


            const taskResponse =
                await axios.get(
                    `${API}/tasks`,
                    getAuthConfig()
                );


            setEmployees(
                employeeResponse.data
            );


            setTasks(
                taskResponse.data
            );

        } catch (error) {

            console.error(
                "Failed to load management data:",
                error
            );
        }
    };


    useEffect(() => {

        loadData();

    }, []);


    const createTask =
        async (e) => {

            e.preventDefault();

            setLoading(true);

            try {

                await axios.post(
                    `${API}/tasks`,
                    {
                        ...form,
                        created_by: user.id
                    },
                    getAuthConfig()
                );


                alert(
                    "Task assigned successfully"
                );


                setForm({
                    title: "",
                    description: "",
                    priority: "MEDIUM",
                    deadline: "",
                    assigned_to: ""
                });


                loadData();

            } catch (error) {

                alert(
                    error.response?.data?.message ||
                    "Could not create task"
                );

            } finally {

                setLoading(false);
            }
        };


    return (

        <>

            <PageHeader
                title="Task Management"
                subtitle="Create and assign work to employees"
            />


            <div className="two-column">


                <div className="panel">

                    <h2>
                        Assign New Task
                    </h2>


                    <form
                        onSubmit={createTask}
                    >

                        <label>
                            Task Title
                        </label>


                        <input
                            placeholder="e.g. Build Login Page"
                            value={form.title}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    title:
                                        e.target.value
                                })
                            }
                            required
                        />


                        <label>
                            Description
                        </label>


                        <textarea
                            placeholder="Describe the task"
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description:
                                        e.target.value
                                })
                            }
                        />


                        <label>
                            Assign Employee
                        </label>


                        <select
                            value={form.assigned_to}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    assigned_to:
                                        e.target.value
                                })
                            }
                            required
                        >

                            <option value="">
                                Select employee
                            </option>


                            {employees.map(
                                employee => (

                                    <option
                                        key={employee.id}
                                        value={employee.id}
                                    >
                                        {employee.name}
                                    </option>

                                )
                            )}

                        </select>


                        <label>
                            Priority
                        </label>


                        <select
                            value={form.priority}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    priority:
                                        e.target.value
                                })
                            }
                        >

                            <option value="LOW">
                                Low
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="HIGH">
                                High
                            </option>

                        </select>


                        <label>
                            Deadline
                        </label>


                        <input
                            type="date"
                            value={form.deadline}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    deadline:
                                        e.target.value
                                })
                            }
                            required
                        />


                        <button
                            type="submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Assigning..."
                                : "Assign Task"
                            }

                        </button>

                    </form>

                </div>


                <div className="panel">

                    <h2>
                        All Tasks
                    </h2>


                    <TaskTable
                        tasks={tasks}
                    />

                </div>

            </div>

        </>
    );
}


/* ========================================
   REPORTS
======================================== */

function ReportsPage() {

    const [employeeReport, setEmployeeReport] =
        useState([]);

    const [departmentReport, setDepartmentReport] =
        useState([]);

    const [monthlyReport, setMonthlyReport] =
        useState([]);

    const [leaveReport, setLeaveReport] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /* ====================================
       LOAD REPORTS
    ==================================== */

    const loadReports = async () => {

        setLoading(true);

        setError("");

        try {

            const [
                employees,
                departments,
                monthly,
                leaves
            ] = await Promise.all([

                axios.get(
                    `${API}/reports/employees`,
                    getAuthConfig()
                ),

                axios.get(
                    `${API}/reports/departments`,
                    getAuthConfig()
                ),

                axios.get(
                    `${API}/reports/monthly`,
                    getAuthConfig()
                ),

                axios.get(
                    `${API}/reports/leaves`,
                    getAuthConfig()
                )

            ]);


            console.log(
                "Employee Report:",
                employees.data
            );


            console.log(
                "Department Report:",
                departments.data
            );


            console.log(
                "Monthly Report:",
                monthly.data
            );


            console.log(
                "Leave Report:",
                leaves.data
            );


            setEmployeeReport(
                Array.isArray(employees.data)
                    ? employees.data
                    : []
            );


            setDepartmentReport(
                Array.isArray(departments.data)
                    ? departments.data
                    : []
            );


            setMonthlyReport(
                Array.isArray(monthly.data)
                    ? monthly.data
                    : []
            );


            setLeaveReport(
                Array.isArray(leaves.data)
                    ? leaves.data
                    : []
            );


        } catch (error) {

            console.error(
                "Reports error:",
                error.response?.data || error
            );


            setError(
                error.response?.data?.message ||
                "Could not load reports"
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadReports();

    }, []);


    /* ====================================
       SUMMARY CALCULATIONS
    ==================================== */

    const totalEmployees =
        employeeReport.length;


    const totalTasks =
        employeeReport.reduce(
            (sum, employee) =>
                sum +
                Number(employee.assigned || 0),
            0
        );


    const totalCompleted =
        employeeReport.reduce(
            (sum, employee) =>
                sum +
                Number(employee.completed || 0),
            0
        );


    const totalPending =
        employeeReport.reduce(
            (sum, employee) =>
                sum +
                Number(employee.pending || 0),
            0
        );


    const totalInProgress =
        employeeReport.reduce(
            (sum, employee) =>
                sum +
                Number(employee.in_progress || 0),
            0
        );


    const totalApprovedLeaves =
        leaveReport.reduce(
            (sum, employee) =>
                sum +
                Number(employee.approved || 0),
            0
        );


    const totalPendingLeaves =
        leaveReport.reduce(
            (sum, employee) =>
                sum +
                Number(employee.pending || 0),
            0
        );


    const totalRejectedLeaves =
        leaveReport.reduce(
            (sum, employee) =>
                sum +
                Number(employee.rejected || 0),
            0
        );


    const totalLeaveRequests =
        leaveReport.reduce(
            (sum, employee) =>
                sum +
                Number(employee.total_leaves || 0),
            0
        );


    const employeesWithLeave =
        leaveReport.filter(
            employee =>
                Number(employee.total_leaves || 0) > 0
        ).length;


    const employeesWithoutLeave =
        Math.max(
            totalEmployees -
            employeesWithLeave,
            0
        );


    const overallCompletion =
        totalTasks > 0
            ? Math.round(
                (
                    totalCompleted /
                    totalTasks
                ) *
                100
            )
            : 0;


    /* ====================================
       EXPORT EMPLOYEE CSV
    ==================================== */

    const exportEmployeeCSV = () => {

        const headers = [
            "Employee",
            "Email",
            "Department",
            "Assigned",
            "Completed",
            "Pending",
            "In Progress",
            "Completion Rate"
        ];


        const rows =
            employeeReport.map(
                employee => [

                    employee.name,

                    employee.email,

                    employee.department,

                    employee.assigned,

                    employee.completed,

                    employee.pending,

                    employee.in_progress,

                    `${employee.completionRate}%`

                ]
            );


        downloadCSV(
            "employee-task-report.csv",
            headers,
            rows
        );
    };


    /* ====================================
       EXPORT DEPARTMENT CSV
    ==================================== */

    const exportDepartmentCSV = () => {

        const headers = [
            "Department",
            "Assigned",
            "Completed",
            "Pending",
            "In Progress"
        ];


        const rows =
            departmentReport.map(
                department => [

                    department.department,

                    department.assigned,

                    department.completed,

                    department.pending,

                    department.in_progress

                ]
            );


        downloadCSV(
            "department-workload-report.csv",
            headers,
            rows
        );
    };


    /* ====================================
       EXPORT MONTHLY CSV
    ==================================== */

    const exportMonthlyCSV = () => {

        const headers = [
            "Month",
            "Assigned",
            "Completed",
            "Pending",
            "In Progress"
        ];


        const rows =
            monthlyReport.map(
                month => [

                    month.month,

                    month.assigned,

                    month.completed,

                    month.pending,

                    month.in_progress

                ]
            );


        downloadCSV(
            "monthly-task-report.csv",
            headers,
            rows
        );
    };


    /* ====================================
       EXPORT LEAVE CSV
    ==================================== */

    const exportLeaveCSV = () => {

        const headers = [
            "Employee",
            "Department",
            "Total Leaves",
            "Approved",
            "Pending",
            "Rejected"
        ];


        const rows =
            leaveReport.map(
                employee => [

                    employee.name,

                    employee.department,

                    employee.total_leaves,

                    employee.approved,

                    employee.pending,

                    employee.rejected

                ]
            );


        downloadCSV(
            "employee-leave-report.csv",
            headers,
            rows
        );
    };


    /* ====================================
       EXPORT ALL REPORTS
    ==================================== */

    const exportAllCSV = () => {

        let csv = "";


        csv +=
            "EMPLOYEE TASK REPORT\n";


        csv +=
            "Employee,Email,Department,Assigned,Completed,Pending,In Progress,Completion Rate\n";


        employeeReport.forEach(
            employee => {

                csv += [

                    employee.name,

                    employee.email,

                    employee.department,

                    employee.assigned,

                    employee.completed,

                    employee.pending,

                    employee.in_progress,

                    `${employee.completionRate}%`

                ]
                    .map(value =>
                        `"${String(value ?? "").replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(",");

                csv += "\n";
            }
        );


        csv += "\n\n";


        csv +=
            "DEPARTMENT WORKLOAD REPORT\n";


        csv +=
            "Department,Assigned,Completed,Pending,In Progress\n";


        departmentReport.forEach(
            department => {

                csv += [

                    department.department,

                    department.assigned,

                    department.completed,

                    department.pending,

                    department.in_progress

                ]
                    .map(value =>
                        `"${String(value ?? "").replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(",");

                csv += "\n";
            }
        );


        csv += "\n\n";


        csv +=
            "MONTHLY TASK REPORT\n";


        csv +=
            "Month,Assigned,Completed,Pending,In Progress\n";


        monthlyReport.forEach(
            month => {

                csv += [

                    month.month,

                    month.assigned,

                    month.completed,

                    month.pending,

                    month.in_progress

                ]
                    .map(value =>
                        `"${String(value ?? "").replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(",");

                csv += "\n";
            }
        );


        csv += "\n\n";


        csv +=
            "EMPLOYEE LEAVE REPORT\n";


        csv +=
            "Employee,Department,Total Leaves,Approved,Pending,Rejected\n";


        leaveReport.forEach(
            employee => {

                csv += [

                    employee.name,

                    employee.department,

                    employee.total_leaves,

                    employee.approved,

                    employee.pending,

                    employee.rejected

                ]
                    .map(value =>
                        `"${String(value ?? "").replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(",");

                csv += "\n";
            }
        );


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "management-reports.csv";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };


    /* ====================================
       EXPORT PDF
    ==================================== */

    const exportPDF = () => {

        window.print();

    };


    /* ====================================
       LOADING
    ==================================== */

    if (loading) {

        return (

            <>

                <PageHeader
                    title="Management Reports"
                    subtitle="Employee, task, workload and leave reports"
                />


                <div className="panel">

                    <p>
                        Loading reports...
                    </p>

                </div>

            </>
        );
    }


    /* ====================================
       ERROR
    ==================================== */

    if (error) {

        return (

            <>

                <PageHeader
                    title="Management Reports"
                    subtitle="Employee, task, workload and leave reports"
                />


                <div className="panel">

                    <div className="empty">

                        <p>
                            {error}
                        </p>


                        <button
                            onClick={loadReports}
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </>
        );
    }


    /* ====================================
       REPORT PAGE
    ==================================== */

    return (

        <>

            <PageHeader
                title="Management Reports"
                subtitle="Real-time workforce reports and management summaries"
            />


            {/* ==================================
                REPORT SUMMARY CARDS
            ================================== */}

            <div className="cards">

                <Card
                    title="Employees"
                    value={totalEmployees}
                />


                <Card
                    title="Total Tasks"
                    value={totalTasks}
                />


                <Card
                    title="Completed"
                    value={totalCompleted}
                />


                <Card
                    title="Pending"
                    value={totalPending}
                />


                <Card
                    title="In Progress"
                    value={totalInProgress}
                />


                <Card
                    title="Completion Rate"
                    value={`${overallCompletion}%`}
                />

            </div>


            {/* ==================================
                EMPLOYEE TASK REPORT
            ================================== */}

            <div className="panel">

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                        marginBottom: "20px"
                    }}
                >

                    <div>

                        <h2>
                            Employee-wise Task Report
                        </h2>

                        <p className="section-subtitle">
                            Task allocation and completion by employee
                        </p>

                    </div>


                    <button
                        onClick={exportEmployeeCSV}
                    >
                        📊 Export CSV
                    </button>

                </div>


                {employeeReport.length === 0 ? (

                    <p className="empty">
                        No employee report data available.
                    </p>

                ) : (

                    <div className="table-scroll">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Assigned
                                    </th>

                                    <th>
                                        Completed
                                    </th>

                                    <th>
                                        Pending
                                    </th>

                                    <th>
                                        In Progress
                                    </th>

                                    <th>
                                        Completion
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {employeeReport.map(
                                    employee => (

                                        <tr
                                            key={employee.id}
                                        >

                                            <td>

                                                <strong>
                                                    {employee.name}
                                                </strong>

                                                <small>
                                                    {employee.email}
                                                </small>

                                            </td>


                                            <td>
                                                {
                                                    employee.department ||
                                                    "-"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    employee.assigned
                                                }
                                            </td>


                                            <td>
                                                {
                                                    employee.completed
                                                }
                                            </td>


                                            <td>
                                                {
                                                    employee.pending
                                                }
                                            </td>


                                            <td>
                                                {
                                                    employee.in_progress
                                                }
                                            </td>


                                            <td>

                                                <strong>
                                                    {
                                                        employee.completionRate
                                                    }%
                                                </strong>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ==================================
                DEPARTMENT WORKLOAD
            ================================== */}

            <div className="panel">

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                        marginBottom: "20px"
                    }}
                >

                    <div>

                        <h2>
                            Department-wise Workload
                        </h2>

                        <p className="section-subtitle">
                            Task distribution across departments
                        </p>

                    </div>


                    <button
                        onClick={exportDepartmentCSV}
                    >
                        📊 Export CSV
                    </button>

                </div>


                {departmentReport.length === 0 ? (

                    <p className="empty">
                        No department data available.
                    </p>

                ) : (

                    <div className="table-scroll">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Assigned
                                    </th>

                                    <th>
                                        Completed
                                    </th>

                                    <th>
                                        Pending
                                    </th>

                                    <th>
                                        In Progress
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {departmentReport.map(
                                    department => (

                                        <tr
                                            key={
                                                department.department
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        department.department
                                                    }
                                                </strong>

                                            </td>


                                            <td>
                                                {
                                                    department.assigned
                                                }
                                            </td>


                                            <td>
                                                {
                                                    department.completed
                                                }
                                            </td>


                                            <td>
                                                {
                                                    department.pending
                                                }
                                            </td>


                                            <td>
                                                {
                                                    department.in_progress
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ==================================
                MONTHLY REPORT
            ================================== */}

            <div className="panel">

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                        marginBottom: "20px"
                    }}
                >

                    <div>

                        <h2>
                            Monthly Task Completion Report
                        </h2>

                        <p className="section-subtitle">
                            Task activity and completion by month
                        </p>

                    </div>


                    <button
                        onClick={exportMonthlyCSV}
                    >
                        📊 Export CSV
                    </button>

                </div>


                {monthlyReport.length === 0 ? (

                    <p className="empty">
                        No monthly task data available.
                    </p>

                ) : (

                    <div className="table-scroll">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Month
                                    </th>

                                    <th>
                                        Assigned
                                    </th>

                                    <th>
                                        Completed
                                    </th>

                                    <th>
                                        Pending
                                    </th>

                                    <th>
                                        In Progress
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {monthlyReport.map(
                                    month => (

                                        <tr
                                            key={
                                                month.month
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        month.month
                                                    }
                                                </strong>

                                            </td>


                                            <td>
                                                {
                                                    month.assigned
                                                }
                                            </td>


                                            <td>
                                                {
                                                    month.completed
                                                }
                                            </td>


                                            <td>
                                                {
                                                    month.pending
                                                }
                                            </td>


                                            <td>
                                                {
                                                    month.in_progress
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ==================================
                EMPLOYEE LEAVE REPORT
            ================================== */}

            <div className="panel">

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                        marginBottom: "20px"
                    }}
                >

                    <div>

                        <h2>
                            Employee Leave Report
                        </h2>

                        <p className="section-subtitle">
                            Leave applications and approval status
                        </p>

                    </div>


                    <button
                        onClick={exportLeaveCSV}
                    >
                        🗓 Export CSV
                    </button>

                </div>


                {leaveReport.length === 0 ? (

                    <p className="empty">
                        No leave data available.
                    </p>

                ) : (

                    <div className="table-scroll">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Total Leaves
                                    </th>

                                    <th>
                                        Approved
                                    </th>

                                    <th>
                                        Pending
                                    </th>

                                    <th>
                                        Rejected
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {leaveReport.map(
                                    employee => (

                                        <tr
                                            key={employee.id}
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        employee.name
                                                    }
                                                </strong>

                                            </td>


                                            <td>
                                                {
                                                    employee.department ||
                                                    "-"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    employee.total_leaves
                                                }
                                            </td>


                                            <td>
                                                {
                                                    employee.approved
                                                }
                                            </td>


                                            <td>
                                                {
                                                    employee.pending
                                                }
                                            </td>


                                            <td>
                                                {
                                                    employee.rejected
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ==================================
                ATTENDANCE / LEAVE SUMMARY
            ================================== */}

            <div className="panel">

                <div
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    <h2>
                        Attendance / Leave Summary
                    </h2>

                    <p className="section-subtitle">
                        Employee attendance and leave overview
                    </p>

                </div>


                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "15px"
                    }}
                >

                    <ReportSummary
                        title="Total Employees"
                        value={totalEmployees}
                    />


                    <ReportSummary
                        title="Employees With Leave"
                        value={employeesWithLeave}
                    />


                    <ReportSummary
                        title="Without Leave"
                        value={employeesWithoutLeave}
                    />


                    <ReportSummary
                        title="Total Leave Requests"
                        value={totalLeaveRequests}
                    />


                    <ReportSummary
                        title="Approved Leaves"
                        value={totalApprovedLeaves}
                    />


                    <ReportSummary
                        title="Pending Leaves"
                        value={totalPendingLeaves}
                    />


                    <ReportSummary
                        title="Rejected Leaves"
                        value={totalRejectedLeaves}
                    />

                </div>


                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                    }}
                >

                    <strong>
                        Attendance note:
                    </strong>

                    <p
                        style={{
                            marginTop: "6px",
                            marginBottom: 0
                        }}
                    >
                        This summary currently uses employee
                        and leave records from the database.
                        Actual daily attendance tracking
                        can be added with a dedicated
                        attendance table.
                    </p>

                </div>

            </div>


            {/* ==================================
                EXPORT MANAGEMENT REPORTS
            ================================== */}

            <div className="panel export-panel">

                <div
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    <h2>
                        Export Reports
                    </h2>

                    <p className="section-subtitle">
                        Download reports for management use
                    </p>

                </div>


                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px"
                    }}
                >

                    <button
                        onClick={exportEmployeeCSV}
                    >
                        📊 Employee Task CSV
                    </button>


                    <button
                        onClick={exportDepartmentCSV}
                    >
                        🏢 Department CSV
                    </button>


                    <button
                        onClick={exportMonthlyCSV}
                    >
                        📅 Monthly CSV
                    </button>


                    <button
                        onClick={exportLeaveCSV}
                    >
                        🗓 Leave CSV
                    </button>


                    <button
                        onClick={exportAllCSV}
                    >
                        📁 Export All Reports
                    </button>


                    <button
                        onClick={exportPDF}
                        style={{
                            background: "#dc2626"
                        }}
                    >
                        📄 Export PDF
                    </button>

                </div>

            </div>


            {/* ==================================
                REFRESH
            ================================== */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginBottom: "30px"
                }}
            >

                <button
                    onClick={loadReports}
                >
                    🔄 Refresh Reports
                </button>

            </div>

        </>
    );
}


/* ========================================
   REPORT SUMMARY CARD
======================================== */

function ReportSummary({
    title,
    value
}) {

    return (

        <div
            style={{
                padding: "20px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e5e7eb"
            }}
        >

            <span
                style={{
                    display: "block",
                    fontSize: "14px",
                    marginBottom: "8px",
                    color: "#64748b"
                }}
            >
                {title}
            </span>


            <strong
                style={{
                    display: "block",
                    fontSize: "28px",
                    color: "#111827"
                }}
            >
                {value}
            </strong>

        </div>
    );
}

/* ========================================
   MANAGEMENT ATTENDANCE
======================================== */

function ManagementAttendance() {

    const [attendance, setAttendance] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const loadAttendance = async () => {

        setLoading(true);
        setError("");

        try {

            const response =
                await axios.get(
                    `${API}/attendance/management`,
                    getAuthConfig()
                );


            setAttendance(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Management attendance error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Could not load attendance"
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadAttendance();

    }, []);


    const presentCount =
        attendance.filter(
            record =>
                record.status === "PRESENT"
        ).length;


    const checkedOutCount =
        attendance.filter(
            record =>
                record.check_out
        ).length;


    const workingCount =
        attendance.filter(
            record =>
                record.check_in &&
                !record.check_out
        ).length;


    return (

        <>

            <PageHeader
                title="Attendance Management"
                subtitle="Monitor employee attendance and working hours"
            />


            <div className="cards">

                <Card
                    title="Attendance Records"
                    value={attendance.length}
                />


                <Card
                    title="Present"
                    value={presentCount}
                />


                <Card
                    title="Checked Out"
                    value={checkedOutCount}
                />


                <Card
                    title="Currently Working"
                    value={workingCount}
                />

            </div>


            <div className="panel">

                <div className="section-heading">

                    <div>

                        <h2>
                            Employee Attendance
                        </h2>

                        <p className="section-subtitle">
                            Attendance records from employees
                        </p>

                    </div>


                    <button
                        onClick={loadAttendance}
                    >
                        🔄 Refresh
                    </button>

                </div>


                {loading ? (

                    <div className="empty">

                        <p>
                            Loading attendance...
                        </p>

                    </div>

                ) : error ? (

                    <div className="empty">

                        <p>
                            {error}
                        </p>


                        <button
                            onClick={loadAttendance}
                        >
                            Try Again
                        </button>

                    </div>

                ) : attendance.length === 0 ? (

                    <div className="attendance-no-data">

                        <div className="attendance-no-data-icon">
                            🕘
                        </div>

                        <h3>
                            No attendance records yet
                        </h3>

                        <p>
                            Employees will appear here after
                            they mark their attendance.
                        </p>

                    </div>

                ) : (

                    <div className="table-scroll">

                        <table className="attendance-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Check In
                                    </th>

                                    <th>
                                        Check Out
                                    </th>

                                    <th>
                                        Working Hours
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {attendance.map(
                                    record => (

                                        <tr
                                            key={record.id}
                                        >

                                            <td>

                                                <strong>
                                                    {record.employee_name}
                                                </strong>

                                                <small>
                                                    {record.email}
                                                </small>

                                            </td>


                                            <td>
                                                {record.department || "-"}
                                            </td>


                                            <td>
                                                {record.attendance_date}
                                            </td>


                                            <td>
                                                {record.check_in
                                                    ? new Date(
                                                        record.check_in
                                                    ).toLocaleTimeString()
                                                    : "-"
                                                }
                                            </td>


                                            <td>
                                                {record.check_out
                                                    ? new Date(
                                                        record.check_out
                                                    ).toLocaleTimeString()
                                                    : "-"
                                                }
                                            </td>


                                            <td>
                                                {record.working_hours
                                                    ? `${record.working_hours} hrs`
                                                    : "-"
                                                }
                                            </td>


                                            <td>

                                                <span className="attendance-status-badge">
                                                    {record.status}
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </>
    );
}

/* ========================================
   MANAGEMENT LEAVE
======================================== */

function ManagementLeave() {

    const [leaves, setLeaves] =
        useState([]);


    const loadLeaves = async () => {

        try {

            const response =
                await axios.get(
                    `${API}/leave`,
                    getAuthConfig()
                );

            setLeaves(response.data);

        } catch (error) {

            console.error(
                "Failed to load leaves:",
                error
            );
        }
    };


    useEffect(() => {

        loadLeaves();

    }, []);


    const updateLeave =
        async (id, status) => {

            try {

                await axios.put(
                    `${API}/leave/${id}/status`,
                    {
                        status
                    },
                    getAuthConfig()
                );


                loadLeaves();

            } catch (error) {

                alert(
                    error.response?.data?.message ||
                    "Could not update leave"
                );
            }
        };


    return (

        <>

            <PageHeader
                title="Leave Requests"
                subtitle="Review and manage employee leave"
            />


            <div className="panel">

                {leaves.length === 0 ? (

                    <p className="empty">
                        No leave requests.
                    </p>

                ) : (

                    <div className="table-scroll">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Dates
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {leaves.map(
                                    leave => (

                                        <tr
                                            key={leave.id}
                                        >

                                            <td>

                                                <strong>
                                                    {leave.employee_name}
                                                </strong>

                                            </td>


                                            <td>
                                                {leave.leave_type}
                                            </td>


                                            <td>

                                                {leave.from_date}
                                                {" → "}
                                                {leave.to_date}

                                            </td>


                                            <td>
                                                {leave.reason}
                                            </td>


                                            <td>

                                                <Status
                                                    value={
                                                        leave.status
                                                    }
                                                />

                                            </td>


                                            <td>

                                                {leave.status ===
                                                    "PENDING" && (

                                                        <div className="actions">

                                                            <button
                                                                className="approve"
                                                                onClick={() =>
                                                                    updateLeave(
                                                                        leave.id,
                                                                        "APPROVED"
                                                                    )
                                                                }
                                                            >
                                                                Approve
                                                            </button>


                                                            <button
                                                                className="reject"
                                                                onClick={() =>
                                                                    updateLeave(
                                                                        leave.id,
                                                                        "REJECTED"
                                                                    )
                                                                }
                                                            >
                                                                Reject
                                                            </button>

                                                        </div>

                                                    )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </>
    );
}

// ========================================
// NOTIFICATIONS
// ========================================

/* ========================================
   NOTIFICATIONS
======================================== */

function Notifications({ onClose }) {

    const [notifications, setNotifications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    // ========================================
    // LOAD NOTIFICATIONS
    // ========================================

    const loadNotifications = async () => {

        try {

            const response =
                await axios.get(
                    `${API}/notifications`,
                    getAuthConfig()
                );

            setNotifications(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Notification error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // ========================================
    // AUTO REFRESH
    // ========================================

    useEffect(() => {

        loadNotifications();

        // Check for new notifications every 10 seconds

        const interval =
            setInterval(
                loadNotifications,
                10000
            );

        return () => {

            clearInterval(interval);

        };

    }, []);


    // ========================================
    // MARK ONE AS READ
    // ========================================

    const markAsRead =
        async (id) => {

            try {

                await axios.put(
                    `${API}/notifications/${id}/read`,
                    {},
                    getAuthConfig()
                );


                setNotifications(
                    previous =>
                        previous.map(
                            notification =>
                                notification.id === id
                                    ? {
                                        ...notification,
                                        is_read: 1
                                    }
                                    : notification
                        )
                );

            } catch (error) {

                console.error(
                    "Mark notification read error:",
                    error
                );

            }
        };


    // ========================================
    // MARK ALL AS READ
    // ========================================

    const markAllAsRead =
        async () => {

            try {

                await axios.put(
                    `${API}/notifications/read-all`,
                    {},
                    getAuthConfig()
                );


                setNotifications(
                    previous =>
                        previous.map(
                            notification => ({
                                ...notification,
                                is_read: 1
                            })
                        )
                );

            } catch (error) {

                console.error(
                    "Mark all notifications error:",
                    error
                );

            }
        };


    // ========================================
    // UNREAD COUNT
    // ========================================

    const unreadCount =
        notifications.filter(
            notification =>
                !notification.is_read
        ).length;


    // ========================================
    // NOTIFICATION ICON
    // ========================================

    const getNotificationIcon =
        (type) => {

            switch (type) {

                case "OVERDUE":
                    return "⚠️";

                case "LEAVE_REMINDER":
                    return "🗓️";

                case "TASK":
                    return "📋";

                case "LEAVE":
                    return "🏖️";

                case "ATTENDANCE":
                    return "🕘";

                default:
                    return "🔔";
            }
        };


    // ========================================
    // NOTIFICATION LABEL
    // ========================================

    const getNotificationLabel =
        (type) => {

            switch (type) {

                case "OVERDUE":
                    return "Overdue Task";

                case "LEAVE_REMINDER":
                    return "Pending Leave";

                case "TASK":
                    return "Task";

                case "LEAVE":
                    return "Leave";

                case "ATTENDANCE":
                    return "Attendance";

                default:
                    return "Notification";
            }
        };


    return (

        <div className="notification-wrapper">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="notification-header">

                <div>

                    <h2>
                        🔔 Notifications
                    </h2>

                    <span>
                        {unreadCount} unread
                    </span>

                </div>


                <div className="notification-header-actions">

                    {unreadCount > 0 && (

                        <button
                            className="mark-all-button"
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </button>

                    )}


                    <button
                        className="notification-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>

            </div>


            {/* ==================================
                CONTENT
            ================================== */}

            <div className="notification-list">

                {loading ? (

                    <div className="notification-empty">

                        Loading notifications...

                    </div>

                ) : notifications.length === 0 ? (

                    <div className="notification-empty">

                        <div className="notification-empty-icon">
                            🔔
                        </div>

                        <strong>
                            No notifications
                        </strong>

                        <span>
                            You're all caught up!
                        </span>

                    </div>

                ) : (

                    notifications.map(
                        notification => (

                            <div
                                key={notification.id}
                                className={
                                    notification.is_read
                                        ? "notification-item read"
                                        : "notification-item unread"
                                }
                                onClick={() =>
                                    markAsRead(
                                        notification.id
                                    )
                                }
                            >

                                {/* ICON */}

                                <div
                                    className={
                                        notification.type === "OVERDUE"
                                            ? "notification-icon overdue-icon"
                                            : notification.type === "LEAVE_REMINDER"
                                                ? "notification-icon leave-reminder-icon"
                                                : "notification-icon"
                                    }
                                >

                                    {getNotificationIcon(
                                        notification.type
                                    )}

                                </div>


                                {/* BODY */}

                                <div className="notification-body">

                                    <div className="notification-title-row">

                                        <strong>
                                            {
                                                notification.title ||
                                                getNotificationLabel(
                                                    notification.type
                                                )
                                            }
                                        </strong>


                                        {!notification.is_read && (

                                            <span className="notification-new">
                                                NEW
                                            </span>

                                        )}

                                    </div>


                                    <p>
                                        {notification.message}
                                    </p>


                                    <small>

                                        {notification.created_at
                                            ? new Date(
                                                notification.created_at
                                            ).toLocaleString()
                                            : ""
                                        }

                                    </small>

                                </div>

                            </div>

                        )
                    )

                )}

            </div>

        </div>

    );
}
/* ========================================
   LAYOUT
======================================== */

function Layout({
    title,
    user,
    page,
    setPage,
    logout,
    children,
    employee
}) {

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [notificationCount, setNotificationCount] =
        useState(0);

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);


    /* ========================================
       LOAD NOTIFICATION COUNT
    ======================================== */

    const loadNotificationCount = async () => {

        try {

            const response = await axios.get(
                `${API}/notifications`,
                getAuthConfig()
            );

            const notifications =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            const unreadCount =
                notifications.filter(
                    notification =>
                        !Number(notification.is_read)
                ).length;

            setNotificationCount(unreadCount);

        } catch (error) {

            console.error(
                "Notification count error:",
                error
            );

        }
    };


    /* ========================================
       AUTO REFRESH
    ======================================== */

    useEffect(() => {

        loadNotificationCount();

        const interval = setInterval(
            loadNotificationCount,
            10000
        );

        return () => {
            clearInterval(interval);
        };

    }, []);


    /* ========================================
       NAVIGATION
    ======================================== */

    const navigate = (nextPage) => {

        setPage(nextPage);

        setMobileMenuOpen(false);

        setShowNotifications(false);

    };


    /* ========================================
       OPEN NOTIFICATIONS
    ======================================== */

    const openNotifications = () => {

        // Close mobile sidebar first
        setMobileMenuOpen(false);

        // Open notification panel
        setShowNotifications(true);

    };


    /* ========================================
       CLOSE NOTIFICATIONS
    ======================================== */

    const closeNotifications = () => {

        setShowNotifications(false);

        // Refresh unread number
        loadNotificationCount();

    };


    /* ========================================
       LOGOUT
    ======================================== */

    const handleLogout = () => {

        setMobileMenuOpen(false);

        setShowNotifications(false);

        logout();

    };


    return (

        <div className="app">


            {/* ==================================
                MOBILE OVERLAY
            ================================== */}

            {mobileMenuOpen && (

                <div
                    className="mobile-menu-overlay"
                    onClick={() =>
                        setMobileMenuOpen(false)
                    }
                    aria-hidden="true"
                />

            )}


            {/* ==================================
                SIDEBAR
            ================================== */}

            <aside
                className={
                    mobileMenuOpen
                        ? "mobile-sidebar-open"
                        : ""
                }
            >


                {/* ==================================
                    MOBILE CLOSE BUTTON
                ================================== */}

                <button
                    type="button"
                    className="mobile-sidebar-close"
                    onClick={() =>
                        setMobileMenuOpen(false)
                    }
                    aria-label="Close menu"
                >
                    ✕
                </button>


                {/* ==================================
                    BRAND
                ================================== */}

                <div className="brand">

                    <div className="brand-icon">
                        EMP
                    </div>

                    <div>

                        <strong>
                            Workforce
                        </strong>

                        <span>
                            Management
                        </span>

                    </div>

                </div>


                {/* ==================================
                    ROLE
                ================================== */}

                <div className="role">

                    {employee
                        ? "EMPLOYEE"
                        : "MANAGEMENT"
                    }

                </div>


                {/* ==================================
                    NAVIGATION
                ================================== */}

                <nav>


                    {/* ==================================
                        NOTIFICATIONS
                        ABOVE DASHBOARD
                    ================================== */}

                    <button
                        type="button"
                        className="sidebar-notification-button"
                        onClick={openNotifications}
                        aria-label="Open notifications"
                        aria-expanded={showNotifications}
                    >

                        <span className="notification-label">
                            🔔 Notifications
                        </span>


                        {notificationCount > 0 && (

                            <span className="notification-badge">

                                {notificationCount > 99
                                    ? "99+"
                                    : notificationCount
                                }

                            </span>

                        )}

                    </button>


                    {/* ==================================
                        DASHBOARD
                    ================================== */}

                    <button
                        type="button"
                        className={
                            page === "dashboard"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            navigate("dashboard")
                        }
                    >
                        📊 Dashboard
                    </button>


                    {/* ==================================
                        EMPLOYEES
                    ================================== */}

                    {!employee && (

                        <button
                            type="button"
                            className={
                                page === "employees"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                navigate("employees")
                            }
                        >
                            👥 Employees
                        </button>

                    )}


                    {/* ==================================
                        TASKS
                    ================================== */}

                    <button
                        type="button"
                        className={
                            page === "tasks"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            navigate("tasks")
                        }
                    >
                        📋 Tasks
                    </button>


                    {/* ==================================
                        ANALYTICS
                    ================================== */}

                    {!employee && (

                        <button
                            type="button"
                            className={
                                page === "analytics"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                navigate("analytics")
                            }
                        >
                            📈 Analytics
                        </button>

                    )}


                    {/* ==================================
                        REPORTS
                    ================================== */}

                    {!employee && (

                        <button
                            type="button"
                            className={
                                page === "reports"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                navigate("reports")
                            }
                        >
                            📑 Reports
                        </button>

                    )}


                    {/* ==================================
                        ATTENDANCE
                    ================================== */}

                    {!employee && (

                        <button
                            type="button"
                            className={
                                page === "attendance"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                navigate("attendance")
                            }
                        >
                            🕘 Attendance
                        </button>

                    )}


                    {/* ==================================
                        LEAVE
                    ================================== */}

                    <button
                        type="button"
                        className={
                            page === "leave"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            navigate("leave")
                        }
                    >
                        🗓 Leave
                    </button>


                    {/* ==================================
                        EMPLOYEE PROFILE
                    ================================== */}

                    {employee && (

                        <button
                            type="button"
                            className={
                                page === "profile"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                navigate("profile")
                            }
                        >
                            👤 My Profile
                        </button>

                    )}

                </nav>


                {/* ==================================
                    SIDEBAR BOTTOM
                    NO NOTIFICATION BUTTON HERE
                ================================== */}

                <div className="sidebar-bottom">


                    {/* ==================================
                        USER
                    ================================== */}

                    <div className="user-mini">

                        <div className="avatar">

                            {(
                                user?.name ||
                                "U"
                            )
                                .charAt(0)
                                .toUpperCase()
                            }

                        </div>


                        <div>

                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <span>
                                {user?.email || ""}
                            </span>

                        </div>

                    </div>


                    {/* ==================================
                        LOGOUT
                    ================================== */}

                    <button
                        type="button"
                        className="logout"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <main>


                {/* ==================================
                    MOBILE TOP BAR
                ================================== */}

                <div className="mobile-topbar">

                    <button
                        type="button"
                        className="hamburger-button"
                        onClick={() =>
                            setMobileMenuOpen(true)
                        }
                        aria-label="Open menu"
                    >
                        ☰
                    </button>


                    <div className="mobile-page-title">

                        <strong>
                            {title}
                        </strong>

                    </div>

                </div>


                {/* ==================================
                    DESKTOP TOP BAR
                ================================== */}

                <div className="topbar">

                    <div className="desktop-page-title">

                        <strong>
                            {title}
                        </strong>

                    </div>

                </div>


                {/* ==================================
                    NOTIFICATION PANEL
                ================================== */}

                {showNotifications && (

                    <div className="notification-panel-container">

                        <Notifications
                            onClose={
                                closeNotifications
                            }
                        />

                    </div>

                )}


                {/* ==================================
                    PAGE CONTENT
                ================================== */}

                {children}

            </main>

        </div>
    );
}
/* ========================================
   PAGE HEADER
======================================== */

function PageHeader({
    title,
    subtitle
}) {

    return (

        <header>

            <h1>
                {title}
            </h1>

            <p>
                {subtitle}
            </p>

        </header>
    );
}


/* ========================================
   CARD
======================================== */

function Card({
    title,
    value
}) {

    return (

        <div className="card">

            <span>
                {title}
            </span>


            <strong>
                {value}
            </strong>

        </div>
    );
}


/* ========================================
   STATUS
======================================== */

function Status({ value }) {

    return (

        <span
            className={`status ${value}`}
        >
            {value.replace("_", " ")}
        </span>
    );
}


/* ========================================
   TASK TABLE
======================================== */

function TaskTable({
    tasks,
    updateStatus
}) {

    if (tasks.length === 0) {

        return (
            <p className="empty">
                No tasks available.
            </p>
        );
    }


    return (

        <div className="task-table-container">

            <div className="table-scroll">

                <table className="task-table">

                    <thead>

                        <tr>

                            <th>
                                Task
                            </th>

                            <th>
                                Priority
                            </th>

                            <th>
                                Deadline
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {tasks.map(task => (

                            <tr
                                key={task.id}
                            >

                                <td className="task-title-cell">

                                    <strong>
                                        {task.title}
                                    </strong>


                                    {task.description && (

                                        <small className="task-description">
                                            {task.description}
                                        </small>

                                    )}


                                    {task.employee_name && (

                                        <small>
                                            Assigned to:{" "}
                                            {task.employee_name}
                                        </small>

                                    )}

                                </td>


                                <td>

                                    <span
                                        className={`priority ${task.priority}`}
                                    >
                                        {task.priority}
                                    </span>

                                </td>


                                <td className="deadline-cell">
                                    {task.deadline}
                                </td>


                                <td>

                                    {updateStatus ? (

                                        <select
                                            value={task.status}
                                            onChange={(e) =>
                                                updateStatus(
                                                    task.id,
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="PENDING">
                                                Pending
                                            </option>

                                            <option value="IN_PROGRESS">
                                                In Progress
                                            </option>

                                            <option value="COMPLETED">
                                                Completed
                                            </option>

                                        </select>

                                    ) : (

                                        <Status
                                            value={task.status}
                                        />

                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}


export default App;