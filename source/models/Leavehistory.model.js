const { Model } = require('objection');

class Leavehistory extends Model {
    static get tableName() {
        return 'leavehistory';
    }

    static get idColumn() {
        return 'lh_Id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                lh_Id: { type: ['integer', null] },
                emp_id	: { type: ['string', null] },
                leaveShortCode: { type: ['string', null] },
                leaveStartDate: { type: ['string', null] },
                leaveEndDate: { type: ['string', null] },
                leaveAppliedDate: { type: ['string', null] },
                reason: { type: ['string', 'text', null] },
                effectiveMonth: { type: ['string', null] },
                remarks: { type: ['string', 'text', null] },
                status: { type: ['integer', 'number', null] },      // 0-Rejected, 1-Approved, 2-Pending, 3-Rejected. Default: 2-Pending
                created_at: { type: 'datetime' },
                updated_at: { type: 'timestamp' }
            }
        }
    }
}

module.exports = Leavehistory;