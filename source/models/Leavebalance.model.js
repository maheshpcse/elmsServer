const { Model } = require('objection');

class Leavebalance extends Model {
    static get tableName() {
        return 'leavebalance';
    }

    static get idColumn() {
        return 'lb_Id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                lb_Id: { type: ['integer', null] },
                emp_id	: { type: ['string', null] },
                leaveShortCode: { type: ['string', null] },
                leaveBalance: { type: ['integer', 'number', null] },
                status: { type: ['integer', 'number', null] },      // 0-Inactive, 1-Active. Default: 1-Active
                created_at: { type: 'datetime' },
                updated_at: { type: 'timestamp' }
            }
        }
    }
}

module.exports = Leavebalance;