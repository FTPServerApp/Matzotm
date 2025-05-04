/**
 * ניהול פסי ייצור - ממשק ניהול
 * 
 * מטפל בהצגה, הוספה, עריכה וניהול של פסי ייצור
 */

// אלמנטים
const productionLinesContainer = document.querySelector('.production-lines');
const addLineBtn = document.getElementById('add-line-btn');
const productionLineModal = document.getElementById('production-line-modal');
const lineModalTitle = document.getElementById('line-modal-title');
const productionLineForm = document.getElementById('production-line-form');
const lineManagerSelect = document.getElementById('line-manager');
const saveLineBtn = document.getElementById('save-line');

// אתחול
document.addEventListener('DOMContentLoaded', initProductionPage);

/**
 * אתחול דף פסי ייצור
 */
function initProductionPage() {
    // הגדרת אירועים
    addLineBtn.addEventListener('click', () => openProductionLineModal());
    saveLineBtn.addEventListener('click', saveProductionLine);
}

/**
 * טעינת נתוני פסי ייצור
 */
function loadProductionData() {
    // קבלת פסי ייצור
    const productionLines = getProductionLines();
    
    // הצגת פסי הייצור
    renderProductionLines(productionLines);
    
    // מילוי רשימת מנהלים לטופס
    populateManagerSelect();
}

/**
 * הצגת פסי ייצור
 */
function renderProductionLines(lines) {
    // ניקוי המכל
    productionLinesContainer.innerHTML = '';
    
    // בדיקה אם אין פסי ייצור
    if (lines.length === 0) {
        productionLinesContainer.innerHTML = '<p class="no-data">לא נמצאו פסי ייצור</p>';
        return;
    }
    
    // הוספת כרטיסים לכל פס ייצור
    lines.forEach(line => {
        // קבלת שם המנהל
        const manager = getEmployeeById(line.manager);
        const managerName = manager ? manager.name : 'לא הוקצה';
        
        // חישוב אחוז הייצור הנוכחי
        const productionPercent = Math.round((line.currentProduction / line.capacity) * 100);
        
        // המרת סטטוס לעברית ולמחלקת סגנון
        let statusText = '';
        let statusClass = '';
        
        switch (line.status) {
            case 'active':
                statusText = 'פעיל';
                statusClass = 'active';
                break;
            case 'maintenance':
                statusText = 'בתחזוקה';
                statusClass = 'maintenance';
                break;
            case 'inactive':
                statusText = 'לא פעיל';
                statusClass = 'inactive';
                break;
        }
        
        // יצירת כרטיס פס ייצור
        const lineCard = document.createElement('div');
        lineCard.className = 'production-line-card';
        lineCard.innerHTML = `
            <div class="line-header">
                <h3>${line.name}</h3>
                <span class="line-status ${statusClass}">${statusText}</span>
            </div>
            <div class="line-body">
                <p class="manager"><i class="fas fa-user-tie"></i> מנהל: ${managerName}</p>
                <p><i class="fas fa-layer-group"></i> קיבולת יומית: ${line.capacity} יחידות</p>
                <p><i class="fas fa-chart-line"></i> ייצור נוכחי: ${line.currentProduction} יחידות</p>
                <div class="line-progress">
                    <div class="progress-label">ניצולת: ${productionPercent}%</div>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${productionPercent}%"></div>
                    </div>
                </div>
            </div>
            <div class="line-footer">
                <button class="btn btn-outline btn-sm edit-line" data-id="${line.id}"><i class="fas fa-edit"></i> עריכה</button>
                <button class="btn btn-outline btn-sm update-production" data-id="${line.id}"><i class="fas fa-chart-bar"></i> עדכון ייצור</button>
                <button class="btn btn-danger btn-sm delete-line" data-id="${line.id}"><i class="fas fa-trash"></i> מחיקה</button>
            </div>
        `;
        
        productionLinesContainer.appendChild(lineCard);
    });
    
    // הוספת אירועים לכפתורים
    attachProductionLineEvents();
}

