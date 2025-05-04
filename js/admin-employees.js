/**
 * ניהול עובדים - ממשק ניהול
 * 
 * מטפל בטעינה, הוספה, עריכה ומחיקה של עובדים
 */

// אלמנטים
const employeesTable = document.getElementById('employees-table').querySelector('tbody');
const addEmployeeBtn = document.getElementById('add-employee-btn');
const searchEmployeeInput = document.getElementById('search-employee');
const employeeModal = document.getElementById('employee-modal');
const employeeForm = document.getElementById('employee-form');
const employeeModalTitle = document.getElementById('employee-modal-title');
const saveEmployeeBtn = document.getElementById('save-employee');
const modalBackdrop = document.getElementById('modal-backdrop');
const closeModalButtons = document.querySelectorAll('.close-modal');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfoSpan = document.getElementById('page-info');

// מצב הטבלה
let currentPage = 1;
const rowsPerPage = 10;
let filteredEmployees = [];

// אתחול
document.addEventListener('DOMContentLoaded', initEmployeesPage);

/**
 * אתחול דף העובדים
 */
function initEmployeesPage() {
    // הגדרת אירועים
    addEmployeeBtn.addEventListener('click', () => openEmployeeModal());
    saveEmployeeBtn.addEventListener('click', saveEmployee);
    searchEmployeeInput.addEventListener('input', handleEmployeeSearch);
    prevPageBtn.addEventListener('click', goToPreviousPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    // סגירת מודל
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    modalBackdrop.addEventListener('click', closeModal);
}

/**
 * טעינת נתוני עובדים
 */
function loadEmployeesData() {
    const employees = getEmployees();
    
    // שמירת העובדים המסוננים
    filteredEmployees = [...employees];
    
    // איפוס עמוד נוכחי
    currentPage = 1;
    
    // הצגת העובדים
    renderEmployeesTable();
}

/**
 * הצגת טבלת העובדים
 */
function renderEmployeesTable() {
    // חישוב עובדים לעמוד הנוכחי
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentPageEmployees = filteredEmployees.slice(startIndex, endIndex);
    
    // ניקוי הטבלה
    employeesTable.innerHTML = '';
    
    // בדיקה אם אין עובדים
    if (currentPageEmployees.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">לא נמצאו עובדים</td>`;
        employeesTable.appendChild(emptyRow);
    } else {
        // הוספת שורות לטבלה
        currentPageEmployees.forEach(employee => {
            const row = document.createElement('tr');
            
            // המרת סטטוס לעברית ולמחלקת סגנון
            let statusHebrew = '';
            let statusClass = '';
            
            if (employee.status === 'active') {
                statusHebrew = 'פעיל';
                statusClass = 'status-active';
            } else {
                statusHebrew = 'לא פעיל';
                statusClass = 'status-inactive';
            }
            
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.role}</td>
                <td>${employee.email}</td>
                <td><span class="status-badge ${statusClass}">${statusHebrew}</span></td>
                <td>
                    <button class="btn-icon edit-employee" data-id="${employee.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete-employee" data-id="${employee.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            employeesTable.appendChild(row);
        });
        
        // הוספת אירועים לכפתורי פעולה
        attachEmployeeActionEvents();
    }
    
    // עדכון מידע על עמודים
    updatePagination();
}

/**
 * הוספת אירועים לפעולות על עובדים
 */
function attachEmployeeActionEvents() {
    // כפתורי עריכה
    document.querySelectorAll('.edit-employee').forEach(button => {
        button.addEventListener('click', () => {
            const employeeId = parseInt(button.dataset.id);
            openEmployeeModal(employeeId);
        });
    });
    
    // כפתורי מחיקה
    document.querySelectorAll('.delete-employee').forEach(button => {
        button.addEventListener('click', () => {
            const employeeId = parseInt(button.dataset.id);
            confirmDeleteEmployee(employeeId);
        });
    });
}

/**
 * פתיחת מודל להוספה/עריכה של עובד
 */
function openEmployeeModal(employeeId = null) {
    // איפוס הטופס
    employeeForm.reset();
    document.getElementById('employee-id').value = '';
    
    if (employeeId) {
        // מצב עריכה
        const employee = getEmployeeById(employeeId);
        if (employee) {
            employeeModalTitle.textContent = 'עריכת עובד';
            
            // מילוי השדות בטופס
            document.getElementById('employee-id').value = employee.id;
            document.getElementById('employee-name').value = employee.name;
            document.getElementById('employee-role').value = employee.role;
            document.getElementById('employee-email').value = employee.email;
            document.getElementById('employee-phone').value = employee.phone || '';
            document.getElementById('employee-username').value = employee.username;
            document.getElementById('employee-status').value = employee.status;
            
            // שדה הסיסמה ריק בעריכה (לא מציג את הסיסמה הנוכחית)
            document.getElementById('employee-password').value = '';
        }
    } else {
        // מצב הוספה
        employeeModalTitle.textContent = 'הוספת עובד חדש';
    }
    
    // הצגת המודל
    employeeModal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
}

/**
 * סגירת מודל
 */
function closeModal() {
    employeeModal.classList.add('hidden');
    modalBackdrop.classList.add('hidden');
}

/**
 * שמירת עובד (הוספה/עריכה)
 */
