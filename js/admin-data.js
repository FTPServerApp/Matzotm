/**
 * טיפול בנתונים משותפים - ממשק ניהול
 * 
 * מכיל פונקציות כלליות לטיפול בנתונים המשותפים בין מודולים שונים
 */

// טיפול במודלים
document.addEventListener('DOMContentLoaded', initModals);

/**
 * אתחול מודלים
 */
function initModals() {
    // אירוע סגירה לכפתורי סגירה
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            // מציאת המודל הקרוב
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
                modalBackdrop.classList.add('hidden');
            }
        });
    });
    
    // סגירת מודל בלחיצה על הרקע
    modalBackdrop.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        modalBackdrop.classList.add('hidden');
    });
    
    // מניעת סגירה בלחיצה על תוכן המודל
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', event => {
            event.stopPropagation();
        });
    });
}

/**
 * סגירת כל המודלים
 */
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    modalBackdrop.classList.add('hidden');
}

/**
 * המרת תאריך למחרוזת בפורמט ISO (YYYY-MM-DD)
 */
function toISODateString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * קבלת תאריך נוכחי בפורמט ISO
 */
function getCurrentDateString() {
    return toISODateString(new Date());
}

/**
 * פורמט מספר לשני ספרות אחרי הנקודה
 */
function formatNumber(number) {
    return Number(number).toFixed(2);
}

/**
 * יצירת מזהה חדש
 */
function generateId(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return 1;
    }
    
    const maxId = Math.max(...items.map(item => item.id));
    return maxId + 1;
}

/**
 * עיגול מספר לשלם הקרוב
 */
function roundNumber(number) {
    return Math.round(number);
}

/**
 * פורמט תאריך למחרוזת מקומית
 */
function formatDateLocale(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL');
}

/**
 * פורמט שעה למחרוזת מקומית
 */
function formatTimeLocale(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('he-IL');
}

/**
 * חישוב הפרש שעות בין שני תאריכים
 */
function calculateHoursDiff(startDate, endDate) {
    if (!startDate || !endDate) {
        return null;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // חישוב ההפרש בשעות
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return parseFloat(diffHours.toFixed(2));
}

/**
 * סינון וחיפוש במערך אובייקטים
 */
function filterArray(array, searchTerm, fields) {
    if (!searchTerm || !Array.isArray(fields) || !Array.isArray(array)) {
        return array;
    }
    
    const term = searchTerm.toLowerCase();
    
    return array.filter(item => {
        return fields.some(field => {
            if (item[field] === undefined) {
                return false;
            }
            
            return String(item[field]).toLowerCase().includes(term);
        });
    });
}

/**
 * בדיקה אם שם משתמש תקין
 */
function isValidUsername(username) {
    // בדיקת אורך
    if (!username || username.length < 3) {
        return false;
    }
    
    // ביטוי רגולרי: רק אותיות באנגלית, מספרים וקו תחתון
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(username);
}

/**
 * בדיקה אם אימייל תקין
 */
function isValidEmail(email) {
    if (!email) {
        return false;
    }
    
    // ביטוי רגולרי בסיסי לבדיקת אימייל
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * מיון מערך אובייקטים לפי מפתח
 */
function sortArrayByKey(array, key, descending = false) {
    if (!Array.isArray(array) || !key) {
        return array;
    }
    
    return [...array].sort((a, b) => {
        if (a[key] < b[key]) {
            return descending ? 1 : -1;
        }
        if (a[key] > b[key]) {
            return descending ? -1 : 1;
        }
        return 0;
    });
}

/**
 * גישה וביצוע פעולות ב-localStorage
 */
const localStorageUtil = {
    /**
     * קבלת נתונים מ-localStorage
     */
    get: function(key, defaultValue = null) {
        const data = localStorage.getItem(key);
        if (data === null) {
            return defaultValue;
        }
        
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error(`שגיאה בקריאת נתונים מ-localStorage: ${error}`);
            return defaultValue;
        }
    },
    
    /**
     * שמירת נתונים ב-localStorage
     */
    set: function(key, value) {
        try {
            const data = JSON.stringify(value);
            localStorage.setItem(key, data);
            return true;
        } catch (error) {
            console.error(`שגיאה בשמירת נתונים ב-localStorage: ${error}`);
            return false;
        }
    },
    
    /**
     * מחיקת נתונים מ-localStorage
     */
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`שגיאה במחיקת נתונים מ-localStorage: ${error}`);
            return false;
        }
    },
    
    /**
     * בדיקה אם המפתח קיים ב-localStorage
     */
    exists: function(key) {
        return localStorage.getItem(key) !== null;
    },
    
    /**
     * ניקוי כל הנתונים ב-localStorage
     */
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error(`שגיאה בניקוי localStorage: ${error}`);
            return false;
        }
    }
};