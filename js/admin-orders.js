/**
 * ניהול הזמנות - ממשק ניהול
 * 
 * מטפל בהצגה, הוספה, עריכה וניהול של הזמנות
 */

// אלמנטים
const ordersTable = document.getElementById('orders-table').querySelector('tbody');
const addOrderBtn = document.getElementById('add-order-btn');
const orderStatusFilter = document.getElementById('order-status-filter');
const filterOrdersBtn = document.getElementById('filter-orders');
const orderModal = document.getElementById('order-modal');
const orderModalTitle = document.getElementById('order-modal-title');
const orderForm = document.getElementById('order-form');
const orderItems = document.getElementById('order-items');
const addOrderItemBtn = document.getElementById('add-order-item');
const orderTotal = document.getElementById('order-total');
const saveOrderBtn = document.getElementById('save-order');

// מצב של ההזמנות
let filteredOrders = [];
let orderItemsData = [];

// אתחול
document.addEventListener('DOMContentLoaded', initOrdersPage);

/**
 * אתחול דף ניהול הזמנות
 */
function initOrdersPage() {
    // הגדרת אירועים
    addOrderBtn.addEventListener('click', () => openOrderModal());
    filterOrdersBtn.addEventListener('click', applyOrdersFilter);
    addOrderItemBtn.addEventListener('click', addOrderItemRow);
    saveOrderBtn.addEventListener('click', saveOrder);
}

/**
 * טעינת נתוני הזמנות
 */
function loadOrdersData() {
    // קבלת ההזמנות
    const orders = getOrders();
    
    // סידור לפי תאריך יורד (החדש ביותר קודם)
    const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    filteredOrders = sortedOrders;
    
    // הצגת ההזמנות
    renderOrdersTable();
}

/**
 * הצגת טבלת הזמנות
 */
function renderOrdersTable() {
    // ניקוי הטבלה
    ordersTable.innerHTML = '';
    
    // בדיקה אם אין הזמנות
    if (filteredOrders.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">לא נמצאו הזמנות</td>`;
        ordersTable.appendChild(emptyRow);
        return;
    }
    
    // הוספת שורות לטבלה
    filteredOrders.forEach(order => {
        // המרת סטטוס לעברית ולמחלקת סגנון
        let statusText = '';
        let statusClass = '';
        
        switch (order.status) {
            case 'new':
                statusText = 'חדש';
                statusClass = 'status-new';
                break;
            case 'processing':
                statusText = 'בטיפול';
                statusClass = 'status-processing';
                break;
            case 'delivered':
                statusText = 'נמסר';
                statusClass = 'status-delivered';
                break;
            case 'canceled':
                statusText = 'בוטל';
                statusClass = 'status-canceled';
                break;
        }
        
        // המרת תאריך לפורמט מקומי
        const date = new Date(order.date).toLocaleDateString('he-IL');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${date}</td>
            <td>${order.supplier}</td>
            <td>${order.amount.toFixed(2)} ₪</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-icon view-order" data-id="${order.id}"><i class="fas fa-eye"></i></button>
                <button class="btn-icon edit-order" data-id="${order.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete-order" data-id="${order.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        ordersTable.appendChild(row);
    });
    
    // הוספת אירועים לכפתורי פעולה
    attachOrderActionEvents();
}

/**
 * הוספת אירועים לפעולות על הזמנות
 */
function attachOrderActionEvents() {
    // כפתורי צפייה
    document.querySelectorAll('.view-order').forEach(button => {
        button.addEventListener('click', () => {
            const orderId = parseInt(button.dataset.id);
            viewOrderDetails(orderId);
        });
    });
    
    // כפתורי עריכה
    document.querySelectorAll('.edit-order').forEach(button => {
        button.addEventListener('click', () => {
            const orderId = parseInt(button.dataset.id);
            openOrderModal(orderId);
        });
    });
    
    // כפתורי מחיקה
    document.querySelectorAll('.delete-order').forEach(button => {
        button.addEventListener('click', () => {
            const orderId = parseInt(button.dataset.id);
            confirmDeleteOrder(orderId);
        });
    });
}

/**
 * החלת סינון על הזמנות
 */
function applyOrdersFilter() {
    // קבלת ערך הסינון
    const statusFilter = orderStatusFilter.value;
    
    // קבלת כל ההזמנות
    const orders = getOrders();
    
    // סינון לפי סטטוס
    let filtered = orders;
    if (statusFilter) {
        filtered = orders.filter(order => order.status === statusFilter);
    }
    
    // סידור לפי תאריך יורד (החדש ביותר קודם)
    filteredOrders = filtered.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // הצגת הנתונים המסוננים
    renderOrdersTable();
}

/**
 * פתיחת מודל להוספה/עריכה של הזמנה
 */