/**
 * הוספת אירועים לפעולות על פסי ייצור
 */
function attachProductionLineEvents() {
    // כפתורי עריכה
    document.querySelectorAll('.edit-line').forEach(button => {
        button.addEventListener('click', () => {
            const lineId = parseInt(button.dataset.id);
            openProductionLineModal(lineId);
        });
    });
    
    // כפתורי עדכון ייצור
    document.querySelectorAll('.update-production').forEach(button => {
        button.addEventListener('click', () => {
            const lineId = parseInt(button.dataset.id);
            promptUpdateProduction(lineId);
        });
    });
    
    // כפתורי מחיקה
    document.querySelectorAll('.delete-line').forEach(button => {
        button.addEventListener('click', () => {
            const lineId = parseInt(button.dataset.id);
            confirmDeleteProductionLine(lineId);
        });
    });
}

/**
 * מילוי רשימת מנהלים
 */
function populateManagerSelect() {
    // ניקוי אפשרויות קיימות
    lineManagerSelect.innerHTML = '<option value="">בחר מנהל</option>';
    
    // קבלת רשימת העובדים
    const employees = getEmployees();
    
    // סינון רשימת העובדים הפעילים
    const activeEmployees = employees.filter(employee => employee.status === 'active');
    
    // הוספת אפשרויות לכל עובד
    activeEmployees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        lineManagerSelect.appendChild(option);
    });
}

/**
 * פתיחת מודל להוספה/עריכה של פס ייצור
 */
function openProductionLineModal(lineId = null) {
    // איפוס הטופס
    productionLineForm.reset();
    document.getElementById('line-id').value = '';
    
    if (lineId) {
        // מצב עריכה
        const line = getProductionLineById(lineId);
        if (line) {
            lineModalTitle.textContent = 'עריכת פס ייצור';
            
            // מילוי השדות בטופס
            document.getElementById('line-id').value = line.id;
            document.getElementById('line-name').value = line.name;
            document.getElementById('line-manager').value = line.manager;
            document.getElementById('line-capacity').value = line.capacity;
            document.getElementById('line-status').value = line.status;
        }
    } else {
        // מצב הוספה
        lineModalTitle.textContent = 'הוספת פס ייצור חדש';
    }
    
    // הצגת המודל
    productionLineModal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
}

/**
 * שמירת פס ייצור (הוספה/עריכה)
 */
function saveProductionLine() {
    // קבלת נתונים מהטופס
    const lineId = document.getElementById('line-id').value;
    const name = document.getElementById('line-name').value;
    const manager = document.getElementById('line-manager').value;
    const capacity = parseInt(document.getElementById('line-capacity').value);
    const status = document.getElementById('line-status').value;
    
    // וידוא תקינות
    if (!name || !capacity) {
        alert('יש למלא את כל השדות החובה');
        return;
    }
    
    // קבלת פסי הייצור
    const productionLines = getProductionLines();
    
    if (lineId) {
        // עדכון פס ייצור קיים
        const lineIndex = productionLines.findIndex(line => line.id === parseInt(lineId));
        
        if (lineIndex !== -1) {
            // שמירת ייצור נוכחי
            const currentProduction = productionLines[lineIndex].currentProduction || 0;
            
            // עדכון נתוני פס הייצור
            productionLines[lineIndex].name = name;
            productionLines[lineIndex].manager = manager ? parseInt(manager) : null;
            productionLines[lineIndex].capacity = capacity;
            productionLines[lineIndex].status = status;
            productionLines[lineIndex].currentProduction = currentProduction;
            
            // שמירת לוג
            addSystemLog('production', `פס ייצור "${name}" עודכן`, getCurrentAdmin().id);
        }
    } else {
        // הוספת פס ייצור חדש
        const newLine = {
            id: generateId(productionLines),
            name,
            manager: manager ? parseInt(manager) : null,
            capacity,
            status,
            currentProduction: 0
        };
        
        productionLines.push(newLine);
        
        // שמירת לוג
        addSystemLog('production', `פס ייצור חדש "${name}" נוסף למערכת`, getCurrentAdmin().id);
    }
    
    // שמירת הנתונים המעודכנים
    localStorage.setItem(STORAGE_KEY_PRODUCTION_LINES, JSON.stringify(productionLines));
    
    // סגירת המודל
    closeModal();
    
    // רענון תצוגת פסי הייצור
    loadProductionData();
}

