//Require dependencies
const inquirer = require("inquirer"); //Inquirer package to interact with the user via the command line
const connection = require("./config/connection");
const figlet = require("figlet"); // Figlet to add style to text in the terminal
const chalk = require("chalk"); // Chalk to style the console with colors
const validate = require("./validate"); // Validator contains functions that can be used to validate user input
// const { errorMonitor } = require("mysql2/typings/mysql/lib/Connection");
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
    .prompt([
      {
        name: "choices",
        type: "list",
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
      },
    ])
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


// // Function to View All Employees
const viewAllEmployees = async () => {
  try {
    //Retrieve data from database using Structured Query Language
    //The promise() will wait until the connection is done before moving in to the next step and allows to hanlde the result of the query async
    //The query () method takes the sql query as a parameter to be executed and a callback function to handle the result of the sql query
    const [rows] = await connection.promise().query(`SELECT e.id, 
    e.first_name, 
    e.last_name, 
    r.title, 
    d.department_name AS 'department', 
    r.salary
    FROM employee e, role r, department d 
    WHERE d.id = r.department_id 
    AND r.id = e.role_id
    ORDER BY e.id ASC`);
    console.log(``);
    console.log(chalk.cyan.bold(`View all Employees`));
    console.log(``);
    console.table(rows);
    userChoices();
  } catch (error) {
    console.error(error);
  }
};