function openOrderModal(orderId = null) {
    // איפוס הטופס
    orderForm.reset();
    document.getElementById('order-id').value = '';
    
    // איפוס פריטי ההזמנה
    orderItemsData = [];
    orderItems.innerHTML = '';
    
    // הגדרת תאריך ברירת מחדל להיום
    document.getElementById('order-date').value = getCurrentDateString();
    
    if (orderId) {
        // מצב עריכה
        const order = getOrderById(orderId);
        if (order) {
            orderModalTitle.textContent = 'עריכת הזמנה';
            
            // מילוי השדות בטופס
            document.getElementById('order-id').value = order.id;
            document.getElementById('order-supplier').value = order.supplier;
            document.getElementById('order-date').value = order.date;
            document.getElementById('order-status').value = order.status;
            
            // הוספת שורות לפריטים
            orderItemsData = [...order.items];
            refreshOrderItems();
        }
    } else {
        // מצב הוספה
        orderModalTitle.textContent = 'הזמנה חדשה';
        
        // הוספת שורה ראשונה לפריטים
        addOrderItemRow();
    }
    
    // עדכון סכום ההזמנה
    updateOrderTotal();
    
    // הצגת המודל
    orderModal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
}

/**
 * רענון פריטי ההזמנה בטופס
 */
function refreshOrderItems() {
    // ניקוי המכל
    orderItems.innerHTML = '';
    
    // הוספת שורה לכל פריט
    orderItemsData.forEach((item, index) => {
        addOrderItemRow(item, index);
    });
    
    // עדכון סכום ההזמנה
    updateOrderTotal();
}

/**
 * הוספת שורת פריט להזמנה
 */
function addOrderItemRow(item = null, index = null) {
    // יצירת רשומה חדשה אם לא סופקה
    if (item === null) {
        item = { itemId: '', quantity: 1, price: 0 };
        orderItemsData.push(item);
        index = orderItemsData.length - 1;
    }
    
    // יצירת שורה חדשה
    const itemRow = document.createElement('div');
    itemRow.className = 'order-item';
    itemRow.dataset.index = index;
    
    // בניית תיבת בחירת פריט
    const inventoryItems = getInventory();
    let itemOptions = '<option value="">בחר פריט</option>';
    
    inventoryItems.forEach(invItem => {
        const selected = item.itemId === invItem.id ? 'selected' : '';
        itemOptions += `<option value="${invItem.id}" data-price="${invItem.price}" ${selected}>${invItem.name} (${invItem.sku})</option>`;
    });
    
    // יצירת תוכן השורה
    itemRow.innerHTML = `
        <select class="item-select" onchange="handleItemChange(this, ${index})">
            ${itemOptions}
        </select>
        <input type="number" class="item-quantity" placeholder="כמות" min="1" value="${item.quantity}" oninput="handleQuantityChange(this, ${index})">
        <span class="item-price">${item.price.toFixed(2)} ₪</span>
        <button type="button" class="remove-item btn-icon" onclick="removeOrderItem(${index})"><i class="fas fa-trash"></i></button>
    `;
    
    orderItems.appendChild(itemRow);
}

/**
 * טיפול בשינוי פריט
 */
function handleItemChange(select, index) {
    const selectedOption = select.options[select.selectedIndex];
    const itemId = parseInt(select.value) || '';
    const price = itemId ? parseFloat(selectedOption.dataset.price) : 0;
    
    // עדכון הנתונים
    orderItemsData[index].itemId = itemId;
    orderItemsData[index].price = price;
    
    // עדכון המחיר המוצג
    const row = select.closest('.order-item');
    row.querySelector('.item-price').textContent = `${price.toFixed(2)} ₪`;
    
    // עדכון סכום ההזמנה
    updateOrderTotal();
}

/**
 * טיפול בשינוי כמות
 */
function handleQuantityChange(input, index) {
    const quantity = parseInt(input.value) || 1;
    
    // עדכון הנתונים
    orderItemsData[index].quantity = quantity;
    
    // עדכון סכום ההזמנה
    updateOrderTotal();
}

/**
 * הסרת פריט מההזמנה
 */
function removeOrderItem(index) {
    // הסרת הפריט מהמערך
    orderItemsData.splice(index, 1);
    
    // רענון הפריטים
    refreshOrderItems();
}

/**
 * עדכון סכום ההזמנה
 */
function updateOrderTotal() {
    let total = 0;
    
    // חישוב סכום כל ההזמנה
    orderItemsData.forEach(item => {
        total += item.quantity * item.price;
    });
    
    // עדכון התצוגה
    orderTotal.textContent = `${total.toFixed(2)} ₪`;
}

/**
 * שמירת הזמנה (הוספה/עריכה)
 */
