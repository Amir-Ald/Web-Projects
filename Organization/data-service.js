const Sequelize = require('sequelize');
var sequelize = new Sequelize('d16esndvsngdtd', 'qzgogpqketucpe', 'eb05cc0dfcf5dc976b0c1bcc0837c036bac4f36b758f6629a681fe6b01234fce', {
    host: 'ec2-174-129-222-15.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});
var Employee = sequelize.define('Employee', {
    employeeNum:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName:Sequelize.STRING,
    lastName:Sequelize.STRING,
    email:Sequelize.STRING,
    SSN:Sequelize.STRING,
    addressStreet:Sequelize.STRING,
    addressCity:Sequelize.STRING,
    addressState:Sequelize.STRING,
    addressPostal:Sequelize.STRING,
    isManager:Sequelize.BOOLEAN,
    maritalStatus:Sequelize.STRING,
    employeeManagerNum:Sequelize.INTEGER,
    status:Sequelize.STRING,
    hireDate:Sequelize.STRING
});
var Department = sequelize.define('Department', {
    departmentId:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});
Department.hasMany(Employee, {foreignKey: 'department'});

module.exports.initialize = function (){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            resolve("Operation was a success");
        }).catch(function (error) {
            reject("unable to sync the database");
        });
    });
};

module.exports.getAllEmployees = function(){
    return new Promise(function (resolve, reject) {
        Employee.findAll().then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
};
module.exports.getManagers = function(){
    return new Promise(function (resolve, reject) {
        reject();
    });
}

module.exports.getDepartments = function(){
    return new Promise(function (resolve, reject) {
        Department.findAll().then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
};

module.exports.addEmployee = function(employeeData){
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for(var x in employeeData){
        if (x == ""){
            x = null;
        }
    }
    return new Promise(function (resolve, reject) {
        Employee.create({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addresCity: employeeData.addresCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            maritalStatus: employeeData.maritalStatus,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate,
            department: employeeData.department
        })
        .then(function () {
            resolve("Operation was a success");
        }).catch(function (error) {
            reject("no results returned");
        });
    });
};
module.exports.getEmployeesByStatus = function(status){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                status: status
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
};
module.exports.getEmployeesByDepartment = function(department){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                department: department
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
};
module.exports.getEmployeesByManager = function(manager){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                employeeManagerNum: manager
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
};

module.exports.getEmployeeByNum = function(num){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                employeeNum: num
            }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
};

exports.updateEmployee = function(employeeData){
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for(var x in employeeData){
        if (x == ""){
            x = null;
        }
    }
    return new Promise(function (resolve, reject) {
        Employee.update({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addresCity: employeeData.addresCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            maritalStatus: employeeData.maritalStatus,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate,
            department: employeeData.department
        }, {
            where: {employeeNum: employeeData.employeeNum}
        })
        .then(function () {
            resolve("Operation was a success");
        }).catch(function (error) {
            reject("unable to update employee");
        });
    });
};

exports.addDepartment = function(departmentData){
    for(var x in departmentData){
        if (x == ""){
            x = null;
        }
    }
    return new Promise(function (resolve, reject) {
        Department.create({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        })
        .then(function () {
            resolve("Operation was a success");
        }).catch(function (error) {
            reject("unable to create department");
        });
    });
};
exports.updateDepartment = function(departmentData){
    for(var x in departmentData){
        if (x == ""){
            x = null;
        }
    }
    return new Promise(function (resolve, reject) {
        Department.update({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        }, {
            where: {departmentId: departmentData.departmentId}
        })
        .then(function () {
            resolve("Operation was a success");
        }).catch(function (error) {
            reject("unable to update department");
        });
    });
};
module.exports.getDepartmentById = function(id){
    return new Promise(function (resolve, reject) {
        Department.findAll({
            where: {
                departmentId: id
            }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
};
module.exports.deleteDepartmentById = function(id){
    return new Promise(function (resolve, reject) {
        Department.destroy({
            where: {
                departmentId: id
            }
        }).then(function () {
            resolve("Operation was a success");
        }).catch(function (error) {
            reject("unable to delete department");
        });
    });
};
module.exports.deleteEmployeeByNum = function(empNum){
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        }).then(function () {
            resolve("Operation was a success");
        }).catch(function (error) {
            reject("unable to delete employee");
        });
    });
};