//Function to Add Employee
const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What is the employee's first name?",
        validate: (firstName) => {
          if (firstName) {
            return true;
          } else {
            console.log("Please enter first name");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
        validate: (lastName) => {
          if (lastName) {
            return true;
          } else {
            console.log("Please enter last name");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const newEmployee = [answer.firstName, answer.lastName];
      //Prompt user to select role for new employee
      const roleNewEmployee = `Select role.id, role.title
         FROM role
        `;
      connection.promise().query(roleNewEmployee)
        .then(([rows, fields]) => {
          const roles = rows.map(({ id, title }) => ({ name: title, value: id }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "Select the employee's role:",
                choices: roles,
              },
            ])
            .then((answer) => {
              const role = answer.role;
              newEmployee.push(role);
              //Prompt user to select manager for new employee
              const managerNewEmployee = `SELECT *
               FROM employee`;
              connection.promise().query(managerNewEmployee)
                .then(([rows, fields]) => {
                  const managers = rows.map(({ id, first_name, last_name }) => ({
                    name: first_name + " " + last_name,
                    value: id,
                  }));
                  inquirer
                    .prompt([
                      {
                        type: "list",
                        name: "manager",
                        message: "Select the employee's manager:",
                        choices: managers,
                      },
                    ])
                    .then((answer) => {
                      const manager = answer.manager;
                      newEmployee.push(manager);
                      // Insert the new employee's information into the database
                      const insertSql = 
                      `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                      VALUES (?, ?, ?, ?)`;
                      // Call the connection.query() method with the SQL query and the newEmployee array as parameters
                      connection.promise()
                        .query(insertSql, newEmployee)
                        .then(([rows, fields]) => {
                          console.log(``);
                          console.log("A new employee has been added to the database");
                          console.log(``);
                          //Call function viewAllEmployees to see the updated list
                          viewAllEmployees();
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    });
                });
            });
        })
        .catch((error) => {
          console.log(error);
        });
    });
};


// Function to Update Employee Role
const updateEmployeeRole = () => {
  // Define SQL query to retrieve employee and role information
  let query = `
    SELECT e.id, e.first_name, e.last_name, r.id AS role_id, r.title 
    FROM employee e 
    INNER JOIN role r ON e.role_id = r.id 
    INNER JOIN department d ON r.department_id = d.id
  `;

  // Execute the query using the promise-based method
  connection.promise().query(query)
    .then((response) => {
      // Extract the results array from the response object
      const results = response[0];

      // Create arrays of employees and roles
      let arrayOfEmployees = [];
      let arrayOfRoles = [];

      // Iterate over each object in the response array and push first name + last name to the array of employees
      results.forEach((employee) => {
        arrayOfEmployees.push(`${employee.first_name} ${employee.last_name}`);
        arrayOfRoles.push({ id: employee.role_id, title: employee.title });
      });

      // Prompt user to select what employee has a new role and what is their new role
      return inquirer.prompt([
        {
          name: "updateEmployee",
          type: "list",
          message: "Select employee to update role",
          choices: arrayOfEmployees,
        },
        {
          name: "updateRole",
          type: "list",
          message: "Select new role",
          choices: arrayOfRoles.map((role) => role.title),
        },
      ])
      .then((answer) => {
        // Find the employee and role ids based on the user's input
        let employeeId, newRoleId;

        results.forEach((employee) => {
          if (
            answer.updateEmployee ===
            `${employee.first_name} ${employee.last_name}`
          ) {
            employeeId = employee.id;
          }
        });

        arrayOfRoles.forEach((role) => {
          if (answer.updateRole === role.title) {
            newRoleId = role.id;
          }
        });

        // Update the employee role in the database
        let query = `
          UPDATE employee 
          SET role_id = ?
          WHERE id = ?
        `;

        return connection.promise().query(query, [newRoleId, employeeId]);
      })
      .then(() => {
        console.log(``);
        console.log(chalk.cyan("Employee role updated"));
        console.log(``);
        userChoices();
      })
      .catch((error) => {
        console.error(error);
      });
    });
};


// Function to View All ROles
const viewAllRoles = () => {
  console.log(chalk.cyan("Current Roles:"));
  const query = 
  `SELECT r.id, r.title, d.department_name AS department
    FROM role r
    INNER JOIN department d ON r.department_id = d.id`;
    connection.promise().query(query)
    .then((response) => {
      // Extract the results array from the response object
      const results = response[0];

      results.forEach((role) => {console.log(role.title)});
      console.log("");
      userChoices();
    })
    .catch((error) => {
      console.log(error);
    });
}



// Function to Add Role
const addRole = () => {
  // Select to which department does the new role belong to
  const query = `SELECT * 
   FROM department`;
  connection
    .promise()
    .query(query)
    .then((response) => {
      let arrayOfDepartments = response[0].map(
        (department) => department.department_name
      );
      arrayOfDepartments.push("Create Department");
      return inquirer.prompt([
        {
          name: "departmentName",
          type: "list",
          message: "Which department is this new role in?",
          choices: arrayOfDepartments,
        },
      ]);
    })
    .then((answer) => {
      if (answer.departmentName === "Create Department") {
        return addDepartment();
      } else {
        return answer;
      }
    })
    .then((answer) => {
      const departmentName = answer.departmentName;
      const newRoleQuestions = [
        {
          name: "newRole",
          type: "input",
          message: "What is the name of your new role?",
          validate: validate.validateString,
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary of this new role?",
          validate: validate.validateSalary,
        },
      ];
      return inquirer.prompt(newRoleQuestions).then((roleAnswers) => ({
        ...answer,
        ...roleAnswers,
      }));
    })
    .then((answers) => {
      const departmentName = answers.departmentName;
      const newRole = answers.newRole;
      const salary = answers.salary;

      const departmentIdSql = `SELECT * FROM department
       WHERE department_name = ?`;
      connection
        .promise()
        .query(departmentIdSql, departmentName)
        .then((response) => {
          const departmentId = response[0][0].id;
          const insertRoleSql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
          connection
            .promise()
            .query(insertRoleSql, [newRole, salary, departmentId])
            .then(() => {
              console.log(chalk.cyan(`Role successfully created!`));
              return viewAllRoles();
            })
            .catch((error) => {
              console.log(
                chalk.whiteBright.bgRed.bold(`An error occurred: ${error}`)
              );
              return userChoices();
            });
        })
        .catch((error) => {
          console.log(
            chalk.whiteBright.bgRed.bold(`An error occurred: ${error}`)
          );
          return userChoices();
        });
    })
    .catch((error) => {
      console.log(chalk.whiteBright.bgRed.bold(`An error occurred: ${error}`));
      return userChoices();
    });
};

//  // Validate string function
//  const validateInput = (input) => {
//   if (input.trim() === '') {
//     return 'Please enter a valid role name';
//   }
//   return true;
// };

// // Validate decimal function
// const validateSalary = (num) => {
//   if (validator.isDecimal(num)) {
//     return true;
//   }
//   return 'Please enter a valid decimal number!';
// };

// Function to View All Departments
const viewAllDepartments = () => {
  const query = `SELECT d.id AS id, d.department_name AS department
     FROM department d`;
  connection.promise().query(query)
  .then((response) => {
    console.log(chalk.cyan(`All Departments:`));
    console.table(response[0]); // Pass only the rows to console.table
    userChoices();
  })
};


// Function to Add Department
const addDepartment = () => {
  inquirer
    .prompt([
      {
        name: "newDepartment",
        type: "input",
        message: "What is the Department's name?",
        validate: validate.validateString,
      },
    ])
    .then((answer) => {
      let query = `INSERT INTO department (department_name)
       VALUES (?)`;
      connection.query(query, answer.newDepartment, (error, response) => {
        if (error) throw error;
        console.log(``);
        console.log(chalk.cyan(`Department added:`));
        console.log(``);
        console.log(chalk.cyan.bold(answer.newDepartment));
        console.log(``);
        viewAllDepartments();
      });
    });
};


// Function to Update Employee Manager
const updateEmployeeManager = () => {
  let query = `SELECT e.id, e.first_name, e.last_name, e.manager_id
     FROM employee e`;
  connection.promise().query(query)
    .then((response) => {
      let arrayOfEmployees = [];
      for (const employee of response[0]) {
        arrayOfEmployees.push(`${employee.first_name} ${employee.last_name}`);
      }

      inquirer
        .prompt([
          {
            name: "selectEmployee",
            type: "list",
            message: " Select employee to update their manager:",
            choices: arrayOfEmployees,
          },
          {
            name: "newManager",
            type: "list",
            message: "Select manager:",
            choices: arrayOfEmployees,
          },
        ])
        .then((answer) => {
          let employeeId, managerId;
          response.forEach((employee) => {
            if (
              answer.selectEmployee ===
              `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
            if (
              answer.newManager === `${employee.first_name} ${employee.last_name}`
            ) {
              managerId = employee.id;
            }
          });
          if (validate.isSame(answer.selectEmployee, answer.newManager)) {
            console.log(chalk.cyan(`Invalid Manager Selection`));
            userChoices();
          } else {
            let query = `UPDATE employee 
             SET employee.manager_id = ?
             WHERE employee.id = ?`;

            connection.promise().query(query, [managerId, employeeId])
              .then(() => {
                console.log(``);
                console.log(chalk.cyan(`Employee Manager Updated`));
                console.log(``);
                userChoices();
              })
              .catch((error) => {
                throw error;
              });
          }
        });
    })
    .catch((error) => {
      throw error;
    });
};


// Function to View Employees By Department
const viewEmployeesByDepartment = () => {
  const query = `SELECT e.first_name, e.last_name, department.department_name AS deparment
     FROM employee e
     LEFT JOIN role ON e.role_id = role.id
     LEFT JOIN department ON role.department_id = department.id`;

  connection.query(query, (error, response) => {
    if (error) throw error;
    console.log(chalk.cyan(`Employees by Department:`));
    console.table(response);
    userChoices();
  });
};

// Function to Remove Department
const removeDepartment = () => {
  let query = `SELECT d.id, d.department_name
     FROM department d`;

  connection.promise().query(query, (error, response) => {
    if (error) throw error;
    let arrayOfDepartments = [];
    response.forEach((department) => {
      arrayOfDepartments.push(department.department_name);
    });

    inquirer
      .prompt([
        {
          name: "departmentName",
          type: "list",
          message: "Select Department to be removed:",
          choices: arrayOfDepartments,
        },
      ])
      .then((answer) => {
        let departmentId;

        response.forEach((department) => {
          if (answer.departmentName === department.department_name) {
            departmentId = department.id;
          }
        });

        let query = `DELETE FROM department
         WHERE department.id = ?`;
        connection.promise().query(query, [departmentId], (error) => {
          if (error) throw error;
          console.log(chalk.cyan(`Department removed`));
          viewAllDepartments();
        });
      });
  });
};

//Function to Remove Role
const removeRole = () => {
  let query = `SELECT r.id, r.title
     FROM role r`;

  connection.promise().query(query, (error, response) => {
    if (error) throw error;
    let arrayOfRoles = [];
    response.forEach((response) => {
      arrayOfRoles.push(role.title);
    });

    inquirer
      .prompt([
        {
          name: "roleTitle",
          type: "list",
          message: "Select Role to be removed:",
          choices: arrayOfRoles,
        },
      ])
      .then((answer) => {
        let roleId;

        response.forEach((role) => {
          if (answer.roleTitle === role.title) {
            roleId = role.id;
          }
        });

        let query = `DELETE FROM role
         WHERE role.id = ?`;

        connection.promise().query(query, roleId, (error) => {
          if (error) throw error;
          console.log(chalk.cyan("Role removed"));
          viewAllRoles();
        });
      });
  });
};

// Function to Remove Employee
const removeEmployee = () => {
  let query = `SELECT e.id, e.first_name, e.last_name
     FROM employee e`;

  connection.promise().query(query, (error, response) => {
    if (error) throw error;
    let arrayOfEmployees = [];
    response.forEach((employee) => {
      arrayOfEmployees.push(`${employee.first_name} ${employee.last_name}`);
    });

    inquirer
      .prompt([
        {
          name: "selectEmployee",
          type: "list",
          message: "Select employee to remove:",
          choices: arrayOfEmployees,
        },
      ])
      .then((answer) => {
        let employeeId;
        response.forEach((employee) => {
          if (
            answer.selectEmployee ===
            `${employee.first_name} ${employee.last_name}`
          ) {
            employeeId = employee.id;
          }
        });
        let query = `DELETE FROM employee
         WHERE employee.id = ?`;
        connection.query(query, [employeeId], (error) => {
          if (error) throw error;
          console.log(chalk.cyan(`Employee Removed`));
          viewAllEmployees();
        });
      });
  });
};

// Function to View Department Budget
const viewDepartmentBudget = () => {
  console.log(chalk.cyan(`Budget by Department:`));
  const query = 
  `SELECT department_id AS id, department.department_name AS department,
  SUM (salary) AS budget
  FROM role
  INNER JOIN department ON role.department_id = department.id
  GROUP BY role.department.id`;

  connection.quert(sql, (error, response) => {
    if (error) throw error;
    console.table(response);
    userChoices();
  })
}