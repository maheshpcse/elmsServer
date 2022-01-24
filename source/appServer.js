'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const mysql = require('mysql');
var config = require('./config/config.js');
var routes = require('./routes/routes.js');
var Knexx = require('./config/knex.js');
const { Model } = require('objection');
Model.knex(Knexx.knex);

var app = express();

// Middleware functions
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(function (request, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE,PATCH, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Origin, Authorization, x-access-token, Content-Length, X-Requested-With,Content-Type,Accept");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

// checking database connection
app.get('/connect', async (request, response) => {
    var connection = mysql.createConnection({
        host: config.database.host,
        port: config.database.port,
        user: config.database.username,
        password: config.database.password,
        database: config.database.db
    });
    connection.connect((err) => {
        if (err) {
            console.log('Error while db connection', err);
            response.status(200).json({
                success: false,
                error: true,
                message: 'Error while db connection',
                data: err
            });
        } else {
            console.log('Database connection success');
            response.status(200).json({
                success: true,
                error: false,
                message: 'Database connection success',
                data: null
            });
        }
    });
});

// Routes
app.use('/api', routes);

app.listen(config.server.port, () => {
    console.log(`Employee Leave system server is listening on http://localhost:${config.server.port}`);
});

module.exports = app;