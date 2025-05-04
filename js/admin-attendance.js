/**
 * ניהול דוחות נוכחות - ממשק ניהול
 * 
 * מטפל בצפייה וסינון של רשומות נוכחות
 */

// אלמנטים
const attendanceTable = document.getElementById('attendance-table').querySelector('tbody');
const employeeFilter = document.getElementById('employee-filter');
const dateFromInput = document.getElementById('date-from');
const dateToInput = document.getElementById('date-to');
const filterAttendanceBtn = document.getElementById('filter-attendance');
const exportAttendanceBtn = document.getElementById('export-attendance');

// מצב סינון נוכחי
let filteredAttendance = [];
let currentAttendanceFilter = {
    employeeId: '',
    dateFrom: '',
    dateTo: ''
};

// אתחול
document.addEventListener('DOMContentLoaded', initAttendancePage);

/**
 * אתחול דף דוחות נוכחות
 */
function initAttendancePage() {
    // הגדרת אירועים
    filterAttendanceBtn.addEventListener('click', applyAttendanceFilter);
    exportAttendanceBtn.addEventListener('click', exportAttendanceData);
}

/**
 * טעינת נתוני נוכחות
 */
function loadAttendanceData() {
    // איפוס ערכי סינון
    currentAttendanceFilter = {
        employeeId: '',
        dateFrom: '',
        dateTo: ''
    };
    
    // מילוי רשימת העובדים בסינון
    populateEmployeeFilter();
    
    // איפוס שדות תאריך
    dateFromInput.value = '';
    dateToInput.value = '';
    
    // טעינת כל רשומות הנוכחות
    const attendance = getAttendanceRecords();
    
    // סידור לפי תאריך יורד (החדש ביותר קודם)
    const sortedAttendance = [...attendance].sort((a, b) => {
        if (a.date === b.date) {
            return new Date(b.punchIn) - new Date(a.punchIn);
        }
        return new Date(b.date) - new Date(a.date);
    });
    
    filteredAttendance = sortedAttendance;
    
    // הצגת הנתונים
    renderAttendanceTable();
}

/**
 * מילוי רשימת העובדים לסינון
 */
function populateEmployeeFilter() {
    // ניקוי אפשרויות קיימות
    employeeFilter.innerHTML = '<option value="">כל העובדים</option>';
    
    // קבלת רשימת העובדים
    const employees = getEmployees();
    
    // הוספת אפשרויות לכל עובד
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        employeeFilter.appendChild(option);
    });
}

/**
 * הצגת טבלת נוכחות
 */
