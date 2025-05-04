/**
 * ניהול מלאי - ממשק ניהול
 * 
 * מטפל בהצגה, הוספה, עריכה ומחיקה של פריטי מלאי
 */

// אלמנטים
const inventoryTable = document.getElementById('inventory-table').querySelector('tbody');
const addItemBtn = document.getElementById('add-item-btn');
const searchInventoryInput = document.getElementById('search-inventory');
const inventoryItemModal = document.getElementById('inventory-item-modal');
const itemModalTitle = document.getElementById('item-modal-title');
const inventoryItemForm = document.getElementById('inventory-item-form');
const saveItemBtn = document.getElementById('save-item');
const exportInventoryBtn = document.getElementById('export-inventory');
const importInventoryBtn = document.getElementById('import-inventory');
const importModal = document.getElementById('import-modal');
const importTypeSelect = document.getElementById('import-type');
const importFileInput = document.getElementById('import-file');
const importPreview = document.getElementById('import-preview');
const processImportBtn = document.getElementById('process-import');

// מצב הטבלה
let filteredInventory = [];

// אתחול
document.addEventListener('DOMContentLoaded', initInventoryPage);

/**
 * אתחול דף ניהול מלאי
 */
function initInventoryPage() {
    // הגדרת אירועים
    addItemBtn.addEventListener('click', () => openInventoryItemModal());
    saveItemBtn.addEventListener('click', saveInventoryItem);
    searchInventoryInput.addEventListener('input', handleInventorySearch);
    exportInventoryBtn.addEventListener('click', exportInventoryData);
    importInventoryBtn.addEventListener('click', openImportModal);
    importFileInput.addEventListener('change', previewImportFile);
    processImportBtn.addEventListener('click', processImport);
}

/**
 * טעינת נתוני מלאי
 */
function loadInventoryData() {
    // קבלת פריטי מלאי
    const inventory = getInventory();
    
    // שמירת הפריטים המסוננים
    filteredInventory = [...inventory];
    
    // הצגת המלאי
    renderInventoryTable();
}

/**
 * הצגת טבלת מלאי
 */
function renderInventoryTable() {
    // ניקוי הטבלה
    inventoryTable.innerHTML = '';
    
    // בדיקה אם אין פריטים
    if (filteredInventory.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" style="text-align: center;">לא נמצאו פריטים במלאי</td>`;
        inventoryTable.appendChild(emptyRow);
        return;
    }
    
    // הוספת שורות לטבלה
    filteredInventory.forEach(item => {
        // המרת קטגוריה לעברית
        let categoryHebrew = '';
        
        switch (item.category) {
            case 'raw':
                categoryHebrew = 'חומרי גלם';
                break;
            case 'finished':
                categoryHebrew = 'מוצרים מוגמרים';
                break;
            case 'packaging':
                categoryHebrew = 'אריזות';
                break;
            case 'equipment':
                categoryHebrew = 'ציוד';
                break;
            default:
                categoryHebrew = item.category;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.sku}</td>
            <td>${item.name}</td>
            <td>${categoryHebrew}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toFixed(2)} ₪</td>
            <td>${item.supplier || '-'}</td>
            <td>
                <button class="btn-icon edit-item" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-icon update-quantity" data-id="${item.id}"><i class="fas fa-plus-minus"></i></button>
                <button class="btn-icon delete-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        inventoryTable.appendChild(row);
    });
    
    // הוספת אירועים לכפתורי פעולה
    attachInventoryActionEvents();
}

/**
 * הוספת אירועים לפעולות על פריטי מלאי
 */
function attachInventoryActionEvents() {
    // כפתורי עריכה
    document.querySelectorAll('.edit-item').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = parseInt(button.dataset.id);
            openInventoryItemModal(itemId);
        });
    });
    
    // כפתורי עדכון כמות
    document.querySelectorAll('.update-quantity').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = parseInt(button.dataset.id);
            promptUpdateQuantity(itemId);
        });
    });
    
    // כפתורי מחיקה
    document.querySelectorAll('.delete-item').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = parseInt(button.dataset.id);
            confirmDeleteInventoryItem(itemId);
        });
    });
}

