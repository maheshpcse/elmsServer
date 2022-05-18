const { Model } = require('objection');

class Admins extends Model {
    static get tableName() {
        return 'admins';
    }

    static get idColumn() {
        return 'adminId';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                adminId: { type: ['integer', null] },                // Primary Key Id (Auto increment)
                fullName: { type: ['string', null] },
                userName: { type: ['string', null] },
                email: { type: ['string', 'text', null] },
                password: { type: ['string', 'text', null] },
                profile: { type: ['string', 'text', null] },
                role: { type: ['string', null] },                   // admin, master. Default: admin
                status: { type: ['integer', 'number', null] },      // 0-Inactive, 1-Active, 2-Blocked. Default: 1-Active
                lastLogin: { type: ['string', null] },
                created_at: { type: 'datetime' },
                updated_at: { type: 'timestamp' }
            }
        }
    }
}

module.exports = Admins;