const { Model } = require('objection');

class Employees extends Model {
    static get tableName() {
        return 'employees';
    }

    static get idColumn() {
        return 'userId';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                userId: { type: ['integer', null] },                // Primary Key Id (Auto increment)
                employeeId: { type: ['string', null] },
                firstName: { type: ['string', null] },
                middleName: { type: ['string', null] },
                lastName: { type: ['string', null] },
                userName: { type: ['string', null] },
                emailId: { type: ['string', null] },
                password: { type: ['string', null] },
                address: { type: ['string', null] },
                cityName: { type: ['string', null] },
                stateName: { type: ['string', null] },
                countryName: { type: ['string', null] },
                zipCode: { type: ['string', null] },
                phoneNumber: { type: ['string', null] },
                dateOfBirth: { type: ['string', null] },
                designation: { type: ['string', null] },
                department: { type: ['string', null] },
                registrationDate: { type: ['string', null] },
                profileImage: { type: ['string', 'text', null] },
                bloodGroup: { type: ['string', null] },
                maritalStatus: { type: ['string', null] },
                role: { type: ['string', null] },                   // employee, admin
                status: { type: ['integer', 'number', null] },      // 0-Inactive, 1-Active, 2-Blocked
                lastLoginDateTime: { type: ['string', null] },
                created_at: { type: 'datetime' },
                updated_at: { type: 'timestamp' }
            }
        }
    }
}

module.exports = Employees;