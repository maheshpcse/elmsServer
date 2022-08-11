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
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const config = require('../config/config');
const Employees = require('../models/Employees.model');
const Users = require('../models/Users.model');

const employeeLogin = async (request, response, next) => {
    console.log('request body isss', request.body);
    let employeeData = {};
    let message = '';
    try {
        const {
            employeeId,
            password
        } = request.body;

        await Users.query(request.knex)
            .select('u.*', 'e.*')
            .alias('u')
            .innerJoin(
                raw(`${Employees.tableName} AS e ON e.userId = u.user_id AND e.employeeId = u.emp_id AND e.status = 1`)
            )
            .whereRaw(`u.emp_id = '${employeeId}' AND u.status = 1`)
            .then(async result => {
                console.log('Get employee login result isss', result);

                if (result && result.length) {
                    const match = await bcrypt.compare(password, result[0].password);
                    console.log('match password isss', match);

                    if (match) {
                        employeeData = Object.assign({}, result[0]);
                        const accessToken = JWT.sign({
                            userId: employeeData.userId,
                            employeeId: employeeData.employeeId,
                            userName: employeeData.userName
                        }, config.database.securitykey, {
                            algorithm: 'HS256',
                            expiresIn: '30m'
                        });
                        const refreshToken = JWT.sign({
                            userId: employeeData.userId,
                            employeeId: employeeData.employeeId,
                            userName: employeeData.userName
                        }, config.database.securitykey, {
                            algorithm: 'HS256',
                            expiresIn: '1hr'
                        });
                        employeeData['token'] = accessToken;
                        employeeData['accessToken'] = accessToken;
                        employeeData['refreshToken'] = refreshToken;
                    } else {
                        message = 'Password is invalid';
                        throw new Error(message);
                    }
                } else if (result && result.length < 0) {
                    message = 'Employee ID is invalid'
                    throw new Error(message);
                } else {
                    message = 'Error while generating token'
                    throw new Error(message);
                }

            }).catch(getErr => {
                message = message || 'Error while finding employeeId';
                throw getErr;
            });

        return response.status(200).json({
            success: true,
            error: false,
            statusCode: 200,
            message: 'Employee login successful',
            data: employeeData
        });
    } catch (error) {
        console.log('Error at try catch API result', error);
        return response.status(200).json({
            success: false,
            error: true,
            statusCode: 500,
            message: message || 'Error at try catch API result',
            data: []
        });
    }
}

const employeeSignUp = async (request, response, next) => {
    console.log('request body isss', request.body);
    let employeeData = {};
    let message = '';
    try {
        const {
            password
        } = request.body;

        employeeData = request.body;

        // hash and encrypt employee password
        await bcrypt.hash(password, 10).then(async hash => {
            console.log('hash password isss:', hash);
            employeeData['password'] = hash;
        }).catch(hashErr => {
            message = 'Error while encrypt the password';
            throw hashErr;
        });

        // start transaction to insert new employee
        await Employees.transaction(async trx => {

            await Employees.query(request.knex)
                .insert(employeeData)
                .transacting(trx)
                .then(async result => {
                    // console.log('Get employee signup result isss', result);

                    const userData = {
                        user_id: result['userId'],
                        emp_id: null,
                        password: employeeData['password'],
                        status: 1
                    }

                    await Users.query(request.knex)
                        .insert(userData)
                        .transacting(trx)
                        .then(async result => {
                            console.log('Get employee signup result isss', result);
                        }).catch(insertErr => {
                            message = message || 'Error while inserting employee';
                            throw insertErr;
                        });
                }).catch(insertErr => {
                    message = message || 'Error while inserting employee';
                    throw insertErr;
                });

        }).catch(trxErr => {
            message = message || 'Error while start transaction';
            throw trxErr;
        });

        return response.status(200).json({
            success: true,
            error: false,
            statusCode: 200,
            message: 'Employee singup successful',
            data: []
        });
    } catch (error) {
        console.log('Error at try catch API result', error);
        return response.status(200).json({
            success: false,
            error: true,
            statusCode: 500,
            message: message || 'Error at try catch API result',
            data: []
        });
    }
}

