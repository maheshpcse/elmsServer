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
const Departments = require('../models/Departments.model');

const addUpdateDepartment = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    const deptPayload = [];
    let message = '';
    try {
        const {
            action,
            data
        } = request.body;

        const {
            deptId
        } = request.body.data;

        deptPayload.push(data);

        // validating payload with Joi Schema
        const schema = Joi.object({
            deptId: Joi.number().required().allow(null),
            departmentName: Joi.string().min(1).max(100).required(),
            departmentShortName: Joi.string().min(1).max(100).required(),
            departmentShortCode: Joi.string().min(1).max(100).required(),
            status: Joi.number().min(1).max(1).allow(0, 1, null).required()
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

        // for (let i = 1; i <= 15; i += 1) {
        //     const newDept = {
        //         deptId: null,
        //         departmentName: faker.name.jobType(),
        //         status: 1
        //     }
        //     const getDepartmentData = createData(newDept['departmentName']);
        //     console.log('getDepartmentData isss', getDepartmentData);
        //     newDept['departmentShortName'] = getDepartmentData[0];
        //     newDept['departmentShortCode'] = getDepartmentData[1];
        //     deptPayload.push(newDept);
        // }

        // console.log('deptPayload isss:', deptPayload);

        // start transaction to insert/update department
        await Departments.transaction(async trx => {

            for (const item of deptPayload) {
                if (!item['deptId']) {
                    await Departments.query(request.knex).insert(item).transacting(trx).then(async result => {
                        // console.log('Get added department result isss', result);
                    }).catch(insertErr => {
                        message = message || 'Error while inserting department';
                        throw insertErr;
                    });
                } else {
                    await Departments.query(request.knex)
                        .update(item)
                        .whereRaw(`deptId = ${Number(deptId)}`)
                        .transacting(trx)
                        .then(async result2 => {
                            // console.log('Get updated department result isss', result2);
                        }).catch(updateErr => {
                            message = message || 'Error while updating department';
                            throw updateErr;
                        });
                }
            }

        }).catch(trxErr => {
            message = message || 'Error while start transaction';
            throw trxErr;
        });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: action == 'I' ? 'New Department added successful' : 'Department updated successful',
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

const getDepartmentsData = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let departmentsList = [];
    let departmentsCount = 0;
    let message = '';
    try {
        let {
            limit,
            page,
            query,
            status
        } = request.body;

        page = (Number(page) - 1) * Number(limit);

        let whereRawQuery = '1=1'

        if (query) {
            whereRawQuery = `d.departmentName LIKE '%${query}%' OR d.departmentShortName LIKE '%${query}%' OR d.departmentShortCode LIKE '%${query}%'`
        }

        let whereStatus = '1=1'

        if (status !== 'all') {
            whereStatus = `d.status = ${status}`;
        }

        // SELECT LIST query
        await Departments.query(request.knex)
            .select('d.*')
            .alias('d')
            .whereRaw(`(${whereRawQuery}) AND (${whereStatus})`)
            .limit(limit)
            .offset(page)
            .then(async list => {
                console.log('Get departments list response', list);
                departmentsList = list;
            }).catch(getListErr => {
                message = 'Error while getting departments list';
                throw getListErr;
            });

        // COUNT SELECT query
        await Departments.query(request.knex)
            .count('* as totalDepts')
            .alias('d')
            .whereRaw(`(${whereRawQuery}) AND (${whereStatus})`)
            .then(async count => {
                console.log('Get departments count response', count);
                departmentsCount = count && count.length ? count[0]['totalDepts'] : 0;
            }).catch(getCountErr => {
                message = 'Error while getting departments count';
                throw getCountErr;
            });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: 'Ger departments list successful',
            data: {
                list: departmentsList,
                count: departmentsCount
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

const getDepartmentDataById = async (request, response, next) => {
    console.log('request params isss', request.params);
    let result = {};
    let departmentData = {};
    let message = '';
    try {
        const {
            deptId
        } = request.params;
        const whereRawQuery = `d.deptId = ${Number(deptId)}`;

        // SELECT LIST query
        await Departments.query(request.knex)
            .select('d.*')
            .alias('d')
            .whereRaw(whereRawQuery)
            .then(async data => {
                console.log('Get department data response', data);
                departmentData = data && data.length > 0 ? data[0] : {};
            }).catch(getDataErr => {
                message = 'Error while getting department data';
                throw getDataErr;
            });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: 'Ger department data by id successful',
            data: departmentData
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

const updateDepartmentStatus = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let message = '';
    try {
        const {
            deptId,
            status
        } = request.body;

        // start transaction to update department status
        await Departments.transaction(async trx => {

            await Departments.query(request.knex)
                .transacting(trx)
                .update(request.body)
                .alias('d')
                .whereRaw(`d.deptId = ${Number(deptId)}`)
                .then(async data => {
                    console.log('Get update department data response', data);
                }).catch(updateErr => {
                    message = 'Error while update department data';
                    throw updateErr;
                });

        }).catch(trxErr => {
            message = 'Error while start transaction to update department data';
            throw trxErr;
        });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: status == 0 ? 'Department deactivated successful' : 'Department restored successful',
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

function createData(deptName) {
    const tempDept = deptName.split('');
    let deptShortName = null;
    let deptShortCode = null;
    let tempShortName = [];
    
    if (tempDept && tempDept.length && Number(tempDept[0].charCodeAt(0)) !== 32) {
        tempShortName.push(tempDept[0].toUpperCase());
    }

    let spaceData = {};
    let index = 0;

    for (const item of tempDept) {
        if (Number(item.charCodeAt(0)) === 32) {
            spaceData[index + 1] = index + 1;
        }
        index = index + 1;
    }

    for (const [key, value] of Object.entries(spaceData)) {
        if (tempDept[key]) {
            tempShortName.push(tempDept[key].toUpperCase());
        }
    }
    console.log('tempShortName isss', tempShortName);

    if (tempShortName && tempShortName.length > 0) {
        deptShortName = (tempShortName.join("")).toString();
        deptShortCode = (`${tempShortName.join("")}_DEPT`).toString();
    } else {
        deptShortName = null;
        deptShortCode = null;
    }
    
    return [deptShortName, deptShortCode];
}

module.exports = {
    addUpdateDepartment,
    getDepartmentsData,
    getDepartmentDataById,
    updateDepartmentStatus
}