/**
 * בקשה לעדכון ייצור
 */
function promptUpdateProduction(lineId) {
    const line = getProductionLineById(lineId);
    
    if (!line) {
        return;
    }
    
    // בדיקה אם פס הייצור פעיל
    if (line.status !== 'active') {
        alert('לא ניתן לעדכן ייצור לפס שאינו פעיל');
        return;
    }
    
    // בקשת ערך חדש
    const newProduction = prompt(`הזן את כמות הייצור הנוכחית עבור "${line.name}":`, line.currentProduction);
    
    // בדיקה אם המשתמש ביטל או הזין ערך לא תקין
    if (newProduction === null || newProduction === '') {
        return;
    }
    
    // המרה למספר
    const productionValue = parseInt(newProduction);
    
    // בדיקת תקינות
    if (isNaN(productionValue) || productionValue < 0) {
        alert('יש להזין מספר חיובי');
        return;
    }
    
    // בדיקה אם הערך גדול מהקיבולת
    if (productionValue > line.capacity) {
        if (!confirm(`הערך שהזנת (${productionValue}) גדול מהקיבולת המקסימלית (${line.capacity}). האם להמשיך?`)) {
            return;
        }
    }
    
    // עדכון ייצור נוכחי
    updateProductionValue(lineId, productionValue);
}

/**
 * עדכון ערך ייצור
 */
function updateProductionValue(lineId, newValue) {
    // קבלת פסי הייצור
    const productionLines = getProductionLines();
    const lineIndex = productionLines.findIndex(line => line.id === lineId);
    
    if (lineIndex !== -1) {
        // עדכון ערך הייצור
        productionLines[lineIndex].currentProduction = newValue;
        
        // שמירת הנתונים המעודכנים
        localStorage.setItem(STORAGE_KEY_PRODUCTION_LINES, JSON.stringify(productionLines));
        
        // שמירת לוג
        const lineName = productionLines[lineIndex].name;
        addSystemLog('production', `ייצור עודכן לפס "${lineName}" (${newValue} יחידות)`, getCurrentAdmin().id);
        
        // רענון תצוגת פסי הייצור
        loadProductionData();
    }
}

/**
 * אישור מחיקת פס ייצור
 */
function confirmDeleteProductionLine(lineId) {
    const line = getProductionLineById(lineId);
    
    if (!line) {
        return;
    }
    
    if (confirm(`האם אתה בטוח שברצונך למחוק את פס הייצור "${line.name}"?`)) {
        deleteProductionLine(lineId);
    }
}

/**
 * מחיקת פס ייצור
 */
function deleteProductionLine(lineId) {
    // קבלת פסי הייצור
    const productionLines = getProductionLines();
    const lineToDelete = getProductionLineById(lineId);
    
    if (!lineToDelete) {
        return;
    }
    
    // הסרת פס הייצור מהרשימה
    const updatedLines = productionLines.filter(line => line.id !== lineId);
    
    // שמירת הרשימה המעודכנת
    localStorage.setItem(STORAGE_KEY_PRODUCTION_LINES, JSON.stringify(updatedLines));
    
    // שמירת לוג
    addSystemLog('production', `פס ייצור "${lineToDelete.name}" נמחק מהמערכת`, getCurrentAdmin().id);
    
    // רענון תצוגת פסי הייצור
    loadProductionData();
}

/**
 * קבלת פס ייצור לפי מזהה
 */
function getProductionLineById(lineId) {
    const productionLines = getProductionLines();
    return productionLines.find(line => line.id === lineId);
}