/**
 * פתיחת מודל להוספה/עריכה של פריט מלאי
 */
function openInventoryItemModal(itemId = null) {
    // איפוס הטופס
    inventoryItemForm.reset();
    document.getElementById('item-id').value = '';
    
    if (itemId) {
        // מצב עריכה
        const item = getInventoryItemById(itemId);
        if (item) {
            itemModalTitle.textContent = 'עריכת פריט במלאי';
            
            // מילוי השדות בטופס
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-sku').value = item.sku;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-quantity').value = item.quantity;
            document.getElementById('item-price').value = item.price;
            document.getElementById('item-supplier').value = item.supplier || '';
        }
    } else {
        // מצב הוספה
        itemModalTitle.textContent = 'הוספת פריט חדש למלאי';
    }
    
    // הצגת המודל
    inventoryItemModal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
}

/**
 * שמירת פריט מלאי (הוספה/עריכה)
 */
function saveInventoryItem() {
    // קבלת נתונים מהטופס
    const itemId = document.getElementById('item-id').value;
    const sku = document.getElementById('item-sku').value;
    const name = document.getElementById('item-name').value;
    const category = document.getElementById('item-category').value;
    const quantity = parseInt(document.getElementById('item-quantity').value);
    const price = parseFloat(document.getElementById('item-price').value);
    const supplier = document.getElementById('item-supplier').value;
    
    // וידוא תקינות
    if (!sku || !name || isNaN(quantity) || isNaN(price)) {
        alert('יש למלא את כל השדות החובה');
        return;
    }
    
    // קבלת פריטי המלאי
    const inventory = getInventory();
    
    // בדיקה אם מק"ט כבר קיים (בעת הוספה או שינוי מק"ט)
    if (!itemId || 
        (itemId && getInventoryItemById(parseInt(itemId)).sku !== sku)) {
        const skuExists = inventory.some(item => 
            item.sku === sku &&
            (!itemId || item.id !== parseInt(itemId))
        );
        
        if (skuExists) {
            alert('מק"ט כבר קיים במערכת');
            return;
        }
    }
    
    if (itemId) {
        // עדכון פריט קיים
        const itemIndex = inventory.findIndex(item => item.id === parseInt(itemId));
        
        if (itemIndex !== -1) {
            // עדכון נתוני הפריט
            inventory[itemIndex].sku = sku;
            inventory[itemIndex].name = name;
            inventory[itemIndex].category = category;
            inventory[itemIndex].quantity = quantity;
            inventory[itemIndex].price = price;
            inventory[itemIndex].supplier = supplier;
            
            // שמירת לוג
            addSystemLog('inventory', `פריט "${name}" (${sku}) עודכן במלאי`, getCurrentAdmin().id);
        }
    } else {
        // הוספת פריט חדש
        const newItem = {
            id: generateId(inventory),
            sku,
            name,
            category,
            quantity,
            price,
            supplier
        };
        
        inventory.push(newItem);
        
        // שמירת לוג
        addSystemLog('inventory', `פריט חדש "${name}" (${sku}) נוסף למלאי`, getCurrentAdmin().id);
    }
    
    // שמירת הנתונים המעודכנים
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
    
    // סגירת המודל
    closeModal();
    
    // רענון טבלת המלאי
    loadInventoryData();
}

/**
 * בקשה לעדכון כמות
 */
function promptUpdateQuantity(itemId) {
    const item = getInventoryItemById(itemId);
    
    if (!item) {
        return;
    }
    
    // בקשת ערך חדש
    const newQuantity = prompt(`הזן את הכמות החדשה עבור "${item.name}" (${item.sku}):`, item.quantity);
    
    // בדיקה אם המשתמש ביטל או הזין ערך לא תקין
    if (newQuantity === null || newQuantity === '') {
        return;
    }
    
    // המרה למספר
    const quantityValue = parseInt(newQuantity);
    
    // בדיקת תקינות
    if (isNaN(quantityValue) || quantityValue < 0) {
        alert('יש להזין מספר חיובי');
        return;
    }
    
    // עדכון כמות
    updateItemQuantity(itemId, quantityValue);
}

/**
 * עדכון כמות פריט
 */
