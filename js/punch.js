/**
 * מערכת החתמת כרטיס
 * 
 * מטפל ברישום נוכחות של עובדים (כניסה ויציאה)
 */

// קבועים ומשתנים גלובליים
const STORAGE_KEY_ATTENDANCE = 'pesach_attendance';

// אלמנטים
const punchInBtn = document.getElementById('punch-in');
const punchOutBtn = document.getElementById('punch-out');
const lastPunchEl = document.getElementById('last-punch');
const punchStatusEl = document.getElementById('punch-status');

// אתחול
document.addEventListener('DOMContentLoaded', initPunchSystem);

/**
 * אתחול מערכת ההחתמה
 */
function initPunchSystem() {
    // אתחול נתוני נוכחות אם לא קיימים
    initAttendanceData();
    
    // הגדרת אירועים
    punchInBtn.addEventListener('click', handlePunchIn);
    punchOutBtn.addEventListener('click', handlePunchOut);
    
    // עדכון מצב הכפתורים בעת טעינת הדף
    updatePunchButtonsState();
}

/**
 * אתחול נתוני נוכחות
 */
function initAttendanceData() {
    if (!localStorage.getItem(STORAGE_KEY_ATTENDANCE)) {
        localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify([]));
    }
}

/**
 * טיפול בהחתמת כניסה
 */
function handlePunchIn() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const now = new Date();
    const todayStr = getCurrentDateString();
    
    // בדיקה אם יש כבר החתמת כניסה להיום
    const todayRecord = findTodayAttendance(currentUser.id);
    
    if (todayRecord && todayRecord.punchIn) {
        punchStatusEl.textContent = 'כבר החתמת כניסה היום';
        punchStatusEl.style.color = 'var(--warning-color)';
        return;
    }
    
    // יצירת או עדכון רשומת נוכחות
    if (todayRecord) {
        todayRecord.punchIn = now.toISOString();
        updateAttendanceRecord(todayRecord);
    } else {
        const newRecord = {
            id: generateAttendanceId(),
            employeeId: currentUser.id,
            date: todayStr,
            punchIn: now.toISOString(),
            punchOut: null,
            note: ''
        };
        addAttendanceRecord(newRecord);
    }
    
    // שמירת לוג
    addSystemLog('attendance', `משתמש ${currentUser.name} החתים כניסה`, currentUser.id);
    
    // עדכון הממשק
    punchStatusEl.textContent = 'החתמת כניסה נרשמה בהצלחה';
    punchStatusEl.style.color = 'var(--success-color)';
    updateLastPunch('כניסה', now);
    updatePunchButtonsState();
}

/**
 * טיפול בהחתמת יציאה
 */
function handlePunchOut() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const now = new Date();
    
    // בדיקה אם יש החתמת כניסה להיום
    const todayRecord = findTodayAttendance(currentUser.id);
    
    if (!todayRecord || !todayRecord.punchIn) {
        punchStatusEl.textContent = 'לא ניתן להחתים יציאה ללא החתמת כניסה';
        punchStatusEl.style.color = 'var(--danger-color)';
        return;
    }
    
    if (todayRecord.punchOut) {
        punchStatusEl.textContent = 'כבר החתמת יציאה היום';
        punchStatusEl.style.color = 'var(--warning-color)';
        return;
    }
    
    // עדכון רשומת הנוכחות
    todayRecord.punchOut = now.toISOString();
    updateAttendanceRecord(todayRecord);
    
    // שמירת לוג
    addSystemLog('attendance', `משתמש ${currentUser.name} החתים יציאה`, currentUser.id);
    
    // עדכון הממשק
    punchStatusEl.textContent = 'החתמת יציאה נרשמה בהצלחה';
    punchStatusEl.style.color = 'var(--success-color)';
    updateLastPunch('יציאה', now);
    updatePunchButtonsState();
}

/**
 * עדכון מצב כפתורי ההחתמה
 */
function updatePunchButtonsState() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const todayRecord = findTodayAttendance(currentUser.id);
    
    if (!todayRecord || !todayRecord.punchIn) {
        // אין החתמת כניסה
        punchInBtn.disabled = false;
        punchOutBtn.disabled = true;
        
        punchInBtn.classList.remove('btn-disabled');
        punchOutBtn.classList.add('btn-disabled');
    } else if (todayRecord.punchIn && !todayRecord.punchOut) {
        // יש החתמת כניסה אך אין החתמת יציאה
        punchInBtn.disabled = true;
        punchOutBtn.disabled = false;
        
        punchInBtn.classList.add('btn-disabled');
        punchOutBtn.classList.remove('btn-disabled');
        
        updateLastPunch('כניסה', new Date(todayRecord.punchIn));
    } else {
        // יש גם החתמת כניסה וגם החתמת יציאה
        punchInBtn.disabled = true;
        punchOutBtn.disabled = true;
        
        punchInBtn.classList.add('btn-disabled');
        punchOutBtn.classList.add('btn-disabled');
        
        updateLastPunch('יציאה', new Date(todayRecord.punchOut));
    }
}

/**
 * עדכון הצגת ההחתמה האחרונה
 */
function updateLastPunch(type, time) {
    const formattedTime = formatTime(time);
    lastPunchEl.textContent = `החתמה אחרונה: ${type} - ${formattedTime}`;
}

/**
 * מציאת רשומת נוכחות להיום
 */
function findTodayAttendance(employeeId) {
    const attendance = getAttendanceRecords();
    const todayStr = getCurrentDateString();
    
    return attendance.find(record => 
        record.employeeId === employeeId && 
        record.date === todayStr
    );
}

/**
 * קבלת כל רשומות הנוכחות
 */
function getAttendanceRecords() {
    const attendanceJson = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
    return attendanceJson ? JSON.parse(attendanceJson) : [];
}

/**
 * הוספת רשומת נוכחות חדשה
 */
function addAttendanceRecord(record) {
    const attendance = getAttendanceRecords();
    attendance.push(record);
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendance));
}

/**
 * עדכון רשומת נוכחות קיימת
 */
function updateAttendanceRecord(updatedRecord) {
    const attendance = getAttendanceRecords();
    const index = attendance.findIndex(record => record.id === updatedRecord.id);
    
    if (index !== -1) {
        attendance[index] = updatedRecord;
        localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendance));
    }
}

/**
 * יצירת מזהה חדש לרשומת נוכחות
 */
function generateAttendanceId() {
    const attendance = getAttendanceRecords();
    
    if (attendance.length === 0) {
        return 1;
    }
    
    const maxId = Math.max(...attendance.map(record => record.id));
    return maxId + 1;
}
