/**
 * לוח מחוונים וניהול ניווט - ממשק ניהול
 * 
 * מטפל בטעינת נתוני לוח המחוונים וניהול הניווט בין המקטעים
 */

// קבועים ומשתנים גלובליים
const STORAGE_KEY_SETTINGS = 'pesach_settings';
const STORAGE_KEY_PRODUCTION_LINES = 'pesach_production_lines';
const STORAGE_KEY_INVENTORY = 'pesach_inventory';
const STORAGE_KEY_ORDERS = 'pesach_orders';

// אלמנטים
const navLinks = document.querySelectorAll('.admin-nav a');
const sections = document.querySelectorAll('.admin-section');

// אתחול
document.addEventListener('DOMContentLoaded', initDashboard);

/**
 * אתחול לוח המחוונים
 */
function initDashboard() {
    // אתחול נתונים ראשוניים אם לא קיימים
    initDashboardData();
    
    // הגדרת אירועי ניווט
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // טעינת נתוני לוח המחוונים
    loadDashboardData();
}

/**
 * אתחול נתוני לוח המחוונים
 */
function initDashboardData() {
    // אתחול הגדרות מערכת
    if (!localStorage.getItem(STORAGE_KEY_SETTINGS)) {
        const initialSettings = {
            companyName: 'מפעל פסח בע"מ',
            workdayStart: '08:00',
            workdayEnd: '17:00',
            theme: 'pesach'
        };
        
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(initialSettings));
    }
    
    // אתחול פסי ייצור
    if (!localStorage.getItem(STORAGE_KEY_PRODUCTION_LINES)) {
        const initialLines = [
            {
                id: 1,
                name: 'קו ייצור 1',
                manager: 3, // מזהה העובד (דוד לוי)
                capacity: 1000,
                status: 'active',
                currentProduction: 450
            },
            {
                id: 2,
                name: 'קו ייצור 2',
                manager: 2, // מזהה העובד (שרה כהן)
                capacity: 1500,
                status: 'maintenance',
                currentProduction: 0
            }
        ];
        
        localStorage.setItem(STORAGE_KEY_PRODUCTION_LINES, JSON.stringify(initialLines));
    }
    
    // אתחול מלאי
    if (!localStorage.getItem(STORAGE_KEY_INVENTORY)) {
        const initialInventory = [
            {
                id: 1,
                sku: 'RM001',
                name: 'קמח מצה',
                category: 'raw',
                quantity: 500,
                price: 15.5,
                supplier: 'ספק חומרי גלם א'
            },
            {
                id: 2,
                sku: 'RM002',
                name: 'שמן זית',
                category: 'raw',
                quantity: 200,
                price: 45.0,
                supplier: 'ספק חומרי גלם ב'
            },
            {
                id: 3,
                sku: 'FP001',
                name: 'מצות ארוזות 1 ק"ג',
                category: 'finished',
                quantity: 300,
                price: 25.0,
                supplier: '-'
            },
            {
                id: 4,
                sku: 'PKG001',
                name: 'קרטון אריזה קטן',
                category: 'packaging',
                quantity: 1000,
                price: 3.5,
                supplier: 'ספק אריזות'
            }
        ];
        
        localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(initialInventory));
    }
    
    // אתחול הזמנות
    if (!localStorage.getItem(STORAGE_KEY_ORDERS)) {
        const initialOrders = [
            {
                id: 1,
                supplier: 'ספק חומרי גלם א',
                date: '2025-04-01',
                amount: 5000,
                status: 'delivered',
                items: [
                    { itemId: 1, quantity: 200, price: 15.5 },
                    { itemId: 2, quantity: 50, price: 45.0 }
                ]
            },
            {
                id: 2,
                supplier: 'ספק אריזות',
                date: '2025-04-03',
                amount: 3500,
                status: 'processing',
                items: [
                    { itemId: 4, quantity: 1000, price: 3.5 }
                ]
            }
        ];
        
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(initialOrders));
    }
}

/**
 * טעינת נתוני לוח המחוונים
 */
function loadDashboardData() {
    // עדכון סטטיסטיקות לוח המחוונים
    updateDashboardStats();
    
    // יצירת תרשימים
    createDashboardCharts();
}

/**
 * עדכון סטטיסטיקות לוח המחוונים
 */
function updateDashboardStats() {
    // קבלת הנתונים הדרושים
    const employees = getEmployees();
    const attendance = getAttendanceRecords();
    const productionLines = getProductionLines();
    const inventory = getInventory();
    
    // חישוב סטטיסטיקות
    const totalEmployees = employees.length;
    
    // חישוב עובדים נוכחים (עם כניסה ללא יציאה)
    const todayStr = getCurrentDateString();
    const presentEmployees = attendance.filter(record => 
        record.date === todayStr && 
        record.punchIn && 
        !record.punchOut
    ).length;
    
    // חישוב פסי ייצור פעילים
    const activeLines = productionLines.filter(line => line.status === 'active').length;
    
    // חישוב פריטים במלאי
    const inventoryCount = inventory.reduce((total, item) => total + item.quantity, 0);
    
    // עדכון רכיבי הממשק
    document.getElementById('total-employees').textContent = totalEmployees;
    document.getElementById('present-employees').textContent = presentEmployees;
    document.getElementById('active-lines').textContent = activeLines;
    document.getElementById('inventory-count').textContent = inventoryCount;
}

