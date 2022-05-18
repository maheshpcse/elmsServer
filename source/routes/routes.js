const express = require('express');
const router = express.Router();
const authAdminCtrl = require('../controllers/authAdmin.controller');
const authUserCtrl = require('../controllers/authUser.controller');
const employeesCtrl = require('../controllers/employees.controller');
const departmentCtrl = require('../controllers/departments.controller');

// Server routes
router.get('/', (request, response, next) => {
    response.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Socket works!'
    });
});
router.get('/server', (request, response, next) => {
    console.log("API works!");
    response.status(200).json({
        success: true,
        statusCode: 200,
        message: 'API works!'
    });
});

router.get('/getNotifications', (request, response) => {
    console.log('request body isss', request.body);
    
    response.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Get notifications successful',
        data: 2
    });
});

router.post('/apply_leave', (request, response) => {
    console.log('request body isss', request.body);
    
    response.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Leave applied successful',
        data: []
    });
});

// Admin authentication routes
router.post('/admin_login', authAdminCtrl.adminLogin);
router.post('/reSignIn/admin', authAdminCtrl.adminReSignIn);

// Employee authentication routes
router.post('/login', authUserCtrl.employeeLogin);
router.post('/signup', authUserCtrl.employeeSignUp);
router.post('/reSignIn', authUserCtrl.employeeReSignIn);

// Manage Employee routes
router.post('/add_update_single_employee', authAdminCtrl.validateAdmin, employeesCtrl.addUpdateSingleEmployee);
router.post('/get_employees_data', authAdminCtrl.validateAdmin, employeesCtrl.getEmployeesData);
router.get('/get_employee_by_id/:userId', authAdminCtrl.validateAdmin, employeesCtrl.getEmployeeDataById);
router.post('/update_employee_status', authAdminCtrl.validateAdmin, employeesCtrl.updateEmployeeStatus);
router.post('/generate_password', authAdminCtrl.validateAdmin, employeesCtrl.generatePasswordToEmployee);

// Manage Department routes
router.post('/add_update_department', authAdminCtrl.validateAdmin, departmentCtrl.addUpdateDepartment);
router.post('/get_departments_data', authAdminCtrl.validateAdmin, departmentCtrl.getDepartmentsData);
router.get('/get_department_by_id/:deptId', authAdminCtrl.validateAdmin, departmentCtrl.getDepartmentDataById);
router.post('/update_department_status', authAdminCtrl.validateAdmin, departmentCtrl.updateDepartmentStatus);

module.exports = router;