function updateItemQuantity(itemId, newQuantity) {
    // קבלת פריטי המלאי
    const inventory = getInventory();
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        // שמירת כמות קודמת
        const oldQuantity = inventory[itemIndex].quantity;
        
        // עדכון הכמות
        inventory[itemIndex].quantity = newQuantity;
        
        // שמירת הנתונים המעודכנים
        localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
        
        // שמירת לוג
        const itemName = inventory[itemIndex].name;
        const itemSku = inventory[itemIndex].sku;
        const changeType = newQuantity > oldQuantity ? 'הוספת' : 'הורדת';
        const changeAmount = Math.abs(newQuantity - oldQuantity);
        
        addSystemLog('inventory', `${changeType} ${changeAmount} יחידות לפריט "${itemName}" (${itemSku})`, getCurrentAdmin().id);
        
        // רענון טבלת המלאי
        loadInventoryData();
    }
}

/**
 * אישור מחיקת פריט מלאי
 */
function confirmDeleteInventoryItem(itemId) {
    const item = getInventoryItemById(itemId);
    
    if (!item) {
        return;
    }
    
    if (confirm(`האם אתה בטוח שברצונך למחוק את הפריט "${item.name}" (${item.sku}) מהמלאי?`)) {
        deleteInventoryItem(itemId);
    }
}

/**
 * מחיקת פריט מלאי
 */
function deleteInventoryItem(itemId) {
    // קבלת פריטי המלאי
    const inventory = getInventory();
    const itemToDelete = getInventoryItemById(itemId);
    
    if (!itemToDelete) {
        return;
    }
    
    // הסרת הפריט מהרשימה
    const updatedInventory = inventory.filter(item => item.id !== itemId);
    
    // שמירת הרשימה המעודכנת
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(updatedInventory));
    
    // שמירת לוג
    addSystemLog('inventory', `פריט "${itemToDelete.name}" (${itemToDelete.sku}) נמחק מהמלאי`, getCurrentAdmin().id);
    
    // רענון טבלת המלאי
    loadInventoryData();
}

/**
 * טיפול בחיפוש במלאי
 */
function handleInventorySearch() {
    const searchTerm = searchInventoryInput.value.trim().toLowerCase();
    const inventory = getInventory();
    
    // סינון הפריטים לפי מונח החיפוש
    if (searchTerm === '') {
        filteredInventory = [...inventory];
    } else {
        filteredInventory = inventory.filter(item => 
            item.sku.toLowerCase().includes(searchTerm) ||
            item.name.toLowerCase().includes(searchTerm) ||
            (item.supplier && item.supplier.toLowerCase().includes(searchTerm))
        );
    }
    
    // רענון הטבלה
    renderInventoryTable();
}

/**
 * ייצוא נתוני מלאי לאקסל
 */
function exportInventoryData() {
    // בדיקה אם יש נתונים לייצוא
    if (filteredInventory.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }
    
    // הכנת נתונים לייצוא
    const exportData = [];
    
    // הוספת שורת כותרות
    exportData.push(['מק"ט', 'שם פריט', 'קטגוריה', 'כמות במלאי', 'מחיר יחידה', 'ספק']);
    
    // הוספת נתונים
    filteredInventory.forEach(item => {
        // המרת קטגוריה לעברית
        let categoryHebrew = '';
        
        switch (item.category) {
            case 'raw':
                categoryHebrew = 'חומרי גלם';
                break;
            case 'finished':
                categoryHebrew = 'מוצרים מוגמרים';
                break;
            case 'packaging':
                categoryHebrew = 'אריזות';
                break;
            case 'equipment':
                categoryHebrew = 'ציוד';
                break;
            default:
                categoryHebrew = item.category;
        }
        
        exportData.push([
            item.sku,
            item.name,
            categoryHebrew,
            item.quantity,
            item.price.toFixed(2),
            item.supplier || '-'
        ]);
    });
    
    // יצירת גיליון אקסל
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // הגדרת רוחב עמודות
    const colWidths = [
        { wch: 15 }, // מק"ט
        { wch: 25 }, // שם פריט
        { wch: 15 }, // קטגוריה
        { wch: 12 }, // כמות במלאי
        { wch: 12 }, // מחיר יחידה
        { wch: 20 }  // ספק
    ];
    
    ws['!cols'] = colWidths;
    
    // הוספת גיליון לקובץ
    XLSX.utils.book_append_sheet(wb, ws, 'מלאי');
    
    // יצירת שם קובץ
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const fileName = `מלאי_${dateString}`;
    
    // הורדת הקובץ
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    
    // שמירת לוג
    addSystemLog('export', 'דוח מלאי יוצא לאקסל', getCurrentAdmin().id);
}

