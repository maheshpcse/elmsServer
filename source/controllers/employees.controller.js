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
const bcrypt = require('bcrypt');
const fs = require('fs');
const config = require('../config/config');
const Employees = require('../models/Employees.model');
const Users = require('../models/Users.model');

const addUpdateSingleEmployee = async (request, response, next) => {
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
            userId: Joi.number().required().allow(null),
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

        // for (let i = 1; i <= 28; i += 1) {
        //     let tempLastName = i == 20 ? converter.toWords(i).slice(1) : converter.toWords(i).slice(1).split('-').join(' ');
        //     const newEmp = {
        //         employeeId: `emp${i.toString().padStart(3, 0)}`,
        //         firstName: 'Test',
        //         middleName: 'Employee',
        //         lastName: converter.toWords(i).charAt(0).toUpperCase() + tempLastName,
        //         userName: `TestEmp${i.toString().padStart(3, 0)}`,
        //         email: `testemp${i.toString().padStart(3, 0)}${converter.toWords(i)}@gmail.com`,
        //         phoneNumber: Math.floor(Math.random() * 9999999999).toString(),
        //         dateOfBirth: moment(faker.date.past()).format('YYYY-MM-DD'),
        //         bloodGroup: 'o+',
        //         maritalStatus: 'single',
        //         address: faker.address.streetAddress(),
        //         cityName: faker.address.city(),
        //         stateName: faker.address.state(),
        //         countryName: faker.address.country(),
        //         zipCode: faker.address.zipCode(),
        //         designation: faker.name.jobTitle(),
        //         department: faker.name.jobType(),
        //         dateOfJoining: moment(faker.date.past()).format('YYYY-MM-DD'),
        //         profileImage: faker.image.avatar(),
        //         role: 'employee',
        //         status: 1
        //     }
        //     empsPayload.push(newEmp);
        // }

        // console.log('empsPayload isss:', empsPayload);

        // start transaction to insert/update employee
        await Employees.transaction(async trx => {

            for (const item of empsPayload) {
                if (!item['userId']) {
                    await Employees.query(request.knex).insert(item).transacting(trx).then(async result => {
                        // console.log('Get added employee result isss', result);

                        const userData = {
                            user_id: result['userId'],
                            emp_id: item['employeeId'],
                            password: null,
                            status: 1
                        }
                        await Users.query(request.knex)
                            .insert(userData)
                            .transacting(trx)
                            .then(async result1 => {
                                // console.log('Get added user result isss', result1);
                            }).catch(insertErr => {
                                message = message || 'Error while inserting employee';
                                throw insertErr;
                            });
                    }).catch(insertErr => {
                        message = message || 'Error while inserting employee';
                        throw insertErr;
                    });
                } else {
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
            }

        }).catch(trxErr => {
            message = message || 'Error while start transaction';
            throw trxErr;
        });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: action == 'I' ? 'New Employee added successful' : 'Employee updated successful',
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

const bulkUploadEmployee = async (request, response, next) => {

}

const getEmployeesData = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let employeesList = [];
    let employeesCount = 0;
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
            whereRawQuery = `e.employeeId LIKE '%${query}%' OR e.firstName LIKE '%${query}%' OR e.middleName LIKE '%${query}%' OR e.lastName LIKE '%${query}%' OR e.designation LIKE '%${query}%' OR e.department LIKE '%${query}%' OR e.dateOfBirth LIKE '%${query}%'`
        }

        let whereStatus = '1=1'

        if (status !== 'all') {
            whereStatus = `e.status = ${status}`;
        }

        // SELECT LIST query
        await Employees.query(request.knex)
            .select('e.*', 'u.*')
            .alias('e')
            .innerJoin(
                raw(`${Users.tableName} AS u ON u.user_id = e.userId`)
            )
            .whereRaw(`(${whereRawQuery}) AND (${whereStatus})`)
            .limit(limit)
            .offset(page)
            .then(async list => {
                console.log('Get employees list response', list);
                for (const item of list) {
                    item['fullName'] = `${item.firstName} ${item.middleName} ${item.lastName}`;
                    item['user_id'] = item.userId;
                    item['emp_id'] = item.employeeId;
                }
                employeesList = list;
            }).catch(getListErr => {
                message = 'Error while getting employees list';
                throw getListErr;
            });

        // COUNT SELECT query
        await Employees.query(request.knex)
            .count('* as totalEmps')
            .alias('e')
            .innerJoin(
                raw(`${Users.tableName} AS u ON u.user_id = e.userId`)
            )
            .whereRaw(`(${whereRawQuery}) AND (${whereStatus})`)
            .then(async count => {
                console.log('Get employees count response', count);
                employeesCount = count && count.length ? count[0]['totalEmps'] : 0;
            }).catch(getCountErr => {
                message = 'Error while getting employees count';
                throw getCountErr;
            });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: 'Ger employees list successful',
            data: {
                list: employeesList,
                count: employeesCount
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

const getEmployeeDataById = async (request, response, next) => {
    console.log('request params isss', request.params);
    let result = {};
    let employeeData = {};
    let message = '';
    try {
        const {
            userId
        } = request.params;
        const whereRawQuery = `e.userId = ${Number(userId)}`;

        // SELECT LIST query
        await Employees.query(request.knex)
            .select('e.*')
            .alias('e')
            .whereRaw(whereRawQuery)
            .then(async data => {
                console.log('Get employee data response', data);
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
            message: 'Ger employee data by id successful',
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

const updateEmployeeStatus = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let message = '';
    try {
        const {
            userId,
            status
        } = request.body;

        // start transaction to update employee status
        await Employees.transaction(async trx => {

            await Employees.query(request.knex)
                .transacting(trx)
                .update(request.body)
                .alias('e')
                .whereRaw(`e.userId = ${Number(userId)}`)
                .then(async data => {
                    console.log('Get update employee data response', data);
                }).catch(updateErr => {
                    message = 'Error while update employee data';
                    throw updateErr;
                });

            await Users.query(request.knex)
                .transacting(trx)
                .update({
                    user_id: userId,
                    status: status
                })
                .alias('u')
                .whereRaw(`u.user_id = ${Number(userId)}`)
                .then(async data => {
                    console.log('Get update user data response', data);
                }).catch(updateErr => {
                    message = 'Error while update user data';
                    throw updateErr;
                });

        }).catch(trxErr => {
            message = 'Error while start transaction to update employee data';
            throw trxErr;
        });

        result = {
            success: true,
            error: false,
            statusCode: 200,
            message: status == 0 ? 'Employee deactivated successful' : 'Employee restored successful',
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

const generatePasswordToEmployee = async (request, response, next) => {
    console.log('request body isss', request.body);
    let result = {};
    let hashPassword = null;
    let message = '';
    try {
        const {
            user_id,
            userName,
            email
        } = request.body;

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            port: 465,
            secure: true,
            auth: {
                user: config.email.name,
                pass: config.email.password
            }
        });

        const newPassword = randomString.generate({
            length: 6,
            charset: 'alphanumeric'
        });

        // const htmlData = fs.readFileSync(__dirname + '../../../public/mail.html');
        // console.log(htmlData.toString());

        const mailOptions = {
            from: config.email.name,
            to: `${email}, maheshpm1599@gmail.com`,
            subject: 'New Password to login in Employee Leave System App',
            // text: `Hi ${userName}, Here your new generated password :: ${newPassword}`,
            // html: `<p>Hi ${userName}, Here your new generated password :: <strong>${newPassword}</strong></p>`
            // html: htmlData
            html: `<div style="padding: 15px; border: 2px solid #ccc !important;">
            <div style="width:50%;box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2), 0 4px 20px 0 rgba(0, 0, 0, 0.19);margin: 0 auto;">
                <header style="height: 100px;text-align: center !important;border: 3px solid cornflowerblue;background-color: cornflowerblue !important;">
                    <h6 style="font-size: 1.3rem;color: white;margin: 5.5%;">Password Mail - ELMS</h6>
                </header>
        
                <div style="padding: 5px;text-align: center !important;height: 130px;">
                    <p style="font-size: 1.1rem;">Hi <b style="color: mediumseagreen;">${userName}</b>, Greetings From <b style="color: seagreen;">Employee Leave System</b> App!</p>
                    <br>
                    <div>
                        Please Login with newly generated Password : <span class="otp-code w3-wide" style="font-weight: 400;padding: 10px;
                        border: 1px dashed teal;color: #1667af;letter-spacing: 4px;">${newPassword}</span>
                    </div>
                </div>
            </div>
        </div>`
        }

        await transporter.sendMail(mailOptions, async (err, info) => {
            if (err) {
                console.log('Error while sending an email', err);
                result = {
                    success: false,
                    error: true,
                    statusCode: 500,
                    message: 'Error while sending an email',
                    data: []
                }
                return response.status(200).json(result);
            } else {
                console.log('Get sent mail info isss', info);

                // hash and encrypt employee password
                await bcrypt.hash(newPassword, 10).then(async hash => {
                    console.log('hash password isss:', hash);
                    hashPassword = hash;
                }).catch(hashErr => {
                    message = 'Error while encrypt the password';
                    throw hashErr;
                });

                await Users.query(request.knex)
                    .update({
                        user_id: user_id,
                        password: hashPassword
                    })
                    .alias('u')
                    .whereRaw(`u.user_id = ${user_id}`)
                    .then(async data => {
                        console.log('Get updated user password isss', data);
                        result = {
                            success: true,
                            error: false,
                            statusCode: 200,
                            message: 'New password generated successful',
                            data: []
                        }
                        return response.status(200).json(result);
                    }).catch(updateErr => {
                        message = 'Error while updating user password';
                        throw updateErr;
                    });
            }
        });
    } catch (error) {
        console.log('Error at try catch API result', error);
        result = {
            success: false,
            error: true,
            statusCode: 500,
            message: message || 'Error at try catch API result',
            data: []
        }
        return response.status(200).json(result);
    }
}

module.exports = {
    addUpdateSingleEmployee,
    bulkUploadEmployee,
    getEmployeesData,
    getEmployeeDataById,
    updateEmployeeStatus,
    generatePasswordToEmployee
}