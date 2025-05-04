/**
 * מערכת ייצוא נתונים - ממשק ניהול
 * 
 * מטפל בייצוא נתונים לפורמטים שונים
 */

/**
 * ייצוא נתונים לאקסל
 * 
 * @param {Array} data נתונים לייצוא
 * @param {Array} headers כותרות העמודות
 * @param {Array} columnWidths רוחב עמודות (אופציונלי)
 * @param {string} sheetName שם הגיליון
 * @param {string} fileName שם הקובץ (ללא סיומת)
 */
function exportToExcel(data, headers, columnWidths, sheetName, fileName) {
    // בדיקת תקינות
    if (!Array.isArray(data) || !Array.isArray(headers)) {
        console.error('נתונים לא תקינים לייצוא');
        return;
    }
    
    // יצירת מערך עם כותרות
    const exportData = [headers, ...data];
    
    // יצירת גיליון אקסל
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // הגדרת רוחב עמודות
    if (Array.isArray(columnWidths)) {
        ws['!cols'] = columnWidths.map(width => ({ wch: width }));
    }
    
    // הוספת גיליון לקובץ
    XLSX.utils.book_append_sheet(wb, ws, sheetName || 'גיליון1');
    
    // הכנת שם קובץ
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const fullFileName = `${fileName || 'export'}_${dateString}.xlsx`;
    
    // הורדת הקובץ
    XLSX.writeFile(wb, fullFileName);
    
    // שמירת לוג
    addSystemLog('export', `הנתונים יוצאו לקובץ אקסל: ${fullFileName}`, getCurrentAdmin().id);
    
    return fullFileName;
}

/**
 * ייצוא נתונים ל-JSON
 * 
 * @param {Object|Array} data נתונים לייצוא
 * @param {string} fileName שם הקובץ (ללא סיומת)
 */
function exportToJSON(data, fileName) {
    // בדיקת תקינות
    if (!data) {
        console.error('נתונים לא תקינים לייצוא');
        return;
    }
    
    // המרה למחרוזת JSON
    const jsonString = JSON.stringify(data, null, 2);
    
    // יצירת Blob
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // יצירת קישור להורדה
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // הכנת שם קובץ
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const fullFileName = `${fileName || 'export'}_${dateString}.json`;
    
    a.download = fullFileName;
    
    // הוספה לדף, הפעלה והסרה
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // שמירת לוג
    addSystemLog('export', `הנתונים יוצאו לקובץ JSON: ${fullFileName}`, getCurrentAdmin().id);
    
    return fullFileName;
}

/**
 * הכנת נתוני עובדים לייצוא
 */
function prepareEmployeesForExport() {
    const employees = getEmployees();
    
    // יצירת מערך נתונים להצגה באקסל
    const data = employees.map(employee => [
        employee.id,
        employee.name,
        employee.role,
        employee.email,
        employee.phone || '',
        employee.username,
        employee.status === 'active' ? 'פעיל' : 'לא פעיל'
    ]);
    
    const headers = ['מזהה', 'שם מלא', 'תפקיד', 'אימייל', 'טלפון', 'שם משתמש', 'סטטוס'];
    const columnWidths = [10, 20, 20, 25, 15, 15, 10];
    
    return { data, headers, columnWidths };
}

/**
 * הכנת נתוני מלאי לייצוא
 */
function prepareInventoryForExport() {
    const inventory = getInventory();
    
    // המרת קטגוריות לעברית
    const categoryTranslation = {
        'raw': 'חומרי גלם',
        'finished': 'מוצרים מוגמרים',
        'packaging': 'אריזות',
        'equipment': 'ציוד'
    };
    
    // יצירת מערך נתונים להצגה באקסל
    const data = inventory.map(item => [
        item.sku,
        item.name,
        categoryTranslation[item.category] || item.category,
        item.quantity,
        item.price.toFixed(2),
        item.supplier || ''
    ]);
    
    const headers = ['מק"ט', 'שם פריט', 'קטגוריה', 'כמות במלאי', 'מחיר יחידה', 'ספק'];
    const columnWidths = [15, 25, 15, 15, 15, 20];
    
    return { data, headers, columnWidths };
}