/**
 * פתיחת מודל ייבוא
 */
function openImportModal() {
    // איפוס המודל
    importTypeSelect.value = 'inventory';
    importFileInput.value = '';
    importPreview.innerHTML = '';
    
    // הצגת המודל
    importModal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
}

/**
 * תצוגה מקדימה של קובץ ייבוא
 */
function previewImportFile() {
    const file = importFileInput.files[0];
    importPreview.innerHTML = '';
    
    if (!file) {
        return;
    }
    
    // בדיקת סוג הקובץ
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (fileExt === 'json') {
        // קריאת קובץ JSON
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                importJsonData(data, importType);
            } catch (error) {
                alert(`שגיאה בפענוח קובץ JSON: ${error.message}`);
            }
        };
        reader.readAsText(file);
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        // קריאת קובץ Excel
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                importExcelData(workbook, importType);
            } catch (error) {
                alert(`שגיאה בפענוח קובץ Excel: ${error.message}`);
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('סוג קובץ לא נתמך. יש להשתמש בקבצי JSON או Excel.');
    }
}

/**
 * ייבוא נתונים מ-JSON
 */
function importJsonData(data, importType) {
    if (!Array.isArray(data)) {
        alert('פורמט לא תקין: הקובץ אינו מכיל מערך של נתונים.');
        return;
    }
    
    if (data.length === 0) {
        alert('אין נתונים בקובץ.');
        return;
    }
    
    let success = false;
    
    switch (importType) {
        case 'inventory':
            success = importInventoryData(data);
            break;
        case 'employees':
            success = importEmployeesData(data);
            break;
        case 'orders':
            success = importOrdersData(data);
            break;
    }
    
    if (success) {
        // סגירת המודל
        closeModal();
        
        // רענון הנתונים בהתאם לסוג הייבוא
        if (importType === 'inventory') {
            loadInventoryData();
        }
    }
}

/**
 * ייבוא נתונים מ-Excel
 */
function importExcelData(workbook, importType) {
    // קבלת שם הגיליון הראשון
    const firstSheetName = workbook.SheetNames[0];
    
    // המרת הגיליון לנתונים
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
        alert('אין נתונים בקובץ.');
        return;
    }
    
    let success = false;
    
    switch (importType) {
        case 'inventory':
            success = importInventoryData(data);
            break;
        case 'employees':
            success = importEmployeesData(data);
            break;
        case 'orders':
            success = importOrdersData(data);
            break;
    }
    
    if (success) {
        // סגירת המודל
        closeModal();
        
        // רענון הנתונים בהתאם לסוג הייבוא
        if (importType === 'inventory') {
            loadInventoryData();
        }
    }
}

/**
 * ייבוא נתוני מלאי
 */
