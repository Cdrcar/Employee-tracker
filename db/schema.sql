DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    department_name VARCHAR (30) NOT NULL
);

CREATE TABLE role (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    title VARCHAR (30) NOT NULL,
    salary decimal (10, 3) NOT NULL,
    department_id INT
    -- FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    first_name VARCHAR (30) NOT NULL,
    last_name VARCHAR (30) NOT NULL,
    role_id INT NULL,
    manager_id INT NULL
    -- FOREIGN KEY (manager_id) REFERENCES employee(id),
    -- FOREIGN KEY (role_id) REFERENCES role (id)
);