/**
 * הכנת נתוני הזמנות לייצוא
 */
function prepareOrdersForExport() {
    const orders = getOrders();
    
    // המרת סטטוסים לעברית
    const statusTranslation = {
        'new': 'חדש',
        'processing': 'בטיפול',
        'delivered': 'נמסר',
        'canceled': 'בוטל'
    };
    
    // יצירת מערך נתונים להצגה באקסל
    const data = orders.map(order => [
        order.id,
        order.supplier,
        new Date(order.date).toLocaleDateString('he-IL'),
        order.amount.toFixed(2),
        statusTranslation[order.status] || order.status,
        order.items.length
    ]);
    
    const headers = ['מס\' הזמנה', 'ספק', 'תאריך', 'סכום', 'סטטוס', 'מספר פריטים'];
    const columnWidths = [10, 25, 15, 15, 15, 15];
    
    return { data, headers, columnWidths };
}

/**
 * הכנת נתוני נוכחות לייצוא
 */
function prepareAttendanceForExport() {
    const attendance = getAttendanceRecords();
    const employees = getEmployees();
    
    // יצירת מערך נתונים להצגה באקסל
    const data = attendance.map(record => {
        // קבלת שם העובד
        const employee = employees.find(emp => emp.id === record.employeeId);
        const employeeName = employee ? employee.name : `עובד #${record.employeeId}`;
        
        // המרת תאריכים
        const date = new Date(record.date).toLocaleDateString('he-IL');
        const punchIn = record.punchIn ? new Date(record.punchIn).toLocaleTimeString('he-IL') : '-';
        const punchOut = record.punchOut ? new Date(record.punchOut).toLocaleTimeString('he-IL') : '-';
        
        // חישוב שעות עבודה
        let totalHours = '-';
        if (record.punchIn && record.punchOut) {
            const inTime = new Date(record.punchIn);
            const outTime = new Date(record.punchOut);
            const diffMs = outTime - inTime;
            const diffHours = diffMs / (1000 * 60 * 60);
            totalHours = diffHours.toFixed(2);
        }
        
        return [
            employeeName,
            date,
            punchIn,
            punchOut,
            totalHours,
            record.note || ''
        ];
    });
    
    const headers = ['עובד', 'תאריך', 'כניסה', 'יציאה', 'סה"כ שעות', 'הערות'];
    const columnWidths = [20, 15, 15, 15, 15, 25];
    
    return { data, headers, columnWidths };
}

/**
 * הכנת נתוני פסי ייצור לייצוא
 */
function prepareProductionLinesForExport() {
    const productionLines = getProductionLines();
    const employees = getEmployees();
    
    // המרת סטטוסים לעברית
    const statusTranslation = {
        'active': 'פעיל',
        'maintenance': 'בתחזוקה',
        'inactive': 'לא פעיל'
    };
    
    // יצירת מערך נתונים להצגה באקסל
    const data = productionLines.map(line => {
        // קבלת שם המנהל
        const manager = employees.find(emp => emp.id === line.manager);
        const managerName = manager ? manager.name : '';
        
        // חישוב אחוז הייצור
        const productionPercent = line.capacity > 0 ? 
            Math.round((line.currentProduction / line.capacity) * 100) : 0;
        
        return [
            line.id,
            line.name,
            managerName,
            line.capacity,
            line.currentProduction,
            `${productionPercent}%`,
            statusTranslation[line.status] || line.status
        ];
    });
    
    const headers = ['מזהה', 'שם פס ייצור', 'מנהל אחראי', 'קיבולת', 'ייצור נוכחי', 'ניצולת', 'סטטוס'];
    const columnWidths = [10, 20, 20, 15, 15, 10, 15];
    
    return { data, headers, columnWidths };
}