/**
 * יצירת תרשימים ללוח המחוונים
 */
function createDashboardCharts() {
    // יצירת תרשים נוכחות חודשית
    createAttendanceChart();
    
    // יצירת תרשים סטטוס הזמנות
    createOrdersChart();
}

/**
 * יצירת תרשים נוכחות חודשית
 */
function createAttendanceChart() {
    const canvas = document.getElementById('attendance-chart');
    
    // אם קיים כבר תרשים, נשמיד אותו
    if (window.attendanceChart) {
        window.attendanceChart.destroy();
    }
    
    // הכנת נתונים לתרשים
    const attendanceData = prepareAttendanceChartData();
    
    // יצירת התרשים
    window.attendanceChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: attendanceData.labels,
            datasets: [{
                label: 'סה"כ נוכחות',
                data: attendanceData.data,
                borderColor: 'rgb(0, 102, 204)',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Segoe UI, Arial, sans-serif'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: 'Segoe UI, Arial, sans-serif'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Segoe UI, Arial, sans-serif'
                        }
                    }
                }
            }
        }
    });
}

/**
 * הכנת נתונים לתרשים נוכחות
 */
function prepareAttendanceChartData() {
    const attendance = getAttendanceRecords();
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    // יצירת מערך של 30 ימים אחרונים
    const labels = [];
    const data = [];
    
    for (let i = 0; i < 30; i++) {
        const day = new Date(now);
        day.setDate(now.getDate() - (29 - i));
        
        const dayStr = toISODateString(day);
        const dayAttendance = attendance.filter(record => record.date === dayStr).length;
        
        // פורמט של היום לתצוגה
        const dayLabel = `${day.getDate()}/${day.getMonth() + 1}`;
        
        labels.push(dayLabel);
        data.push(dayAttendance);
    }
    
    return { labels, data };
}

/**
 * יצירת תרשים סטטוס הזמנות
 */
function createOrdersChart() {
    const canvas = document.getElementById('orders-chart');
    
    // אם קיים כבר תרשים, נשמיד אותו
    if (window.ordersChart) {
        window.ordersChart.destroy();
    }
    
    // הכנת נתונים לתרשים
    const ordersData = prepareOrdersChartData();
    
    // יצירת התרשים
    window.ordersChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['חדש', 'בטיפול', 'נמסר', 'בוטל'],
            datasets: [{
                data: ordersData,
                backgroundColor: [
                    'rgb(0, 102, 204)',     // כחול (חדש)
                    'rgb(255, 193, 7)',     // צהוב (בטיפול)
                    'rgb(40, 167, 69)',     // ירוק (נמסר)
                    'rgb(220, 53, 69)'      // אדום (בוטל)
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            family: 'Segoe UI, Arial, sans-serif'
                        }
                    }
                }
            }
        }
    });
}

/**
 * הכנת נתונים לתרשים הזמנות
 */
function prepareOrdersChartData() {
    const orders = getOrders();
    
    // ספירת הזמנות לפי סטטוס
    const newOrders = orders.filter(order => order.status === 'new').length;
    const processingOrders = orders.filter(order => order.status === 'processing').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const canceledOrders = orders.filter(order => order.status === 'canceled').length;
    
    return [newOrders, processingOrders, deliveredOrders, canceledOrders];
}

/**
 * טיפול בניווט בין מקטעים
 */
function handleNavigation(event) {
    event.preventDefault();
    
    // קבלת המזהה של המקטע המבוקש
    const targetSectionId = this.dataset.section;
    
    // הסרת מחלקת 'active' מכל הקישורים
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // הסרת מחלקת 'active' מכל המקטעים
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // הוספת מחלקת 'active' לקישור ולמקטע המבוקשים
    this.classList.add('active');
    document.getElementById(targetSectionId).classList.add('active');
    
    // טעינת נתונים למקטע הספציפי
    loadSectionData(targetSectionId);
}

/**
 * טעינת נתונים למקטע ספציפי
 */
function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'employees':
            loadEmployeesData();
            break;
        case 'attendance':
            loadAttendanceData();
            break;
        case 'production':
            loadProductionData();
            break;
        case 'inventory':
            loadInventoryData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'logs':
            loadLogsData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

/**
 * קבלת פסי ייצור
 */
function getProductionLines() {
    const linesJson = localStorage.getItem(STORAGE_KEY_PRODUCTION_LINES);
    return linesJson ? JSON.parse(linesJson) : [];
}

/**
 * קבלת פריטי מלאי
 */
function getInventory() {
    const inventoryJson = localStorage.getItem(STORAGE_KEY_INVENTORY);
    return inventoryJson ? JSON.parse(inventoryJson) : [];
}

/**
 * קבלת הזמנות
 */
function getOrders() {
    const ordersJson = localStorage.getItem(STORAGE_KEY_ORDERS);
    return ordersJson ? JSON.parse(ordersJson) : [];
}

/**
 * קבלת הגדרות מערכת
 */
function getSettings() {
    const settingsJson = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return settingsJson ? JSON.parse(settingsJson) : {};
}
