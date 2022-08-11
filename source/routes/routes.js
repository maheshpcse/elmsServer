const express = require('express');
const router = express.Router();
const authAdminCtrl = require('../controllers/authAdmin.controller');
const authUserCtrl = require('../controllers/authUser.controller');
const adminDashboardCtrl = require('../controllers/adminDashboard.controller');
const employeesCtrl = require('../controllers/employees.controller');
const departmentCtrl = require('../controllers/departments.controller');
const leavetypeCtrl = require('../controllers/leavetypes.controller');
const leaveManagementCtrl = require('../controllers/leaveManagement.controller');

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

// Manage Admin Dashboard routes
router.get('/get_admin_dashboard_counts', authAdminCtrl.validateAdmin, adminDashboardCtrl.getAdminDashboardCounts);

// Manage Employee routes
router.post('/add_update_single_employee', authAdminCtrl.validateAdmin, employeesCtrl.addUpdateSingleEmployee);
router.post('/get_employees_data', authAdminCtrl.validateAdmin, employeesCtrl.getEmployeesData);
router.get('/get_all_departments_data', authAdminCtrl.validateAdmin, employeesCtrl.getDepartmentsData);
router.get('/get_employee_by_id/:userId', authAdminCtrl.validateAdmin, employeesCtrl.getEmployeeDataById);
router.post('/update_employee_status', authAdminCtrl.validateAdmin, employeesCtrl.updateEmployeeStatus);
router.post('/generate_password', authAdminCtrl.validateAdmin, employeesCtrl.generatePasswordToEmployee);

// Manage Department routes
router.post('/add_update_department', authAdminCtrl.validateAdmin, departmentCtrl.addUpdateDepartment);
router.post('/get_departments_data', authAdminCtrl.validateAdmin, departmentCtrl.getDepartmentsData);
router.get('/get_department_by_id/:deptId', authAdminCtrl.validateAdmin, departmentCtrl.getDepartmentDataById);
router.post('/update_department_status', authAdminCtrl.validateAdmin, departmentCtrl.updateDepartmentStatus);

// Manage Leavetype routes
router.post('/add_update_leavetype', authAdminCtrl.validateAdmin, leavetypeCtrl.addUpdateLeavetype);
router.post('/get_leavetypes_data', authAdminCtrl.validateAdmin, leavetypeCtrl.getLeavetypesData);
router.get('/get_leavetype_by_id/:lt_Id', authAdminCtrl.validateAdmin, leavetypeCtrl.getLeavetypeDataById);
router.post('/update_leavetype_status', authAdminCtrl.validateAdmin, leavetypeCtrl.updateLeavetypeStatus);

// Employee authentication routes
router.post('/login', authUserCtrl.employeeLogin);
router.post('/signup', authUserCtrl.employeeSignUp);
router.post('/reSignIn', authUserCtrl.employeeReSignIn);

// Employee profile update routes
router.post('/employee_change_password', authUserCtrl.validateEmployee, authUserCtrl.changePasswordToEmployee);
router.post('/get_employee_profile_data', authUserCtrl.validateEmployee, authUserCtrl.getEmployeeProfileData);
router.post('/update_employee_profile_data', authUserCtrl.validateEmployee, authUserCtrl.updateEmployeeProfileData);

// Employee Leave Management Routes
router.post('/get_employee_leavetypes', authUserCtrl.validateEmployee, leaveManagementCtrl.getEmployeeLeavetypes);
router.post('/add_update_applied_leave_data', authUserCtrl.validateEmployee, leaveManagementCtrl.applyLeaveToEmployee);
router.post('/get_employee_all_leave_history', authUserCtrl.validateEmployee, leaveManagementCtrl.getAllLeaveHistoryToEmployee);
router.get('/get_employee_leave_history_by_id/:lh_Id', authUserCtrl.validateEmployee, leaveManagementCtrl.getEmployeeLeaveHistoryById);
router.post('/cancel_leave_request', authUserCtrl.validateEmployee, leaveManagementCtrl.deleteLeaveRequestToEmployee);

module.exports = router;