const { Model } = require('objection');

class Departments extends Model {
    static get tableName() {
        return 'departments';
    }

    static get idColumn() {
        return 'deptId';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                deptId: { type: ['integer', null] },
                departmentName: { type: ['string', null] },
                departmentShortName: { type: ['string', null] },
                departmentShortCode: { type: ['string', null] },
                status: { type: ['integer', 'number', null] },      // 0-Inactive, 1-Active. Default: 1-Active
                created_at: { type: 'datetime' },
                updated_at: { type: 'timestamp' }
            }
        }
    }
}

module.exports = Departments;