function saveEmployee() {
    // קבלת נתונים מהטופס
    const employeeId = document.getElementById('employee-id').value;
    const name = document.getElementById('employee-name').value;
    const role = document.getElementById('employee-role').value;
    const email = document.getElementById('employee-email').value;
    const phone = document.getElementById('employee-phone').value;
    const username = document.getElementById('employee-username').value;
    const password = document.getElementById('employee-password').value;
    const status = document.getElementById('employee-status').value;
    
    // וידוא תקינות
    if (!name || !role || !email || !username) {
        alert('יש למלא את כל השדות החובה');
        return;
    }
    
    // קבלת רשימת העובדים
    const employees = getEmployees();
    
    // בדיקה אם שם המשתמש כבר קיים (בעת הוספה או שינוי שם משתמש)
    if (!employeeId || 
        (employeeId && getEmployeeById(parseInt(employeeId)).username !== username)) {
        const usernameExists = employees.some(employee => 
            employee.username === username &&
            (!employeeId || employee.id !== parseInt(employeeId))
        );
        
        if (usernameExists) {
            alert('שם משתמש כבר קיים במערכת');
            return;
        }
    }
    
    if (employeeId) {
        // עדכון עובד קיים
        const employeeIndex = employees.findIndex(employee => employee.id === parseInt(employeeId));
        
        if (employeeIndex !== -1) {
            // עדכון נתוני העובד
            employees[employeeIndex].name = name;
            employees[employeeIndex].role = role;
            employees[employeeIndex].email = email;
            employees[employeeIndex].phone = phone;
            employees[employeeIndex].username = username;
            employees[employeeIndex].status = status;
            
            // עדכון סיסמה רק אם הוזנה חדשה
            if (password) {
                employees[employeeIndex].password = password;
            }
            
            // שמירת לוג
            addSystemLog('employee', `עובד ${name} עודכן במערכת`, getCurrentAdmin().id);
        }
    } else {
        // הוספת עובד חדש
        const newEmployee = {
            id: generateId(employees),
            name,
            role,
            email,
            phone,
            username,
            password: password || 'password123', // ברירת מחדל אם לא הוזנה סיסמה
            status
        };
        
        employees.push(newEmployee);
        
        // שמירת לוג
        addSystemLog('employee', `עובד חדש ${name} נוסף למערכת`, getCurrentAdmin().id);
    }
    
    // שמירת הנתונים המעודכנים
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    
    // סגירת המודל
    closeModal();
    
    // רענון טבלת העובדים
    loadEmployeesData();
}

/**
 * אישור מחיקת עובד
 */
function confirmDeleteEmployee(employeeId) {
    const employee = getEmployeeById(employeeId);
    
    if (!employee) {
        return;
    }
    
    if (confirm(`האם אתה בטוח שברצונך למחוק את העובד "${employee.name}"?`)) {
        deleteEmployee(employeeId);
    }
}

/**
 * מחיקת עובד
 */
function deleteEmployee(employeeId) {
    // קבלת רשימת העובדים
    const employees = getEmployees();
    const employeeToDelete = getEmployeeById(employeeId);
    
    if (!employeeToDelete) {
        return;
    }
    
    // הסרת העובד מהרשימה
    const updatedEmployees = employees.filter(employee => employee.id !== employeeId);
    
    // שמירת הרשימה המעודכנת
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(updatedEmployees));
    
    // שמירת לוג
    addSystemLog('employee', `עובד ${employeeToDelete.name} נמחק מהמערכת`, getCurrentAdmin().id);
    
    // רענון טבלת העובדים
    loadEmployeesData();
}

/**
 * קבלת עובד לפי מזהה
 */
function getEmployeeById(employeeId) {
    const employees = getEmployees();
    return employees.find(employee => employee.id === employeeId);
}

/**
 * טיפול בחיפוש עובדים
 */
function handleEmployeeSearch() {
    const searchTerm = searchEmployeeInput.value.trim().toLowerCase();
    const employees = getEmployees();
    
    // סינון העובדים לפי מונח החיפוש
    if (searchTerm === '') {
        filteredEmployees = [...employees];
    } else {
        filteredEmployees = employees.filter(employee => 
            employee.name.toLowerCase().includes(searchTerm) ||
            employee.role.toLowerCase().includes(searchTerm) ||
            employee.email.toLowerCase().includes(searchTerm) ||
            employee.username.toLowerCase().includes(searchTerm)
        );
    }
    
    // איפוס העמוד הנוכחי ורענון הטבלה
    currentPage = 1;
    renderEmployeesTable();
}

/**
 * עדכון מידע דפדוף
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage) || 1;
    
    // עדכון מידע על עמודים
    pageInfoSpan.textContent = `עמוד ${currentPage} מתוך ${totalPages}`;
    
    // עדכון מצב כפתורי דפדוף
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // עדכון מחלקות
    prevPageBtn.classList.toggle('disabled', currentPage === 1);
    nextPageBtn.classList.toggle('disabled', currentPage === totalPages);
}

/**
 * מעבר לעמוד הקודם
 */
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderEmployeesTable();
    }
}

/**
 * מעבר לעמוד הבא
 */
function goToNextPage() {
    const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage) || 1;
    
    if (currentPage < totalPages) {
        currentPage++;
        renderEmployeesTable();
    }
}