function importInventoryData(data) {
    const inventory = getInventory();
    const existingSkus = new Set(inventory.map(item => item.sku));
    
    let addedCount = 0;
    let updatedCount = 0;
    let invalidCount = 0;
    
    data.forEach(item => {
        // בדיקת תקינות השדות החובה
        if (!item.sku || !item.name || 
            isNaN(Number(item.quantity)) || isNaN(Number(item.price))) {
            invalidCount++;
            return;
        }
        
        // נרמול הנתונים
        const normalizedItem = {
            sku: String(item.sku),
            name: String(item.name),
            category: ['raw', 'finished', 'packaging', 'equipment'].includes(item.category) ? 
                      item.category : 'raw',
            quantity: Number(item.quantity),
            price: Number(item.price),
            supplier: item.supplier ? String(item.supplier) : ''
        };
        
        // בדיקה אם הפריט כבר קיים
        if (existingSkus.has(normalizedItem.sku)) {
            // עדכון פריט קיים
            const index = inventory.findIndex(i => i.sku === normalizedItem.sku);
            
            if (index !== -1) {
                // שימור מזהה
                const id = inventory[index].id;
                normalizedItem.id = id;
                
                // עדכון הפריט
                inventory[index] = normalizedItem;
                updatedCount++;
            }
        } else {
            // הוספת פריט חדש
            normalizedItem.id = generateId(inventory);
            inventory.push(normalizedItem);
            existingSkus.add(normalizedItem.sku);
            addedCount++;
        }
    });
    
    // שמירת הנתונים המעודכנים
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
    
    // שמירת לוג
    addSystemLog('import', `ייבוא מלאי: ${addedCount} פריטים נוספו, ${updatedCount} פריטים עודכנו, ${invalidCount} פריטים לא חוקיים`, getCurrentAdmin().id);
    
    // הצגת סיכום
    alert(`ייבוא נתוני מלאי הושלם:\n${addedCount} פריטים נוספו\n${updatedCount} פריטים עודכנו\n${invalidCount} פריטים לא חוקיים`);
    
    return true;
}

/**
 * ייבוא נתוני עובדים
 */
function importEmployeesData(data) {
    const employees = getEmployees();
    const existingUsernames = new Set(employees.map(emp => emp.username));
    
    let addedCount = 0;
    let updatedCount = 0;
    let invalidCount = 0;
    
    data.forEach(emp => {
        // בדיקת תקינות השדות החובה
        if (!emp.name || !emp.username) {
            invalidCount++;
            return;
        }
        
        // נרמול הנתונים
        const normalizedEmp = {
            name: String(emp.name),
            role: emp.role ? String(emp.role) : 'עובד',
            email: emp.email ? String(emp.email) : '',
            phone: emp.phone ? String(emp.phone) : '',
            username: String(emp.username),
            password: emp.password ? String(emp.password) : 'password123',
            status: ['active', 'inactive'].includes(emp.status) ? emp.status : 'active'
        };
        
        // בדיקה אם העובד כבר קיים
        if (existingUsernames.has(normalizedEmp.username)) {
            // עדכון עובד קיים
            const index = employees.findIndex(e => e.username === normalizedEmp.username);
            
            if (index !== -1) {
                // שימור מזהה
                const id = employees[index].id;
                normalizedEmp.id = id;
                
                // עדכון העובד
                employees[index] = normalizedEmp;
                updatedCount++;
            }
        } else {
            // הוספת עובד חדש
            normalizedEmp.id = generateId(employees);
            employees.push(normalizedEmp);
            existingUsernames.add(normalizedEmp.username);
            addedCount++;
        }
    });
    
    // שמירת הנתונים המעודכנים
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    
    // שמירת לוג
    addSystemLog('import', `ייבוא עובדים: ${addedCount} עובדים נוספו, ${updatedCount} עובדים עודכנו, ${invalidCount} רשומות לא חוקיות`, getCurrentAdmin().id);
    
    // הצגת סיכום
    alert(`ייבוא נתוני עובדים הושלם:\n${addedCount} עובדים נוספו\n${updatedCount} עובדים עודכנו\n${invalidCount} רשומות לא חוקיות`);
    
    return true;
}

/**
 * ייבוא נתוני הזמנות
 */
