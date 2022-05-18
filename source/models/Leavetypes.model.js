const { Model } = require('objection');

class Leavetypes extends Model {
    static get tableName() {
        return 'leavetypes';
    }

    static get idColumn() {
        return 'lt_id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                lt_id: { type: ['integer', null] },
                leaveTypeName: { type: ['string', null] },
                leaveShortName: { type: ['string', null] },
                leaveShortCode: { type: ['string', null] },
                description: { type: ['string', 'text', null] },
                status: { type: ['integer', 'number', null] },      // 0-Inactive, 1-Active. Default: 1-Active
                created_at: { type: 'datetime' },
                updated_at: { type: 'timestamp' }
            }
        }
    }
}

module.exports = Leavetypes;