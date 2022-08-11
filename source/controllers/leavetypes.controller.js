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
const Leavetypes = require('../models/Leavetypes.model');

const addUpdateLeavetype = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    const leaveTypePayload = [];
    let message = '';
    try {
        const {
            action,
            data
        } = request.body;

        const {
            lt_Id
        } = request.body.data;

        leaveTypePayload.push(data);

        // validating payload with Joi Schema
        const schema = Joi.object({
            lt_Id: Joi.number().required().allow(null),
            leaveTypeName: Joi.string().min(1).max(100).required(),
            leaveShortName: Joi.string().min(1).max(100).required(),
            leaveShortCode: Joi.string().min(1).max(100).required(),
            description: Joi.string().min(1).max(100).required(),
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

        // const leaveTypes = ['Earned Leave', 'Casual Leave', 'Sick Leave', 'Maternity Leave', 'Compensatory Off', 'Marriage Leave', 'Paternity Leave', 'Bereavement Leave', 'Loss of Pay'];

        // for (let i = 0; i < leaveTypes.length; i += 1) {
        //     const newLeavetype = {
        //         lt_Id: null,
        //         leaveTypeName: leaveTypes[i],
        //         description: 'test leave data',
        //         status: 1
        //     }
        //     const getLeavetypeData = createData(newLeavetype['leaveTypeName']);
        //     console.log('getLeavetypeData isss', getLeavetypeData);
        //     newLeavetype['leaveShortName'] = getLeavetypeData[0];
        //     newLeavetype['leaveShortCode'] = getLeavetypeData[1];
        //     leaveTypePayload.push(newLeavetype);
        // }

        // console.log('leaveTypePayload isss:', leaveTypePayload);

        // start transaction to insert/update leavetype
        await Leavetypes.transaction(async trx => {

            for (const item of leaveTypePayload) {
                if (!item['lt_Id']) {
                    await Leavetypes.query(request.knex).insert(item).transacting(trx).then(async result => {
                        // console.log('Get added leavetype result isss', result);
                    }).catch(insertErr => {
                        message = message || 'Error while inserting leavetype';
                        throw insertErr;
                    });
                } else {
                    await Leavetypes.query(request.knex)
                        .update(item)
                        .whereRaw(`lt_Id = ${Number(lt_Id)}`)
                        .transacting(trx)
                        .then(async result2 => {
                            // console.log('Get updated leavetype result isss', result2);
                        }).catch(updateErr => {
                            message = message || 'Error while updating leavetype';
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
            message: action == 'I' ? 'New Leavetype added successful' : 'Leavetype updated successful',
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

const getLeavetypesData = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let leavetypesList = [];
    let leavetypesCount = 0;
    let message = '';
    try {
        let {
            limit,
            page,
            query,
            status
        } = request.body;

        page = (Number(page) - 1) * Number(limit);

        let whereRawQuery = '1=1';

        if (query) {
            whereRawQuery = `lt.leaveTypeName LIKE '%${query}%' OR lt.leaveShortName LIKE '%${query}%' OR lt.leaveShortCode LIKE '%${query}%'`
        }

        let whereStatus = '1=1';

        if (status !== 'all') {
            whereStatus = `lt.status = ${status}`;
        }

        // SELECT LIST query
        await Leavetypes.query(request.knex)
            .select('lt.*')
            .alias('lt')
            .whereRaw(`(${whereRawQuery}) AND (${whereStatus})`)
            .limit(limit)
            .offset(page)
            .then(async list => {
                console.log('Get leavetypes list response', list);
                leavetypesList = list;
            }).catch(getListErr => {
                message = 'Error while getting leavetypes list';
                throw getListErr;
            });

        // COUNT SELECT query
        await Leavetypes.query(request.knex)
            .count('* as totalLeavetypes')
            .alias('lt')
            .whereRaw(`(${whereRawQuery}) AND (${whereStatus})`)
            .then(async count => {
                console.log('Get leavetypes count response', count);
                leavetypesCount = count && count.length ? count[0]['totalLeavetypes'] : 0;
            }).catch(getCountErr => {
                message = 'Error while getting leavetypes count';
                throw getCountErr;
            });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: 'Get leavetypes list successful',
            data: {
                list: leavetypesList,
                count: leavetypesCount
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

const getLeavetypeDataById = async (request, response, next) => {
    console.log('request params isss', request.params);
    let result = {};
    let leavetypeData = {};
    let message = '';
    try {
        const {
            lt_Id
        } = request.params;
        const whereRawQuery = `lt.lt_Id = ${Number(lt_Id)}`;

        // SELECT LIST query
        await Leavetypes.query(request.knex)
            .select('lt.*')
            .alias('lt')
            .whereRaw(whereRawQuery)
            .then(async data => {
                console.log('Get leavetype data response', data);
                leavetypeData = data && data.length > 0 ? data[0] : {};
            }).catch(getDataErr => {
                message = 'Error while getting leavetype data';
                throw getDataErr;
            });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: 'Get leavetype data by id successful',
            data: leavetypeData
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

const updateLeavetypeStatus = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let message = '';
    try {
        const {
            lt_Id,
            status
        } = request.body;

        // start transaction to update leavetype status
        await Leavetypes.transaction(async trx => {

            await Leavetypes.query(request.knex)
                .transacting(trx)
                .update(request.body)
                .alias('lt')
                .whereRaw(`lt.lt_Id = ${Number(lt_Id)}`)
                .then(async data => {
                    console.log('Get update leavetype data response', data);
                }).catch(updateErr => {
                    message = 'Error while update leavetype data';
                    throw updateErr;
                });

        }).catch(trxErr => {
            message = 'Error while start transaction to update leavetype data';
            throw trxErr;
        });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: status == 0 ? 'Leavetype deactivated successful' : 'Leavetype restored successful',
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

function createData(leavetypeName) {
    const tempLeavetype = leavetypeName.split('');
    let leaveShortName = null;
    let leaveShortCode = null;
    let tempShortName = [];
    
    if (tempLeavetype && tempLeavetype.length && Number(tempLeavetype[0].charCodeAt(0)) !== 32) {
        tempShortName.push(tempLeavetype[0].toUpperCase());
    }

    let spaceData = {};
    let index = 0;

    for (const item of tempLeavetype) {
        if (Number(item.charCodeAt(0)) === 32) {
            spaceData[index + 1] = index + 1;
        }
        index = index + 1;
    }

    for (const [key, value] of Object.entries(spaceData)) {
        if (tempLeavetype[key]) {
            tempShortName.push(tempLeavetype[key].toUpperCase());
        }
    }
    console.log('tempShortName isss', tempShortName);

    if (tempShortName && tempShortName.length > 0) {
        leaveShortName = (tempShortName.join("")).toString();
        leaveShortCode = (`${tempShortName.join("")}_LEAVETYPE`).toString();
    } else {
        leaveShortName = null;
        leaveShortCode = null;
    }
    
    return [leaveShortName, leaveShortCode];
}

module.exports = {
    addUpdateLeavetype,
    getLeavetypesData,
    getLeavetypeDataById,
    updateLeavetypeStatus
}