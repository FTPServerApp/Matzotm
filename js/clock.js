/**
 * שעון זמן אמת - אתר החתמת כרטיס
 * 
 * מציג שעון זמן אמת בממשק החתמת כרטיס
 */

// אלמנטים
const clockElement = document.getElementById('current-time');

// אתחול השעון
document.addEventListener('DOMContentLoaded', initClock);

/**
 * אתחול השעון
 */
function initClock() {
    // עדכון שעה ראשוני
    updateClock();
    
    // עדכון השעה כל שנייה
    setInterval(updateClock, 1000);
}

/**
 * עדכון השעון
 */
function updateClock() {
    if (clockElement) {
        const now = new Date();
        
        // פורמט השעה בעברית
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        const timeString = now.toLocaleString('he-IL', options);
        clockElement.textContent = timeString;
    }
}

/**
 * פונקציה עזר לפורמט של שעה
 */
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * פונקציה עזר לפורמט של תאריך
 */
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

/**
 * המרת תאריך למחרוזת בפורמט ISO
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
