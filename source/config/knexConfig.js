require('dotenv').config();

module.exports = {
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8'
    },
    pool: {
        max: 10,
        min: 3
    },
    acquireTimeout: 60 * 1000,
    debug: false,
    // migrations: {
    //     directory: '../db_migrations'
    // },
    // seeds: {
    //     directory: '../seeds'
    // }
}