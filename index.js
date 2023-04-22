//Require dependencies

const inquirer = require("inquirer"); //Inquirer package to interact with the user via the command line
const connection = require("./config/connection");
const figlet = require("figlet"); // Figlet to add style to text in the terminal
const chalk = require("chalk"); // Chalk to style the console with colors
require("console.table"); // Console.table to print MySQL rows to the console

//Establish connection to MySQL database, console log to the console error or success message

connection.connect((error) => {
  if (error) throw error;
  console.log(chalk.cyan.bold(figlet.textSync("Employee Management")));
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

// Function to View All Employees
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
    console.log(chalk.cyan.bold(`View all Employees`));
    console.table(response);
    //Call userChoices function to show choices again
    userChoices();
  })
};

//Function to Add Employee
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
                  //Call function viewAllEmployees to see the updated list
                  viewAllEmployees();
                });
              });
             });
          });
        });
    });
};

// Function to Update Employee Role
const updateEmployeeRole = () => {
  // Define SQL query
  let query = 
  `SELECT e.id, e.first_name, e.last_name, r.id 
   FROM employee e, role r, department d
   WHERE d.id = r.department_id AND r.id = e.role_id`;
   //Execute the query
   connection.promise().query(query, (error, response) => {
    if (error) throw error;
    // Create array of employees names, iterate over each object in the response array and push first name + last name to the array of employees
    let arrayOfEmployees = [];
    response.forEach((employee) => {
      arrayOfEmployees.push(`${employee.first_name} ${employee.last_name}`)
    });
    // Retrieve the id and title of all roles
    let query = 
    `SELECT r.id, r.title
     FROM role r`;
     connection.promise().query(query, (error, response) => {
      if (error) throw error;
      // Create array of of roles, iterate over each object in the response array and push the title property to the array of roles
      let arrayOfRoles = [];
      response.forEach((role) => {arrayOfRoles.push(role.title)});

      // Prompt user to select what employee has a new role and whar is their new role
      inquirer.prompt([
        {
          name: 'updateEmployee',
          type: 'list',
          message: "Select employee to update role",
          choices:arrayOfEmployees
        },
        {
          name: 'updateRole',
          type: 'list',
          message: "Select new role",
          choices: arrayOfRoles
        }
      ])
      .then((answer) => {
        let employeeId, newRoleId;
        // Check if the employee's full name chosen from the prompt matches the value of the response array of objects
        response.forEach((employee) => {
          if (answer.updateEmployee === `${employee.first_name} ${employee.lastName}`){
            employeeId = employee.id;
          }
         });

         // Check if the title property of the role matches the updateRole property in the answer object
         response.forEach((role) => {
          if(answer.updateRole === role.title) {
            newRoleId = role.id;
          }
         });
         // Update database
         let query = 
         `UPDATE employee 
          SET employee.role_id = ?
          WHERE employee.is= ?`;
          connection.query(sql, [employeeId, newRoleId], (error) => {
            if (error) throw error;
              console.log(chalk.cyan('Employee role updated'));
              userChoices();
          })
        })
      })
     })
   }

   // Function to View All Roles
    const viewAllRoles = () => {
    console.log(chalk.cyan("Current Roles:"))
    // Query to select employees roles and their departments
    const query = 
    `SELECT r.id, r.title, d.department_name AS department
     FROM role r
     INNER JOIN department ON r.department_id = d.id`;
     // Execute the SQL query
     connection.promise().query(query, (error, response) => {
      if (error) throw error;
      response.forEach((role) => {console.log(role.title)});
      userChoices();
     });
   };

   // Function to Add Role
   const addRole = () => {
    const query = 
    `SELECT *
     FROM department`
     connection.promise().query(query, (error, response) => {
      if (error) throw error;
      let arrayOfDepartments = [];
      response.forEach((department) => { arrayOfDepartments.push
      })
     })
   }