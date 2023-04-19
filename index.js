//Require dependencies

const inquirer = require ("inquirer"); //Inquirer package to interact with the user via the command line
const connection = require("./config/connection");
const figlet = require("figlet");// Figlet to add style to text in the terminal
const chalk = require("chalk")// Chalk to style the console with colors
require("console.table"); // Console.table to print MySQL rows to the console

