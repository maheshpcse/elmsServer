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
const config = require('../config/config');
const Employees = require('../models/Employees.model');
const Users = require('../models/Users.model');
const Leavetypes = require('../models/Leavetypes.model');
const Leavebalance = require('../models/Leavebalance.model');
const Leavehistory = require('../models/Leavehistory.model');

const getEmployeeLeavetypes = async (request, response, next) => {
    console.log('request body isss', request.body);
    let leavetypes = [];
    let empLeaveBalance = [];
    let empLeaveHistory = [];
    let result = {};
    let message = '';
    try {
        const {
            emp_id,
            type
        } = request.body;

        // Leavetypes SELECT LIST query
        await Leavetypes.query(request.knex)
            .select(raw('lt.*, 0 AS leaveBalance'))
            .alias('lt')
            .whereRaw(`lt.status = 1`)
            .then(async data => {
                console.log('Get leavetypes data response', data);
                leavetypes = data && data.length > 0 ? data : [];
                for (const item of leavetypes) {
                    item['appliedLeaves'] = [];
                }
            }).catch(getLeaveTypesErr => {
                message = 'Error while getting leavetypes data';
                throw getLeaveTypesErr;
            });

        if (type === 'apply-leave') {
            // Leavebalance SELECT LIST query
            await Leavebalance.query(request.knex)
                .select('lb.*')
                .alias('lb')
                .whereRaw(`lb.emp_id = '${emp_id}' AND lb.status = 1`)
                .then(async data => {
                    console.log('Get employee leave balance data response', data);
                    empLeaveBalance = data && data.length > 0 ? data : [];
                    for (const item of empLeaveBalance) {
                        item['appliedLeaves'] = [];
                    }
                }).catch(getLeaveBalanceErr => {
                    message = 'Error while getting employee leave balance data';
                    throw getLeaveBalanceErr;
                });

            // Leavehistory SELECT LIST query
            await Leavehistory.query(request.knex)
                .select('lh.*')
                .alias('lh')
                .whereRaw(`lh.emp_id = '${emp_id}' AND lh.status = 2`)
                .then(async data => {
                    console.log('Get employee leave history data response', data);
                    empLeaveHistory = data && data.length > 0 ? data : [];

                    const groupByEmpLeaveBalance = _.groupBy(empLeaveBalance, 'leaveShortCode');

                    for (const item of empLeaveHistory) {
                        if (groupByEmpLeaveBalance[item.leaveShortCode]) {
                            const noOfLeaves = Math.abs(moment(item.leaveEndDate).diff(moment(item.leaveStartDate), 'days')) + 1;
                            groupByEmpLeaveBalance[item.leaveShortCode][0]['leaveBalance'] -= noOfLeaves;
                            for (let i = 0; i <= noOfLeaves; i += 1) {
                                const tempLeaveEndDate = moment(item.leaveStartDate).add(i, 'days').format('YYYY-MM-DD');
                                if (tempLeaveEndDate <= item.leaveEndDate) {
                                    groupByEmpLeaveBalance[item.leaveShortCode][0]['appliedLeaves'].push(tempLeaveEndDate);
                                }
                            }
                        }
                    }
                    console.log('Final groupByEmpLeaveBalance isss', groupByEmpLeaveBalance);

                    for (const item of leavetypes) {
                        if (groupByEmpLeaveBalance[item.leaveShortCode]) {
                            item['leaveBalance'] = groupByEmpLeaveBalance[item.leaveShortCode][0]['leaveBalance'];
                            item['appliedLeaves'] = groupByEmpLeaveBalance[item.leaveShortCode][0]['appliedLeaves'];
                        }
                    }
                    console.log('Final leavetypes isss', leavetypes);

                }).catch(getLeaveHistoryErr => {
                    message = 'Error while getting employee leave history data';
                    throw getLeaveHistoryErr;
                });
        }

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: type ? 'Get employee leaves and balance successful' : 'Get all leavetypes successful',
            data: leavetypes
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

const applyLeaveToEmployee = async (request, response, next) => {
    console.log('request body isss', request.body);
    let empLeaveAppliedData = {};
    let result = {};
    let message = '';
    try {
        const {
            action,
            data
        } = request.body;

        const {
            lh_Id,
            emp_id,
            leaveShortCode
        } = request.body.data;

        empLeaveAppliedData = data;

        // validating payload with Joi Schema
        const schema = Joi.object({
            lh_Id: Joi.number().required().allow(null),
            emp_id: Joi.string().min(1).max(100).required(),
            leaveShortCode: Joi.string().min(1).max(100).required(),
            leaveStartDate: Joi.string().min(1).max(100).required(),
            leaveEndDate: Joi.string().min(1).max(100).required(),
            leaveAppliedDate: Joi.string().min(1).max(100).required(),
            reason: Joi.string().min(1).max(100).required(),
            effectiveMonth: Joi.string().min(1).max(100).required(),
            remarks: Joi.string().min(1).max(100).required().allow(null),
            status: Joi.number().min(1).max(1).allow(0, 1, 2, 3, null).required()
        });

        const {
            error,
            value
        } = schema.validate(data);

        if (error) {
            console.log('error isss:', error);
            message = error && error.details.length ? error.details[0]['message'] : 'Error while validating data';
            throw new Error(message);
        }

        // check if emloyee leave balance is available or not
        await Leavebalance.query(request.knex)
            .select('lb.*')
            .alias('lb')
            .whereRaw(`lb.emp_id = '${emp_id}' AND lb.leaveShortCode = '${leaveShortCode}' AND lb.status = 1`)
            .then(async result => {
                console.log('Get employee leave balance result isss', result);
                const empLeaveBalance = result && result.length ? result[0]['leaveBalance'] : 0;
                if (empLeaveBalance == 0) {
                    message = 'You have no leave balance';
                    throw new Error(message);
                }
            }).catch(getBalanceErr => {
                message = message || 'Error while checking employee leave balance';
                throw getBalanceErr;
            });

        // start transaction to insert/update employee leave applied data
        await Leavehistory.transaction(async trx => {

            if (!lh_Id) {
                await Leavehistory.query(request.knex).insert(empLeaveAppliedData).transacting(trx).then(async result => {
                    // console.log('Get added employee leave applied data result isss', result);
                }).catch(insertErr => {
                    message = message || 'Error while inserting employee leave applied data';
                    throw insertErr;
                });
            } else {
                await Leavehistory.query(request.knex)
                    .update(empLeaveAppliedData)
                    .whereRaw(`lh_Id = ${Number(lh_Id)}`)
                    .transacting(trx)
                    .then(async result2 => {
                        // console.log('Get updated employee leave applied data result isss', result2);
                    }).catch(updateErr => {
                        message = message || 'Error while updating employee leave applied data';
                        throw updateErr;
                    });
            }

        }).catch(trxErr => {
            message = message || 'Error while start transaction';
            throw trxErr;
        });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: action == 'I' ? 'New Leave applied successful' : 'Applied leave updated successful',
            data: []
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

const getAllLeaveHistoryToEmployee = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let leavesAppliedList = [];
    let leavesAppliedCount = 0;
    let message = '';
    try {
        let {
            emp_id,
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

const getEmployeeLeaveHistoryById = async (request, response, next) => {
    console.log('request params isss', request.params);
    let result = {};
    let empLeaveHistoryData = {};
    let message = '';
    try {
        const {
            lh_Id
        } = request.params;
        const whereRawQuery = `lh.lh_Id = ${Number(lh_Id)}`;

        // SELECT LIST query
        await Leavehistory.query(request.knex)
            .select('lh.*')
            .alias('lh')
            .whereRaw(whereRawQuery)
            .then(async data => {
                console.log('Get employee leavehistory data response', data);
                empLeaveHistoryData = data && data.length > 0 ? data[0] : {};
            }).catch(getDataErr => {
                message = 'Error while getting employee leavehistory data';
                throw getDataErr;
            });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: 'Get employee leavehistory data by id successful',
            data: empLeaveHistoryData
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

const deleteLeaveRequestToEmployee = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let message = '';
    try {
        const {
            lh_Id
        } = request.body;

        // start transaction to delete leave request status
        await Leavehistory.transaction(async trx => {

            await Leavehistory.query(request.knex)
                .transacting(trx)
                .update(request.body)
                .alias('lh')
                .whereRaw(`lh.lh_Id = ${Number(lh_Id)}`)
                .then(async data => {
                    console.log('Get delete leave request data response', data);
                }).catch(deleteErr => {
                    message = 'Error while delete leave request data';
                    throw deleteErr;
                });

        }).catch(trxErr => {
            message = 'Error while start transaction to delete leave request data';
            throw trxErr;
        });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: 'Employee leave request cancelled successful',
            data: []
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
    getEmployeeLeavetypes,
    applyLeaveToEmployee,
    getAllLeaveHistoryToEmployee,
    getEmployeeLeaveHistoryById,
    deleteLeaveRequestToEmployee
}