const validateEmployee = async (request, response, next) => {
    console.log('request body isss', request.headers);
    let message = '';
    try {
        let token = request.headers['authorization'] || request.headers['x-access-token'];
        console.log('token isss:', token);

        if (!token || token === '') {
            message = 'Token is empty';
            throw new Error(message);
        }

        token = token.split(',')[0];

        console.log('final token isss', token);

        await JWT.verify(token, config.database.securitykey, async (err, decoded) => {
            if (err) {
                console.log('error data isss:', err);
                message = err && err.message ? err.message : 'Error while jwt verification';
                throw new Error(message);
            } else {
                console.log('decoded data isss:', decoded);
                await Employees.query(request.knex)
                    .select('e.*')
                    .alias('e')
                    .whereRaw(`e.userName = '${decoded.userName}'`)
                    .then(async data => {
                        console.log('Get employee data isss', data);
                        adminData = data && data.length ? data[0] : {};
                        if (adminData && Object.keys(adminData).length == 0) {
                            message = 'employee data not found'
                            throw new Error(message);
                        } else if (decoded.userName === adminData.userName) {
                            next();
                        } else {
                            message = 'Token is invalid'
                            throw new Error(message);
                        }
                    }).catch(getErr => {
                        message = 'Error while gettign employee data';
                        throw getErr;
                    });
            }
        });

    } catch (error) {
        console.log('Error at try catch API result', error);
        return response.status(200).json({
            success: false,
            error: true,
            statusCode: 500,
            message: message || 'Error at try catch API result',
            data: []
        });
    }
}

const employeeReSignIn = async (request, response, next) => {
    console.log('request body isss', request);
    let employeeData = {};
    let message = '';
    try {
        const {
            employeeId,
            refreshToken
        } = request.body;

        await JWT.verify(refreshToken, config.database.securitykey, (err, decoded) => {
            if (err) {
                console.log('Error isss:', err);
                message = err && err['message'] ? err['message'] : 'Erroo while verifying token';
                throw new Error(message);
            } else {
                console.log('decoded data isss:', decoded);

                if (decoded.employeeId === employeeId) {
                    employeeData = Object.assign({}, decoded);
                    const accessToken = JWT.sign({
                        userId: employeeData.userId,
                        employeeId: employeeData.employeeId,
                        userName: employeeData.userName
                    }, config.database.securitykey, {
                        algorithm: 'HS256',
                        expiresIn: '30m'
                    });
                    const refreshToken = JWT.sign({
                        userId: employeeData.userId,
                        employeeId: employeeData.employeeId,
                        userName: employeeData.userName
                    }, config.database.securitykey, {
                        algorithm: 'HS256',
                        expiresIn: '1hr'
                    });
                    employeeData['token'] = accessToken;
                    employeeData['accessToken'] = accessToken;
                    employeeData['refreshToken'] = refreshToken;
                    delete employeeData['exp'];
                    delete employeeData['iat'];
                } else {
                    message = 'EmployeeID is invalid'
                    throw new Error(message);
                }
            }
        });

        return response.status(200).json({
            success: true,
            error: false,
            statusCode: 200,
            message: 'Employee reSignIn successful',
            data: employeeData
        });
    } catch (error) {
        console.log('Error at try catch API result', error);
        return response.status(200).json({
            success: false,
            error: true,
            statusCode: 500,
            message: message || 'Error at try catch API result',
            data: []
        });
    }
}

const changePasswordToEmployee = async (request, response, next) => {
    console.log('request body isss', request);
    let updatePassword = null;
    let message = '';
    try {
        const {
            emp_id,
            currentPassword,
            newPassword
        } = request.body;

        // check if current password is valid or not
        await Users.query(request.knex)
            .select('u.*')
            .alias('u')
            .whereRaw(`u.emp_id = '${emp_id}'`)
            .then(async data => {
                console.log('Get user data isss', data);

                const match = await bcrypt.compare(currentPassword, data[0].password);
                console.log('match current password isss', match);

                if (match) {
                    // hash and encrypt user new password
                    await bcrypt.hash(newPassword, 10).then(async hash => {
                        console.log('hash new password isss:', hash);
                        updatePassword = hash;
                    }).catch(hashErr => {
                        message = 'Error while encrypt the password';
                        throw hashErr;
                    });

                    // start transaction to update user password
                    await Users.transaction(async trx => {

                        await Users.query(request.knex)
                            .update({
                                emp_id: emp_id,
                                password: updatePassword
                            })
                            .alias('u')
                            .whereRaw(`u.emp_id = '${emp_id}'`)
                            .transacting(trx)
                            .then(async data => {
                                console.log('Get user change password data isss', data);
                            }).catch(updateErr => {
                                message = message || 'Error while changing user password';
                                throw updateErr;
                            });

                    }).catch(trxErr => {
                        message = message || 'Error while start transaction';
                        throw trxErr;
                    });
                } else {
                    message = 'Current password is not match';
                    throw new Error(message);
                }
            }).catch(getErr => {
                message = message || 'Error while getting user data'
                throw getErr;
            });

        return response.status(200).json({
            success: true,
            error: false,
            statusCode: 200,
            message: 'Employee password updated successful',
            data: []
        });
    } catch (error) {
        console.log('Error at try catch API result', error);
        return response.status(200).json({
            success: false,
            error: true,
            statusCode: 500,
            message: message || 'Error at try catch API result',
            data: []
        });
    }
}

