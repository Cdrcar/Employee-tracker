//Import MySQL2 package to connect MySQL database and perform queries
const mysql = require("mysql2")

//Call createConnection method to define connection to MySQL
const connection = mysql.createConnection({
    host: '127.0.0.1', //localhost
    port: 3306,
    //Your username
    user: 'root',
    //Your password
    password: 'Your Password',
    database: 'employee_db'
});

module.exports= connection;