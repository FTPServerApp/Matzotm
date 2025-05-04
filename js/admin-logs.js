/**
 * ניהול לוגים מערכת - ממשק ניהול
 * 
 * מטפל בהצגה וסינון של רשומות לוג במערכת
 */

// אלמנטים
const logEntriesContainer = document.querySelector('.log-entries');
const logTypeFilter = document.getElementById('log-type-filter');
const logDateInput = document.getElementById('log-date');
const filterLogsBtn = document.getElementById('filter-logs');

// מצב סינון נוכחי
let filteredLogs = [];
let currentLogsFilter = {
    type: '',
    date: ''
};

// אתחול
document.addEventListener('DOMContentLoaded', initLogsPage);

/**
 * אתחול דף לוגים
 */
function initLogsPage() {
    // הגדרת אירועים
    filterLogsBtn.addEventListener('click', applyLogsFilter);
}

/**
 * טעינת נתוני לוגים
 */
function loadLogsData() {
    // איפוס ערכי סינון
    currentLogsFilter = {
        type: '',
        date: ''
    };
    
    // איפוס שדות סינון
    logTypeFilter.value = '';
    logDateInput.value = '';
    
    // טעינת כל הלוגים
    const logs = getSystemLogs();
    
    // סידור לפי תאריך יורד (החדש ביותר קודם)
    const sortedLogs = [...logs].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    filteredLogs = sortedLogs;
    
    // הצגת הלוגים
    renderLogs();
}

/**
 * הצגת לוגים
 */
function renderLogs() {
    // ניקוי המכל
    logEntriesContainer.innerHTML = '';
    
    // בדיקה אם אין לוגים
    if (filteredLogs.length === 0) {
        logEntriesContainer.innerHTML = '<p class="no-data">לא נמצאו לוגים</p>';
        return;
    }
    
    // הוספת רשומות לוג
    filteredLogs.forEach(log => {
        // המרת timestamp לתאריך ושעה מקומיים
        const date = new Date(log.timestamp);
        const dateTimeString = date.toLocaleString('he-IL');
        
        // קבלת שם משתמש
        let userName = '';
        if (log.userId) {
            const user = getUserById(log.userId);
            userName = user ? user.name : `משתמש #${log.userId}`;
        } else {
            userName = 'מערכת';
        }
        
        // יצירת רשומת לוג
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        // הוספת תוכן לרשומה
        logEntry.innerHTML = `
            <span class="timestamp">${dateTimeString}</span>
            <span class="log-type ${log.type}">${getLogTypeHebrew(log.type)}</span>
            <span class="log-user">${userName}</span>
            <div class="log-message">${log.message}</div>
        `;
        
        logEntriesContainer.appendChild(logEntry);
    });
}

/**
 * החלת סינון על לוגים
 */
function applyLogsFilter() {
    // קבלת ערכי הסינון
    const typeFilter = logTypeFilter.value;
    const dateFilter = logDateInput.value;
    
    // עדכון מצב הסינון הנוכחי
    currentLogsFilter = {
        type: typeFilter,
        date: dateFilter
    };
    
    // קבלת כל הלוגים
    let logs = getSystemLogs();
    
    // סינון לפי סוג
    if (typeFilter) {
        logs = logs.filter(log => log.type === typeFilter);
    }
    
    // סינון לפי תאריך
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filterDate.setHours(0, 0, 0, 0);
        
        logs = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === filterDate.getTime();
        });
    }
    
    // סידור לפי תאריך יורד (החדש ביותר קודם)
    filteredLogs = logs.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // הצגת הלוגים המסוננים
    renderLogs();
}

/**
 * מציאת משתמש (עובד או מנהל) לפי מזהה
 */
function getUserById(userId) {
    // ניסיון למצוא בעובדים
    const employees = getEmployees();
    const employee = employees.find(emp => emp.id === userId);
    if (employee) {
        return employee;
    }
    
    // ניסיון למצוא במנהלים
    const admins = getAdmins();
    const admin = admins.find(adm => adm.id === userId);
    if (admin) {
        return admin;
    }
    
    return null;
}

/**
 * המרת סוג לוג לעברית
 */
function getLogTypeHebrew(type) {
    switch (type) {
        case 'login':
            return 'התחברות';
        case 'employee':
            return 'עובדים';
        case 'attendance':
            return 'נוכחות';
        case 'inventory':
            return 'מלאי';
        case 'order':
            return 'הזמנות';
        case 'production':
            return 'ייצור';
        case 'export':
            return 'ייצוא';
        case 'import':
            return 'ייבוא';
        case 'system':
            return 'מערכת';
        default:
            return type;
    }
}