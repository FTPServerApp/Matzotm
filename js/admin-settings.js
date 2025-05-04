/**
 * הגדרות מערכת - ממשק ניהול
 * 
 * מטפל בהצגה ועריכה של הגדרות המערכת
 */

// אלמנטים
const systemSettingsForm = document.getElementById('system-settings-form');
const companyNameInput = document.getElementById('company-name');
const workdayStartInput = document.getElementById('workday-start');
const workdayEndInput = document.getElementById('workday-end');
const adminUsersTable = document.getElementById('admin-users-table').querySelector('tbody');
const addAdminBtn = document.getElementById('add-admin-btn');
const backupBtn = document.getElementById('backup-btn');
const restoreBtn = document.getElementById('restore-btn');

// אתחול
document.addEventListener('DOMContentLoaded', initSettingsPage);

/**
 * אתחול דף הגדרות
 */
function initSettingsPage() {
    // הגדרת אירועים
    systemSettingsForm.addEventListener('submit', saveSystemSettings);
    addAdminBtn.addEventListener('click', openAddAdminModal);
    backupBtn.addEventListener('click', createBackup);
    restoreBtn.addEventListener('click', openRestoreBackup);
}

/**
 * טעינת נתוני הגדרות
 */
function loadSettingsData() {
    // קבלת הגדרות נוכחיות
    const settings = getSettings();
    
    // מילוי השדות בטופס
    companyNameInput.value = settings.companyName || '';
    workdayStartInput.value = settings.workdayStart || '08:00';
    workdayEndInput.value = settings.workdayEnd || '17:00';
    
    // טעינת רשימת מנהלי מערכת
    loadAdminUsers();
}

/**
 * טעינת רשימת מנהלי מערכת
 */
