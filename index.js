//Require dependencies

const inquirer = require("inquirer"); //Inquirer package to interact with the user via the command line
const connection = require("./config/connection");
const figlet = require("figlet"); // Figlet to add style to text in the terminal
const chalk = require("chalk"); // Chalk to style the console with colors
require("console.table"); // Console.table to print MySQL rows to the console

//Establish connection to MySQL database, console log to the console error or success message

connection.connect((error) => {
  if (error) throw error;
  console.log(chalk.cyanBright.bold(figlet.textSync("Employee Management")));
  // Call function userChoices
  userChoices();
});

// Function to prompt the user to select an option from the list of choices
const userChoices = () => {
  inquirer
    .prompt({
      type: " list",
      name: "choices",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "Add Employee",
        "Update Employee Role",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Department",
        //Extra functionality
        "Update Employee Manager",
        "View Employees By Department",
        "Remove Department",
        "Remove Role",
        "Remove Employee",
        "View Department Budget",
        "Close",
      ],
    })
    //Switch statements to check the value of the answers and call corresponding function for each case
    .then((answers) => {
      const { choices } = answers;

      switch (choices) {
        case "View All Employees":
          viewAllEmployees();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "Add Role":
          addRole();
          break;
        case "View All Departments":
          viewAllDepartments();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Update Employee Manager":
          updateEmployeeManager();
          break;
        case "View Employees By Department":
          viewEmployeesByDepartment();
          break;
        case "Remove Department":
          removeDepartment();
          break;
        case "Remove Role":
          removeRole();
          break;
        case "Remove Employee":
          removeEmployee();
          break;
        case "View Department Budget":
          viewDepartmentBudget();
          break;
        case "Close":
          connection.end();
          break;
        default:
          console.log("Invalid choice");
      }
    });
};

// Function to View all employees
const viewAllEmployees = () => {
  //Retrieve data from database using Structured Query Language
  let query = 
  `SELECT e.id, 
  e.first_name, 
  e.last_name, 
  r.title, 
  d.department_name AS 'department', 
  r.salary
  FROM employee e, role r, department d 
  WHERE d.id = r.department_id 
  AND r.id = e.role_id
  ORDER BY e.id ASC`;
//The promise() will wait until the connection is done before moving in to the next step and allows to hanlde the result of the query async
//The query () method takes the sql query as a parameter to be executed and a callback function to handle the result of the sql query
  connection.promise().query(query, (error, response) => {
    if (error) throw error;
    console.log(chalk.cyanBright.bold(`View all Employees`));
    console.table(response);
    //Call userChoices function to show choices again
    userChoices();
  })
};

//Function to Add employee
const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?",
            validate: firstName => {
                if(firstName) {
                    return true;
                } else {
                    console.log('Please enter first name')
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name",
            validate: lastName => {
                if (lastName) {
                    return true;
                } else {
                    console.log('Please enter last name');
                    return false;
                }
            }
        }
    ])
    .then (answer => {
        const newEmployee = [answer.firstName, answer.lastName]
        //Prompt user to select role for new employee
        const roleNewEmployee = 
        `Select role.id, role.title
         FROM role
        `;
        connection.promise().query(roleNewEmployee, (error, data)=>{
          if(error) throw error;
          const roles = data.map(({ id, tile }) => ({ name: title, value: id}));
          inquirer.prompt ([
            {
              type: 'list',
              name: 'role',
              message: "Select the employee's role:",
              choices: roles
            }
          ])
          .then(answer => {
            const role = answer.role;
            newEmployee.push(role);
            //Prompt user to select manager for new employee
            const managerNewEmployee = 
            `SELECT *
             FROM employee`;
             connection.promise().query(managerNewEmployee, (error, data) => {
              if (error) throw error;
              const managers = data.map(({ id, first_name, last_name}) => ({ name: first_name + " "+ last_name, vale: id }));
              inquirer.prompt([
                {
                  type:'list',
                  name: 'manager',
                  message: "Select the employee's manager:",
                  choices: managers
                }
              ])
              .then(answer => {
                const manager = answer.manager;
                newEmployee.push(manager);
                // Insert the new employee's information into the database
                const insertSql = 
                `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES (?, ?, ?, ?)`;
                // Call the connection.query() method with the SQL query and the newEmployee array as parameters
                connection.query(insertSql, newEmployee, (error) => {
                  if (error) throw error;
                  console.log("A new employee has been added to the database")
                  viewAllEmployees();
                });
              });
             });
          });
        });
    });
};