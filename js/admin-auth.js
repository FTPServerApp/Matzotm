/**
 * מערכת אימות מנהלים - ממשק ניהול
 * 
 * מטפל בהתחברות והתנתקות של מנהלי מערכת
 */

// קבועים ומשתנים גלובליים
const STORAGE_KEY_ADMINS = 'pesach_admins';
const STORAGE_KEY_CURRENT_ADMIN = 'pesach_current_admin';

// אלמנטים
const adminLoginScreen = document.getElementById('admin-login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const adminLoginForm = document.getElementById('admin-login-form');
const adminLoginError = document.getElementById('admin-login-error');
const adminNameSpan = document.getElementById('admin-name');
const adminLogoutBtn = document.getElementById('admin-logout');

// אתחול
document.addEventListener('DOMContentLoaded', initAdminAuth);

/**
 * אתחול מערכת האימות למנהלים
 */
function initAdminAuth() {
    // אתחול נתוני מנהלים אם לא קיימים
    initAdminData();
    
    // בדיקה אם יש מנהל מחובר
    const currentAdmin = getCurrentAdmin();
    if (currentAdmin) {
        showAdminDashboard(currentAdmin);
    } else {
        showAdminLoginScreen();
    }
    
    // הגדרת אירועים
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    adminLogoutBtn.addEventListener('click', handleAdminLogout);
}

/**
 * אתחול נתוני מנהלים
 */
function initAdminData() {
    // בדיקה אם קיימים מנהלים
    if (!localStorage.getItem(STORAGE_KEY_ADMINS)) {
        // יצירת מנהל ראשוני לדוגמה
        const initialAdmins = [
            {
                id: 1,
                name: 'מנהל מערכת',
                role: 'מנהל ראשי',
                email: 'admin@example.com',
                username: 'admin',
                password: 'admin123'
            }
        ];
        
        // שמירה ב-localStorage
        localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(initialAdmins));
    }
}

/**
 * טיפול בהתחברות מנהל
 */
function handleAdminLogin(event) {
    event.preventDefault();
    console.log('ניסיון התחברות מנהל');
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    // בדיקת אימות
    const admin = authenticateAdmin(username, password);
    
    if (admin) {
        console.log('התחברות מנהל הצליחה:', admin.name);
        // שמירת המנהל הנוכחי
        setCurrentAdmin(admin);
        // שמירת לוג התחברות
        addSystemLog('login', `מנהל ${admin.name} התחבר למערכת`, admin.id);
        // הצגת לוח המחוונים
        showAdminDashboard(admin);
    } else {
        console.log('התחברות מנהל נכשלה');
        adminLoginError.textContent = 'שם משתמש או סיסמה שגויים';
    }
}

/**
 * טיפול בהתנתקות מנהל
 */
function handleAdminLogout() {
    const currentAdmin = getCurrentAdmin();
    if (currentAdmin) {
        // שמירת לוג התנתקות
        addSystemLog('login', `מנהל ${currentAdmin.name} התנתק מהמערכת`, currentAdmin.id);
        // מחיקת המנהל הנוכחי
        clearCurrentAdmin();
        // הצגת מסך ההתחברות
        showAdminLoginScreen();
    }
}

/**
 * אימות מנהל
 */
function authenticateAdmin(username, password) {
    // קבלת רשימת המנהלים
    const admins = getAdmins();
    
    // חיפוש מנהל עם שם משתמש וסיסמה תואמים
    return admins.find(admin => 
        admin.username === username && 
        admin.password === password
    );
}

/**
 * הצגת מסך התחברות מנהל
 */
function showAdminLoginScreen() {
    adminLoginScreen.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    
    // איפוס טופס ההתחברות
    adminLoginForm.reset();
    adminLoginError.textContent = '';
}

/**
 * הצגת לוח המחוונים
 */
function showAdminDashboard(admin) {
    adminLoginScreen.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    
    // הצגת שם המנהל
    adminNameSpan.textContent = admin.name;
    
    // טעינת נתוני לוח המחוונים
    if (typeof loadDashboardData === 'function') {
        loadDashboardData();
    } else {
        console.error('פונקציית loadDashboardData לא הוגדרה');
    }
}

/**
 * קבלת רשימת מנהלים
 */
function getAdmins() {
    const adminsJson = localStorage.getItem(STORAGE_KEY_ADMINS);
    return adminsJson ? JSON.parse(adminsJson) : [];
}

/**
 * שמירת המנהל הנוכחי
 */
function setCurrentAdmin(admin) {
    localStorage.setItem(STORAGE_KEY_CURRENT_ADMIN, JSON.stringify(admin));
}

/**
 * קבלת המנהל הנוכחי
 */
function getCurrentAdmin() {
    const currentAdminJson = localStorage.getItem(STORAGE_KEY_CURRENT_ADMIN);
    return currentAdminJson ? JSON.parse(currentAdminJson) : null;
}

/**
 * מחיקת המנהל הנוכחי
 */
function clearCurrentAdmin() {
    localStorage.removeItem(STORAGE_KEY_CURRENT_ADMIN);
}

/**
 * הוספת לוג מערכת עם בדיקת שגיאות
 */
function addSystemLog(type, message, userId = null) {
    try {
        console.log(`[LOG] ${type}: ${message} (User: ${userId})`);
        
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '[]');
        
        const newLog = {
            id: logs.length > 0 ? Math.max(...logs.map(log => log.id)) + 1 : 1,
            type: type,
            message: message,
            userId: userId,
            timestamp: new Date().toISOString()
        };
        
        logs.push(newLog);
        
        // שמירת הלוגים המעודכנים
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
        
        return newLog;
    } catch (error) {
        console.error('שגיאה בשמירת לוג:', error);
        return null;
    }
}
    