function importOrdersData(data) {
    const orders = getOrders();
    
    let addedCount = 0;
    let invalidCount = 0;
    
    data.forEach(order => {
        // בדיקת תקינות השדות החובה
        if (!order.supplier || !order.date || !order.items || !Array.isArray(order.items)) {
            invalidCount++;
            return;
        }
        
        // חישוב סכום הזמנה
        let orderAmount = 0;
        const normalizedItems = [];
        
        for (const item of order.items) {
            if (!item.itemId || !item.quantity || !item.price) {
                continue;
            }
            
            const normalizedItem = {
                itemId: Number(item.itemId),
                quantity: Number(item.quantity),
                price: Number(item.price)
            };
            
            orderAmount += normalizedItem.quantity * normalizedItem.price;
            normalizedItems.push(normalizedItem);
        }
        
        if (normalizedItems.length === 0) {
            invalidCount++;
            return;
        }
        
        // נרמול הנתונים
        const normalizedOrder = {
            id: generateId(orders),
            supplier: String(order.supplier),
            date: order.date,
            amount: orderAmount,
            status: ['new', 'processing', 'delivered', 'canceled'].includes(order.status) ? order.status : 'new',
            items: normalizedItems
        };
        
        // הוספת הזמנה חדשה
        orders.push(normalizedOrder);
        addedCount++;
    });
    
    // שמירת הנתונים המעודכנים
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    
    // שמירת לוג
    addSystemLog('import', `ייבוא הזמנות: ${addedCount} הזמנות נוספו, ${invalidCount} רשומות לא חוקיות`, getCurrentAdmin().id);
    
    // הצגת סיכום
    alert(`ייבוא נתוני הזמנות הושלם:\n${addedCount} הזמנות נוספו\n${invalidCount} רשומות לא חוקיות`);
    
    return true;
}

/**
 * קבלת פריט מלאי לפי מזהה
 */
function getInventoryItemById(itemId) {
    const inventory = getInventory();
    return inventory.find(item => item.id === itemId);
}onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                displayJsonPreview(data);
            } catch (error) {
                importPreview.innerHTML = `<p class="error">שגיאה בפענוח קובץ JSON: ${error.message}</p>`;
            }
        };
        reader.readAsText(file);
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        // קריאת קובץ Excel
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                displayExcelPreview(workbook);
            } catch (error) {
                importPreview.innerHTML = `<p class="error">שגיאה בפענוח קובץ Excel: ${error.message}</p>`;
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        importPreview.innerHTML = '<p class="error">סוג קובץ לא נתמך. יש להשתמש בקבצי JSON או Excel.</p>';
    }
}

/**
 * הצגת תצוגה מקדימה לקובץ JSON
 */
function displayJsonPreview(data) {
    if (!Array.isArray(data)) {
        importPreview.innerHTML = '<p class="error">פורמט לא תקין: הקובץ אינו מכיל מערך של נתונים.</p>';
        return;
    }
    
    if (data.length === 0) {
        importPreview.innerHTML = '<p class="error">אין נתונים בקובץ.</p>';
        return;
    }
    
    // מציג את 5 הרשומות הראשונות
    const sample = data.slice(0, 5);
    
    let html = `<p>נמצאו ${data.length} רשומות. הצגת ${sample.length} לדוגמה:</p>`;
    html += '<pre>' + JSON.stringify(sample, null, 2) + '</pre>';
    
    importPreview.innerHTML = html;
}

/**
 * הצגת תצוגה מקדימה לקובץ Excel
 */
function displayExcelPreview(workbook) {
    // קבלת שם הגיליון הראשון
    const firstSheetName = workbook.SheetNames[0];
    
    // המרת הגיליון לנתונים
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length <= 1) {
        importPreview.innerHTML = '<p class="error">אין מספיק נתונים בקובץ או חסרות כותרות.</p>';
        return;
    }
    
    // בניית טבלה לתצוגה מקדימה
    const headers = data[0];
    const rows = data.slice(1, 6); // הצגת 5 שורות ראשונות
    
    let html = `<p>נמצאו ${data.length - 1} רשומות. הצגת ${rows.length} לדוגמה:</p>`;
    html += '<table class="preview-table"><thead><tr>';
    
    // הוספת כותרות
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    // הוספת שורות
    rows.forEach(row => {
        html += '<tr>';
        for (let i = 0; i < headers.length; i++) {
            html += `<td>${row[i] !== undefined ? row[i] : ''}</td>`;
        }
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    importPreview.innerHTML = html;
}

/**
 * עיבוד קובץ ייבוא
 */
function processImport() {
    const file = importFileInput.files[0];
    
    if (!file) {
        alert('יש לבחור קובץ לייבוא');
        return;
    }
    
    const importType = importTypeSelect.value;
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (fileExt === 'json') {
        // קריאת קובץ JSON
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                importJsonData(data, importType);
            } catch (error) {
                alert(`שגיאה בפענוח קובץ JSON: ${error.message}`);
            }
        };
        reader.