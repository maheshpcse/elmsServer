const {
    raw
} = require('objection');
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

const validateEmployee = async(request, response, next) => {
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
                if (decoded.email === email) {
                    next();
                } else {
                    message = 'Token is invalid'
                    throw new Error(message);
                }
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

const employeeReSignIn = async(request, response, next) => {
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

module.exports = {
    employeeLogin,
    employeeSignUp,
    validateEmployee,
    employeeReSignIn
}