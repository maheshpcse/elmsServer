const {
    raw
} = require('objection');
const Joi = require('joi');
const {
    faker
} = require('@faker-js/faker');
const converter = require('number-to-words');
const moment = require('moment');
const _ = require('underscore');
const nodemailer = require('nodemailer');
const randomString = require('randomstring');
const config = require('../config/config');
const Employees = require('../models/Employees.model');
const Departments = require('../models/Departments.model');
const Leavetypes = require('../models/Leavetypes.model');

const getAdminDashboardCounts = async (request, response, next) => {
    console.log('request body isss', request.body);
    let dashboardCounts = {
        employees: 0,
        departments: 0,
        leavetypes: 0
    }
    let message = '';
    try {
        // Employee COUNT SELECT query
        await Employees.query(request.knex)
            .count('* as totalEmps')
            .alias('e')
            .then(async count => {
                console.log('Get employees count response', count);
                dashboardCounts['employees'] = count && count.length ? count[0]['totalEmps'] : 0;
            }).catch(getEmpCountErr => {
                message = 'Error while getting employees count';
                throw getEmpCountErr;
            });

        // Department COUNT SELECT query
        await Departments.query(request.knex)
            .count('* as totalDepts')
            .alias('d')
            .then(async count => {
                console.log('Get departments count response', count);
                dashboardCounts['departments'] = count && count.length ? count[0]['totalDepts'] : 0;
            }).catch(getDeptCountErr => {
                message = 'Error while getting departments count';
                throw getDeptCountErr;
            });

        // Leavetype COUNT SELECT query
        await Leavetypes.query(request.knex)
            .count('* as totalLeavetypes')
            .alias('lt')
            .then(async count => {
                console.log('Get leavetypes count response', count);
                dashboardCounts['leavetypes'] = count && count.length ? count[0]['totalLeavetypes'] : 0;
            }).catch(getLeaveTypeCountErr => {
                message = 'Error while getting leavetypes count';
                throw getLeaveTypeCountErr;
            });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: 'Get admin dashboard counts successful',
            data: dashboardCounts
        }
    } catch (error) {
        console.log('Error at try catch API result', error);
        result = {
            success: false,
            error: true,
            statusCode: 500,
            message: message || 'Error at try catch API result',
            data: []
        }
    }
    return response.status(200).json(result);
}

const getEmployeeLeaveHistory = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let leavesAppliedList = [];
    let leavesAppliedCount = 0;
    let message = '';
    try {
        let {
            limit,
            page,
            query,
            status,
            leavetype
        } = request.body;

        page = (Number(page) - 1) * Number(limit);

        let whereRawQuery = '1=1';

        if (query) {
            whereRawQuery = `lh.emp_id LIKE '%${query}%' OR lh.leaveShortCode LIKE '%${query}%' OR lh.leaveStartDate LIKE '%${query}%' OR lh.leaveEndDate LIKE '%${query}%' OR lh.leaveAppliedDate LIKE '%${query}%' OR lh.effectiveMonth LIKE '%${query}%'`
        }

        let whereStatus = '1=1';

        if (status !== 'all') {
            whereStatus = `lh.status = ${status}`;
        }

        let whereLeavetype = '1=1';

        if (leavetype !== 'all') {
            whereLeavetype = `lt.leaveShortCode = '${leavetype}'`;
        }

        // SELECT LIST query
        await Leavehistory.query(request.knex)
            .select(raw(`lh.*, lt.leaveTypeName`))
            .alias('lh')
            .innerJoin(
                raw(`${Leavetypes.tableName} AS lt ON lt.leaveShortCode = lh.leaveShortCode AND lt.status = 1`)
            )
            .whereRaw(`lh.emp_id = '${emp_id}' AND (${whereRawQuery}) AND ${whereStatus} AND ${whereLeavetype}`)
            .limit(limit)
            .offset(page)
            .then(async list => {
                console.log('Get employee leaves applied list response', list);
                leavesAppliedList = list;
            }).catch(getListErr => {
                message = 'Error while getting employee leaves applied list';
                throw getListErr;
            });

        // COUNT SELECT query
        await Leavehistory.query(request.knex)
            .count('* as totalLeavesApplied')
            .alias('lh')
            .innerJoin(
                raw(`${Leavetypes.tableName} AS lt ON lt.leaveShortCode = lh.leaveShortCode AND lt.status = 1`)
            )
            .whereRaw(`lh.emp_id = '${emp_id}' AND (${whereRawQuery}) AND ${whereStatus} AND ${whereLeavetype}`)
            .then(async count => {
                console.log('Get employee leaves applied count response', count);
                leavesAppliedCount = count && count.length ? count[0]['totalLeavesApplied'] : 0;
            }).catch(getCountErr => {
                message = 'Error while getting employee leaves applied count';
                throw getCountErr;
            });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: 'Get employee leaves applied list successful',
            data: {
                list: leavesAppliedList,
                count: leavesAppliedCount
            }
        }
    } catch (error) {
        console.log('Error at try catch API result', error);
        result = {
            success: false,
            error: true,
            statusCode: 500,
            message: message || 'Error at try catch API result',
            data: []
        }
    }
    return response.status(200).json(result);
}

module.exports = {
    getAdminDashboardCounts,
    getEmployeeLeaveHistory
}