function saveOrder() {
    // קבלת נתונים מהטופס
    const orderId = document.getElementById('order-id').value;
    const supplier = document.getElementById('order-supplier').value;
    const date = document.getElementById('order-date').value;
    const status = document.getElementById('order-status').value;
    
    // וידוא תקינות
    if (!supplier || !date) {
        alert('יש למלא את כל השדות החובה');
        return;
    }
    
    // בדיקת תקינות הפריטים
    const validItems = orderItemsData.filter(item => item.itemId && item.quantity > 0);
    
    if (validItems.length === 0) {
        alert('יש להוסיף לפחות פריט אחד להזמנה');
        return;
    }
    
    // חישוב סכום ההזמנה
    const amount = validItems.reduce((total, item) => total + (item.quantity * item.price), 0);
    
    // קבלת ההזמנות
    const orders = getOrders();
    
    if (orderId) {
        // עדכון הזמנה קיימת
        const orderIndex = orders.findIndex(order => order.id === parseInt(orderId));
        
        if (orderIndex !== -1) {
            // עדכון נתוני ההזמנה
            orders[orderIndex].supplier = supplier;
            orders[orderIndex].date = date;
            orders[orderIndex].status = status;
            orders[orderIndex].amount = amount;
            orders[orderIndex].items = validItems;
            
            // שמירת לוג
            addSystemLog('order', `הזמנה #${orderId} עודכנה`, getCurrentAdmin().id);
        }
    } else {
        // הוספת הזמנה חדשה
        const newOrder = {
            id: generateId(orders),
            supplier,
            date,
            status,
            amount,
            items: validItems
        };
        
        orders.push(newOrder);
        
        // שמירת לוג
        addSystemLog('order', `הזמנה חדשה נוספה למערכת (ספק: ${supplier})`, getCurrentAdmin().id);
    }
    
    // שמירת הנתונים המעודכנים
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    
    // סגירת המודל
    closeModal();
    
    // רענון טבלת ההזמנות
    loadOrdersData();
}

/**
 * צפייה בפרטי הזמנה
 */
function viewOrderDetails(orderId) {
    const order = getOrderById(orderId);
    
    if (!order) {
        return;
    }
    
    // המרת סטטוס לעברית
    let statusText = '';
    
    switch (order.status) {
        case 'new':
            statusText = 'חדש';
            break;
        case 'processing':
            statusText = 'בטיפול';
            break;
        case 'delivered':
            statusText = 'נמסר';
            break;
        case 'canceled':
            statusText = 'בוטל';
            break;
    }
    
    // המרת תאריך לפורמט מקומי
    const date = new Date(order.date).toLocaleDateString('he-IL');
    
    // הכנת רשימת פריטים
    const inventory = getInventory();
    let itemsList = '';
    
    order.items.forEach(item => {
        const inventoryItem = inventory.find(i => i.id === item.itemId);
        const itemName = inventoryItem ? inventoryItem.name : `פריט #${item.itemId}`;
        const itemTotal = item.quantity * item.price;
        
        itemsList += `
            <tr>
                <td>${itemName}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)} ₪</td>
                <td>${itemTotal.toFixed(2)} ₪</td>
            </tr>
        `;
    });
    
    // יצירת חלון צפייה
    const detailsHTML = `
        <div class="order-details">
            <h3>פרטי הזמנה #${order.id}</h3>
            <div class="order-info">
                <p><strong>ספק:</strong> ${order.supplier}</p>
                <p><strong>תאריך:</strong> ${date}</p>
                <p><strong>סטטוס:</strong> ${statusText}</p>
                <p><strong>סה"כ:</strong> ${order.amount.toFixed(2)} ₪</p>
            </div>
            <div class="order-items-list">
                <h4>פריטים</h4>
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>פריט</th>
                            <th>כמות</th>
                            <th>מחיר יחידה</th>
                            <th>סה"כ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsList}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3">סה"כ</td>
                            <td>${order.amount.toFixed(2)} ₪</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
    
    // הצגת החלון באמצעות alert
    alert(detailsHTML);
}

/**
 * אישור מחיקת הזמנה
 */
function confirmDeleteOrder(orderId) {
    const order = getOrderById(orderId);
    
    if (!order) {
        return;
    }
    
    if (confirm(`האם אתה בטוח שברצונך למחוק את ההזמנה #${orderId}?`)) {
        deleteOrder(orderId);
    }
}

/**
 * מחיקת הזמנה
 */
function deleteOrder(orderId) {
    // קבלת ההזמנות
    const orders = getOrders();
    
    // הסרת ההזמנה מהרשימה
    const updatedOrders = orders.filter(order => order.id !== orderId);
    
    // שמירת הרשימה המעודכנת
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updatedOrders));
    
    // שמירת לוג
    addSystemLog('order', `הזמנה #${orderId} נמחקה מהמערכת`, getCurrentAdmin().id);
    
    // רענון טבלת ההזמנות
    loadOrdersData();
}

/**
 * קבלת הזמנה לפי מזהה
 */
function getOrderById(orderId) {
    const orders = getOrders();
    return orders.find(order => order.id === orderId);
}