function renderAttendanceTable() {
    // ניקוי הטבלה
    attendanceTable.innerHTML = '';
    
    // בדיקה אם אין רשומות נוכחות
    if (filteredAttendance.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">לא נמצאו רשומות נוכחות</td>`;
        attendanceTable.appendChild(emptyRow);
        return;
    }
    
    // הוספת שורות לטבלה
    filteredAttendance.forEach(record => {
        // קבלת שם העובד
        const employee = getEmployeeById(record.employeeId);
        const employeeName = employee ? employee.name : `עובד #${record.employeeId}`;
        
        // המרת תאריכים לפורמט מקומי
        const date = new Date(record.date).toLocaleDateString('he-IL');
        const punchIn = record.punchIn ? new Date(record.punchIn).toLocaleTimeString('he-IL') : '-';
        const punchOut = record.punchOut ? new Date(record.punchOut).toLocaleTimeString('he-IL') : '-';
        
        // חישוב שעות עבודה אם יש כניסה ויציאה
        let totalHours = '-';
        if (record.punchIn && record.punchOut) {
            const inTime = new Date(record.punchIn);
            const outTime = new Date(record.punchOut);
            const diffMs = outTime - inTime;
            const diffHours = diffMs / (1000 * 60 * 60);
            totalHours = diffHours.toFixed(2);
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employeeName}</td>
            <td>${date}</td>
            <td>${punchIn}</td>
            <td>${punchOut}</td>
            <td>${totalHours}</td>
            <td>${record.note || '-'}</td>
        `;
        
        attendanceTable.appendChild(row);
    });
}

/**
 * החלת סינון על דוחות נוכחות
 */
function applyAttendanceFilter() {
    // קבלת ערכי הסינון
    const employeeId = employeeFilter.value;
    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;
    
    // עדכון מצב הסינון הנוכחי
    currentAttendanceFilter = {
        employeeId: employeeId ? parseInt(employeeId) : '',
        dateFrom,
        dateTo
    };
    
    // קבלת כל רשומות הנוכחות
    let attendance = getAttendanceRecords();
    
    // סינון לפי עובד
    if (employeeId) {
        attendance = attendance.filter(record => record.employeeId === parseInt(employeeId));
    }
    
    // סינון לפי תאריך התחלה
    if (dateFrom) {
        attendance = attendance.filter(record => record.date >= dateFrom);
    }
    
    // סינון לפי תאריך סיום
    if (dateTo) {
        attendance = attendance.filter(record => record.date <= dateTo);
    }
    
    // סידור לפי תאריך יורד (החדש ביותר קודם)
    const sortedAttendance = [...attendance].sort((a, b) => {
        if (a.date === b.date) {
            return new Date(b.punchIn) - new Date(a.punchIn);
        }
        return new Date(b.date) - new Date(a.date);
    });
    
    filteredAttendance = sortedAttendance;
    
    // הצגת הנתונים המסוננים
    renderAttendanceTable();
}

/**
 * ייצוא נתוני נוכחות לאקסל
 */
function exportAttendanceData() {
    // בדיקה אם יש נתונים לייצוא
    if (filteredAttendance.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }
    
    // הכנת נתונים לייצוא
    const exportData = [];
    
    // הוספת שורת כותרות
    exportData.push(['עובד', 'תאריך', 'שעת כניסה', 'שעת יציאה', 'סה"כ שעות', 'הערות']);
    
    // הוספת נתונים
    filteredAttendance.forEach(record => {
        // קבלת שם העובד
        const employee = getEmployeeById(record.employeeId);
        const employeeName = employee ? employee.name : `עובד #${record.employeeId}`;
        
        // המרת תאריכים לפורמט מקומי
        const date = new Date(record.date).toLocaleDateString('he-IL');
        const punchIn = record.punchIn ? new Date(record.punchIn).toLocaleTimeString('he-IL') : '-';
        const punchOut = record.punchOut ? new Date(record.punchOut).toLocaleTimeString('he-IL') : '-';
        
        // חישוב שעות עבודה אם יש כניסה ויציאה
        let totalHours = '-';
        if (record.punchIn && record.punchOut) {
            const inTime = new Date(record.punchIn);
            const outTime = new Date(record.punchOut);
            const diffMs = outTime - inTime;
            const diffHours = diffMs / (1000 * 60 * 60);
            totalHours = diffHours.toFixed(2);
        }
        
        exportData.push([
            employeeName,
            date,
            punchIn,
            punchOut,
            totalHours,
            record.note || '-'
        ]);
    });
    
    // יצירת גיליון אקסל
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // הגדרת רוחב עמודות
    const colWidths = [
        { wch: 20 }, // עובד
        { wch: 12 }, // תאריך
        { wch: 12 }, // שעת כניסה
        { wch: 12 }, // שעת יציאה
        { wch: 12 }, // סה"כ שעות
        { wch: 25 }  // הערות
    ];
    
    ws['!cols'] = colWidths;
    
    // הוספת גיליון לקובץ
    XLSX.utils.book_append_sheet(wb, ws, 'דוח נוכחות');
    
    // הכנת שם קובץ
    let fileName = 'דוח_נוכחות';
    
    // הוספת פרטי סינון לשם הקובץ
    if (currentAttendanceFilter.employeeId) {
        const employee = getEmployeeById(currentAttendanceFilter.employeeId);
        if (employee) {
            fileName += `_${employee.name.replace(/\s/g, '_')}`;
        }
    }
    
    if (currentAttendanceFilter.dateFrom) {
        fileName += `_מתאריך_${currentAttendanceFilter.dateFrom}`;
    }
    
    if (currentAttendanceFilter.dateTo) {
        fileName += `_עד_${currentAttendanceFilter.dateTo}`;
    }
    
    // הוספת התאריך הנוכחי לשם הקובץ
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    fileName += `_${dateString}`;
    
    // הורדת הקובץ
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    
    // שמירת לוג
    addSystemLog('export', 'דוח נוכחות יוצא לאקסל', getCurrentAdmin().id);
}
