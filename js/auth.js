/**
 * מערכת אימות משתמשים - אתר החתמת כרטיס
 * 
 * מטפל בהתחברות והתנתקות של עובדים
 */

// קבועים ומשתנים גלובליים
const STORAGE_KEY_EMPLOYEES = 'pesach_employees';
const STORAGE_KEY_CURRENT_USER = 'pesach_current_user';
const STORAGE_KEY_LOGS = 'pesach_system_logs';

// אלמנטים
const loginScreen = document.getElementById('login-screen');
const punchScreen = document.getElementById('punch-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const employeeNameSpan = document.getElementById('employee-name');
const logoutBtn = document.getElementById('logout-btn');

// אתחול הדף
document.addEventListener('DOMContentLoaded', initialize);

/**
 * פונקציית אתחול
 */
function initialize() {
    // טעינת נתונים ראשוניים אם לא קיימים
    initializeData();
    
    // בדיקה אם יש משתמש מחובר
    const currentUser = getCurrentUser();
    if (currentUser) {
        showPunchScreen(currentUser);
    } else {
        showLoginScreen();
    }
    
    // אירועים
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
}

/**
 * אתחול נתונים ראשוניים אם לא קיימים
 */
function initializeData() {
    // בדיקה אם קיימים עובדים
    if (!localStorage.getItem(STORAGE_KEY_EMPLOYEES)) {
        // יצירת עובדים ראשוניים לדוגמה
        const initialEmployees = [
            {
                id: 1,
                name: 'ישראל ישראלי',
                role: 'מנהל',
                email: 'israel@example.com',
                phone: '050-1234567',
                username: 'admin',
                password: 'admin123',
                status: 'active'
            },
            {
                id: 2,
                name: 'שרה כהן',
                role: 'מפעילת קו ייצור',
                email: 'sara@example.com',
                phone: '052-7654321',
                username: 'sara',
                password: 'sara123',
                status: 'active'
            },
            {
                id: 3,
                name: 'דוד לוי',
                role: 'אחראי משמרת',
                email: 'david@example.com',
                phone: '054-9876543',
                username: 'david',
                password: 'david123',
                status: 'active'
            }
        ];
        
        // שמירה ב-localStorage
        localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(initialEmployees));
    }
    
    // בדיקה אם קיימים לוגים
    if (!localStorage.getItem(STORAGE_KEY_LOGS)) {
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify([]));
    }
}

/**
 * טיפול בהתחברות
 */
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // בדיקת אימות
    const employee = authenticateEmployee(username, password);
    
    if (employee) {
        // שמירת המשתמש הנוכחי
        setCurrentUser(employee);
        // שמירת לוג התחברות
        addSystemLog('login', `משתמש ${employee.name} התחבר למערכת`, employee.id);
        // הצגת מסך ההחתמה
        showPunchScreen(employee);
    } else {
        loginError.textContent = 'שם משתמש או סיסמה שגויים';
    }
}

/**
 * טיפול בהתנתקות
 */
function handleLogout() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        // שמירת לוג התנתקות
        addSystemLog('login', `משתמש ${currentUser.name} התנתק מהמערכת`, currentUser.id);
        // מחיקת המשתמש הנוכחי
        clearCurrentUser();
        // הצגת מסך ההתחברות
        showLoginScreen();
    }
}

/**
 * אימות משתמש
 */
function authenticateEmployee(username, password) {
    // קבלת רשימת העובדים
    const employees = getEmployees();
    
    // חיפוש עובד עם שם משתמש וסיסמה תואמים
    return employees.find(employee => 
        employee.username === username && 
        employee.password === password &&
        employee.status === 'active'
    );
}

/**
 * הצגת מסך התחברות
 */
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    punchScreen.classList.add('hidden');
    
    // איפוס טופס ההתחברות
    loginForm.reset();
    loginError.textContent = '';
}

/**
 * הצגת מסך החתמה
 */
function showPunchScreen(employee) {
    loginScreen.classList.add('hidden');
    punchScreen.classList.remove('hidden');
    
    // הצגת שם העובד
    employeeNameSpan.textContent = employee.name;
    
    // עדכון מצב כפתורי החתמה
    updatePunchButtonsState();
}

/**
 * קבלת רשימת עובדים
 */
function getEmployees() {
    const employeesJson = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
    return employeesJson ? JSON.parse(employeesJson) : [];
}

/**
 * שמירת המשתמש הנוכחי
 */
function setCurrentUser(employee) {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(employee));
}

/**
 * קבלת המשתמש הנוכחי
 */
function getCurrentUser() {
    const currentUserJson = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    return currentUserJson ? JSON.parse(currentUserJson) : null;
}

/**
 * מחיקת המשתמש הנוכחי
 */
function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
}

/**
 * הוספת לוג מערכת
 */
function addSystemLog(type, message, userId = null) {
    const logs = getSystemLogs();
    
    const newLog = {
        id: generateId(logs),
        type: type,
        message: message,
        userId: userId,
        timestamp: new Date().toISOString()
    };
    
    logs.push(newLog);
    
    // שמירת הלוגים המעודכנים
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    
    return newLog;
}

/**
 * קבלת לוגים מהמערכת
 */
function getSystemLogs() {
    const logsJson = localStorage.getItem(STORAGE_KEY_LOGS);
    return logsJson ? JSON.parse(logsJson) : [];
}

/**
 * יצירת מזהה חדש
 */
function generateId(items) {
    if (items.length === 0) {
        return 1;
    }
    
    const maxId = Math.max(...items.map(item => item.id));
    return maxId + 1;
}
