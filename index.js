//Require dependencies

const inquirer = require ("inquirer"); //Inquirer package to interact with the user via the command line
const connection = require("./config/connection");
const figlet = require("figlet");// Figlet to add style to text in the terminal
const chalk = require("chalk")// Chalk to style the console with colors
require("console.table"); // Console.table to print MySQL rows to the console

//Establish connection to MySQL database, console log to the console error or success message

connection.connect( (error) => {
    if (error) throw error;
    console.log(chalk.cyanBright.bold(figlet.textSync("Employee Management")));
    // Call function userChoices
    userChoices();
})

// Function to prompt the user to select an option from the list of choices
const userChoices = () => {
    inquirer.prompt({
        type: ' list',
        name: 'choices',
        message: 'What would you like to do?',
        choices: [
            'View All Employees',
            'View All Roles',
            'View All Departments',
            'View All Employees By Department',
            'View Department Budgets',
            'Update Employee Role',
            'Update Employee Manager',
            'Add Employee',
            'Add Role',
            'Add Department',
            'Remove Employee',
            'Remove Role',
            'Remove Department',
            'Exit' 
        ]
    })
}
