//Import MySQL package
const mysql = require("mysql")

//Call createConnection method to define connection to MySQL
const connection = mysql.createConnection({
    host: '127.0.0.1', //localhost
    port: 3306,
    //Your username
    user: 'root',
    //Your password
    password: 'root',
    database: 'employeed_db'
});

module.exports= connection;