function loadAdminUsers() {
    // קבלת רשימת מנהלים
    const admins = getAdmins();
    
    // ניקוי הטבלה
    adminUsersTable.innerHTML = '';
    
    // בדיקה אם אין מנהלים
    if (admins.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="4" style="text-align: center;">לא נמצאו משתמשי מערכת</td>`;
        adminUsersTable.appendChild(emptyRow);
        return;
    }
    
    // הוספת שורות לטבלה
    admins.forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${admin.username}</td>
            <td>${admin.role || 'מנהל מערכת'}</td>
            <td>${admin.email || '-'}</td>
            <td>
                <button class="btn-icon edit-admin" data-id="${admin.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete-admin" data-id="${admin.id}" ${admins.length === 1 ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        adminUsersTable.appendChild(row);
    });
    
    // הוספת אירועים לכפתורי פעולה
    attachAdminActionEvents();
}

/**
 * הוספת אירועים לפעולות על מנהלים
 */
function attachAdminActionEvents() {
    // כפתורי עריכה
    document.querySelectorAll('.edit-admin').forEach(button => {
        button.addEventListener('click', () => {
            const adminId = parseInt(button.dataset.id);
            openEditAdminModal(adminId);
        });
    });
    
    // כפתורי מחיקה
    document.querySelectorAll('.delete-admin').forEach(button => {
        button.addEventListener('click', () => {
            const adminId = parseInt(button.dataset.id);
            confirmDeleteAdmin(adminId);
        });
    });
}

/**
 * שמירת הגדרות מערכת
 */
function saveSystemSettings(event) {
    event.preventDefault();
    
    // קבלת ערכי הגדרות
    const companyName = companyNameInput.value;
    const workdayStart = workdayStartInput.value;
    const workdayEnd = workdayEndInput.value;
    
    // וידוא תקינות
    if (!companyName) {
        alert('יש למלא את שם החברה');
        return;
    }
    
    // קבלת הגדרות נוכחיות
    const settings = getSettings();
    
    // עדכון הגדרות
    settings.companyName = companyName;
    settings.workdayStart = workdayStart;
    settings.workdayEnd = workdayEnd;
    
    // שמירת הגדרות
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    
    // שמירת לוג
    addSystemLog('system', 'הגדרות מערכת עודכנו', getCurrentAdmin().id);
    
    // הודעה למשתמש
    alert('הגדרות המערכת נשמרו בהצלחה');
}

/**
 * פתיחת מודל להוספת מנהל מערכת
 */
function openAddAdminModal() {
    // פה יש להוסיף קוד ליצירת חלון להוספת מנהל מערכת
    // במערכת מלאה יש ליצור מודל דומה למודל של עובדים
    
    // לדוגמה פשוטה, נשתמש ב-prompt לקבלת נתונים
    const username = prompt('הזן שם משתמש למנהל חדש:');
    if (!username) return;
    
    const password = prompt('הזן סיסמה:');
    if (!password) return;
    
    const name = prompt('הזן שם מלא:');
    if (!name) return;
    
    const email = prompt('הזן אימייל (אופציונלי):');
    const role = prompt('הזן תפקיד (אופציונלי):');
    
    // קבלת רשימת מנהלים
    const admins = getAdmins();
    
    // בדיקה אם שם המשתמש כבר קיים
    if (admins.some(admin => admin.username === username)) {
        alert('שם משתמש כבר קיים במערכת');
        return;
    }
    
    // יצירת מנהל חדש
    const newAdmin = {
        id: generateId(admins),
        username,
        password,
        name,
        email,
        role
    };
    
    // הוספת המנהל לרשימה
    admins.push(newAdmin);
    
    // שמירת הרשימה המעודכנת
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
    
    // שמירת לוג
    addSystemLog('system', `מנהל חדש "${name}" נוסף למערכת`, getCurrentAdmin().id);
    
    // רענון רשימת המנהלים
    loadAdminUsers();
}

/**
 * פתיחת מודל לעריכת מנהל מערכת
 */
function openEditAdminModal(adminId) {
    // קבלת פרטי המנהל
    const admin = getAdminById(adminId);
    if (!admin) return;
    
    // לדוגמה פשוטה, נשתמש ב-prompt לעריכת נתונים
    const name = prompt('שם מלא:', admin.name);
    if (!name) return;
    
    const email = prompt('אימייל:', admin.email || '');
    const role = prompt('תפקיד:', admin.role || '');
    
    // בדיקה אם לשנות סיסמה
    const changePassword = confirm('האם לשנות את הסיסמה?');
    let password = admin.password;
    
    if (changePassword) {
        const newPassword = prompt('הזן סיסמה חדשה:');
        if (newPassword) {
            password = newPassword;
        }
    }
    
    // קבלת רשימת מנהלים
    const admins = getAdmins();
    
    // עדכון פרטי המנהל
    const adminIndex = admins.findIndex(a => a.id === adminId);
    
    if (adminIndex !== -1) {
        admins[adminIndex].name = name;
        admins[adminIndex].email = email;
        admins[adminIndex].role = role;
        admins[adminIndex].password = password;
        
        // שמירת הרשימה המעודכנת
        localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
        
        // שמירת לוג
        addSystemLog('system', `פרטי מנהל "${name}" עודכנו`, getCurrentAdmin().id);
        
        // רענון רשימת המנהלים
        loadAdminUsers();
    }
}

/**
 * אישור מחיקת מנהל מערכת
 */
function confirmDeleteAdmin(adminId) {
    // מניעת מחיקת המנהל האחרון
    const admins = getAdmins();
    if (admins.length <= 1) {
        alert('לא ניתן למחוק את מנהל המערכת האחרון');
        return;
    }
    
    // קבלת פרטי המנהל
    const admin = getAdminById(adminId);
    if (!admin) return;
    
    // בדיקה אם מדובר במנהל הנוכחי
    const currentAdmin = getCurrentAdmin();
    if (currentAdmin && currentAdmin.id === adminId) {
        alert('לא ניתן למחוק את המנהל המחובר כעת');
        return;
    }
    
    // אישור מחיקה
    if (confirm(`האם אתה בטוח שברצונך למחוק את המנהל "${admin.name}"?`)) {
        deleteAdmin(adminId);
    }
}

/**
 * מחיקת מנהל מערכת
 */
function deleteAdmin(adminId) {
    // קבלת רשימת מנהלים
    const admins = getAdmins();
    
    // קבלת פרטי המנהל
    const adminToDelete = getAdminById(adminId);
    
    // הסרת המנהל מהרשימה
    const updatedAdmins = admins.filter(admin => admin.id !== adminId);
    
    // שמירת הרשימה המעודכנת
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(updatedAdmins));
    
    // שמירת לוג
    addSystemLog('system', `מנהל "${adminToDelete.name}" נמחק מהמערכת`, getCurrentAdmin().id);
    
    // רענון רשימת המנהלים
    loadAdminUsers();
}

/**
 * יצירת גיבוי למערכת
 */
function createBackup() {
    // יצירת אובייקט גיבוי
    const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        settings: JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || '{}'),
        employees: JSON.parse(localStorage.getItem(STORAGE_KEY_EMPLOYEES) || '[]'),
        admins: JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS) || '[]'),
        attendance: JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE) || '[]'),
        productionLines: JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCTION_LINES) || '[]'),
        inventory: JSON.parse(localStorage.getItem(STORAGE_KEY_INVENTORY) || '[]'),
        orders: JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]'),
        logs: JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '[]')
    };
    
    // המרה למחרוזת JSON
    const backupJson = JSON.stringify(backupData, null, 2);
    
    // יצירת Blob
    const blob = new Blob([backupJson], { type: 'application/json' });
    
    // יצירת קישור להורדה
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // יצירת שם קובץ
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const timeString = `${today.getHours().toString().padStart(2, '0')}-${today.getMinutes().toString().padStart(2, '0')}`;
    
    a.download = `backup_pesach_system_${dateString}_${timeString}.json`;
    
    // הוספה לדף, הפעלה והסרה
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // שמירת לוג
    addSystemLog('system', 'גיבוי מערכת נוצר והורד', getCurrentAdmin().id);
}

/**
 * פתיחת חלון לבחירת קובץ שחזור
 */
function openRestoreBackup() {
    // יצירת אלמנט קלט קובץ
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // הגדרת אירוע לטעינת קובץ
    fileInput.addEventListener('change', event => {
        const file = event.target.files[0];
        if (!file) return;
        
        // קריאת הקובץ
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // וידוא תקינות הגיבוי
                if (!validateBackup(backupData)) {
                    alert('קובץ הגיבוי אינו תקין או חסרים בו נתונים חיוניים');
                    return;
                }
                
                // אישור לפני שחזור
                if (confirm('שחזור גיבוי יחליף את כל נתוני המערכת הנוכחיים. האם להמשיך?')) {
                    restoreBackup(backupData);
                }
            } catch (error) {
                alert(`שגיאה בקריאת קובץ הגיבוי: ${error.message}`);
            }
        };
        reader.readAsText(file);
    });
    
    // הפעלת בחירת קובץ
    fileInput.click();
}

/**
 * בדיקת תקינות קובץ גיבוי
 */
function validateBackup(backupData) {
    // בדיקת קיום מפתחות נדרשים
    const requiredKeys = ['settings', 'employees', 'admins', 'attendance', 'productionLines', 'inventory', 'orders'];
    
    for (const key of requiredKeys) {
        if (!backupData[key]) {
            return false;
        }
    }
    
    // בדיקה שיש לפחות מנהל אחד
    if (!Array.isArray(backupData.admins) || backupData.admins.length === 0) {
        return false;
    }
    
    return true;
}

/**
 * שחזור נתונים מגיבוי
 */
function restoreBackup(backupData) {
    // שמירת הנתונים
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(backupData.settings));
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(backupData.employees));
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(backupData.admins));
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(backupData.attendance));
    localStorage.setItem(STORAGE_KEY_PRODUCTION_LINES, JSON.stringify(backupData.productionLines));
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(backupData.inventory));
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(backupData.orders));
    
    // שמירת הלוגים הקיימים ואיחוד עם לוגים מהגיבוי
    const currentLogs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '[]');
    const restoredLogs = backupData.logs || [];
    
    // מיזוג הלוגים
    const mergedLogs = [...currentLogs];
    
    // הוספת לוג רק אם אינו קיים כבר (לפי מזהה)
    const existingLogIds = new Set(currentLogs.map(log => log.id));
    
    for (const log of restoredLogs) {
        if (!existingLogIds.has(log.id)) {
            mergedLogs.push(log);
            existingLogIds.add(log.id);
        }
    }
    
    // שמירת הלוגים המאוחדים
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(mergedLogs));
    
    // הוספת לוג על השחזור
    addSystemLog('system', 'נתוני מערכת שוחזרו מגיבוי', getCurrentAdmin().id);
    
    // הודעה למשתמש
    alert('שחזור הנתונים הושלם בהצלחה. המערכת תתרענן כעת.');
    
    // רענון הדף
    window.location.reload();
}

/**
 * קבלת מנהל לפי מזהה
 */
function getAdminById(adminId) {
    const admins = getAdmins();
    return admins.find(admin => admin.id === adminId);
}