const getEmployeeProfileData = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let employeeData = {};
    let message = '';
    try {
        const {
            emp_id
        } = request.body;
        const whereRawQuery = `e.employeeId = '${emp_id}'`;

        // SELECT LIST query
        await Employees.query(request.knex)
            .select('e.*')
            .alias('e')
            .whereRaw(whereRawQuery)
            .then(async data => {
                console.log('Get employee data response isss', data);
                for (const item of data) {
                    item['fullName'] = `${item.firstName} ${item.middleName} ${item.lastName}`;
                    item['user_id'] = item.userId;
                    item['emp_id'] = item.employeeId;
                }
                employeeData = data && data.length > 0 ? data[0] : {};
            }).catch(getDataErr => {
                message = 'Error while getting employee data';
                throw getDataErr;
            });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: 'Get employee profile data successful',
            data: employeeData
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

const updateEmployeeProfileData = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    const empsPayload = [];
    let message = '';
    try {
        const {
            action,
            data
        } = request.body;

        const {
            userId
        } = request.body.data;

        empsPayload.push(data);

        // validating payload with Joi Schema
        const schema = Joi.object({
            userId: Joi.number().required(),
            employeeId: Joi.string().min(6).max(100).pattern(new RegExp(/(emp)[0-9]+\b/)).required(),
            firstName: Joi.string().min(3).max(100).required(),
            middleName: Joi.string().min(3).max(100).required(),
            lastName: Joi.string().min(3).max(100).required(),
            userName: Joi.string().min(3).max(100).required(),
            email: Joi.string().max(100).email({
                minDomainSegments: 2,
                tlds: {
                    allow: ['com', 'net']
                }
            }).required(),
            phoneNumber: Joi.string().min(10).max(50).required(),
            dateOfBirth: Joi.string().max(50).required(),
            bloodGroup: Joi.string().min(2).max(10).required(),
            maritalStatus: Joi.string().max(10).allow('single', 'married').required(),
            address: Joi.string().min(3).max(50).required(),
            cityName: Joi.string().min(3).max(50).required(),
            stateName: Joi.string().min(3).max(50).required(),
            countryName: Joi.string().min(3).max(50).required(),
            zipCode: Joi.string().min(3).max(10).required(),
            designation: Joi.string().min(3).max(50).required(),
            department: Joi.string().min(3).max(50).required(),
            dateOfJoining: Joi.string().max(50).required(),
            profileImage: Joi.string().max(255).required().allow(null, ''),
            role: Joi.string().max(50).required(),
            status: Joi.number().min(1).max(1).allow(0, 1, 2, null).required()
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

        // start transaction to update employee profile data
        await Employees.transaction(async trx => {

            for (const item of empsPayload) {
                await Employees.query(request.knex)
                    .update(item)
                    .whereRaw(`userId = ${Number(userId)}`)
                    .transacting(trx)
                    .then(async result2 => {
                        // console.log('Get updated employee result isss', result2);
                    }).catch(updateErr => {
                        message = message || 'Error while updating employee';
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
            message: 'Profile data updated successful',
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
    employeeLogin,
    employeeSignUp,
    validateEmployee,
    employeeReSignIn,
    changePasswordToEmployee,
    getEmployeeProfileData,
    updateEmployeeProfileData
}