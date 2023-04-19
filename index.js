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
            'Add Employee',
            'Update Employee Role',
            'View All Roles',
            'Add Role',
            'View All Departments',
            'Add Department',
            //Extra functionality
            'Update Employee Manager',
            'View Employees By Department',
            'Remove Department',
            'Remove Role',
            'Remove Employee',
            'View Department Budget',
            'Close'
        ]
    })
    .then((answers) => {
        const {choices} = answers;
    
        switch(choices) {
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Update Employee Manager':
                updateEmployeeManager();
                break;
            case 'View Employees By Department':
                viewEmployeesByDepartment();
                break;
            case 'Remove Department':
                removeDepartment();
                break;
            case 'Remove Role':
                removeRole();
                break;
            case 'Remove Employee':
                removeEmployee();
                break;
            case 'View Department Budget':
                viewDepartmentBudget();
                break;
            case 'Close':
                connection.end();
                break;
            default:
                console.log('Invalid choice');
        }
    });
    
};