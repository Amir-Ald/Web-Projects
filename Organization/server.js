/********************************************************************************* 
*  
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this 
* assignment has been copied manually or electronically from any other source (including web sites) or 
* distributed to other students.
* 
*  Name: Amirreza Allahdad Student ID: 139974182 Date: 29/11/2019
*
*  
*
********************************************************************************/ 

var express = require("express");
var app = express();
var path = require('path');
var multer = require('multer');
var dataServic_req = require('./data-service.js');
var HTTP_PORT = process.env.PORT || 8080;
var fs = require("fs");
var bodyParser = require("body-parser");
var exphbs = require('express-handlebars');
const dataServiceAuth = require("./data-service-auth.js");
var clientSessions = require('client-sessions');
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.static("views"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(clientSessions({
    cookieName: "session", 
    secret: "web322_assignment6",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60 
}));
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
app.use(function(req,res,next){
    let route=req.baseUrl + req.path;
    app.locals.activeRoute = (route=="/")? "/":route.replace(/\/$/,"");
    next();
});
function ensureLogin(req, res, next) {
    if(!req.session.user){
        res.redirect("/login");
    } else {
        next();
    }
};

app.get("/", (req, res) => {
    res.render("home");
});

app.get('/about', (req, res) => {
    res.render("about");
});
app.get('/login', (req, res) => {
    res.render("login");
});
app.get('/register', (req, res) => {
    res.render("register");
});
app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body)
    .then((data) => {
        res.render("register", {successMessage: "User created"});
    }).catch((err)=>{
        res.render("register", {errorMessage: err, userName: req.body.userName});
    })
});
app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
    .then((resData)=>{
        req.session.user = {
            userName: resData.userName,
            email: resData.email,
            loginHistory: resData.loginHistory
        };
        res.redirect('/employees');       
    }).catch((err)=>{
        res.render("login",{errorMessage: err, userName: req.body.userName});
    });
});
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render("userHistory");
});
app.get("/managers", ensureLogin, function(req,res){
    dataServic_req.getManagers()
    .then((data)=>{res.json(data);})
    .catch((err)=>res.json({message: err}));
});
  
app.get('/employees', ensureLogin, (req, res) => {
    if(req.query.status) {
        dataServic_req.getEmployeesByStatus(req.query.status)
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }else if(req.query.manager){
        dataServic_req.getEmployeesByManager(req.query.manager)
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }else if(req.query.department){
        dataServic_req.getEmployeesByDepartment(req.query.department)
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }else{
        dataServic_req.getAllEmployees()
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }
});
app.get('/employees/add', ensureLogin, (req,res)=>{
    dataServic_req.getDepartments().then((data) => res.render("addEmployee", {departments: data}))
    .catch((err) => res.render("addEmployee", {departments: []}))
});
app.post("/employees/add", ensureLogin, (req,res)=>{
    dataServic_req.addEmployee(req.body)
        .then((data)=>{res.redirect("/employees");})
        .catch((err)=>{
            res.status(500).send("Unable to Add Employee");
        });
});
app.get("/employee/:empNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};

    dataServic_req.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    }).then(dataServic_req.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"

        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching 
        // viewData.departments object

        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
});


app.get('/images/add', ensureLogin, (req,res)=>{
    res.render("addImage");
});

app.get('/departments', ensureLogin, (req, res) => {
    dataServic_req.getDepartments()
        .then((data) => res.render("departments",{departments:data}))
        .catch(() => res.render("departments",{"message": "no results"}))
});

app.post('/images/add',upload.single("imageFile"), ensureLogin, (req,res)=>{
    res.redirect("/images");
});
app.post("/employee/update", ensureLogin, function(req, res){
    dataServic_req.updateEmployee(req.body)
    .then(res.redirect('/employees'))
    .catch((err)=>{
        res.status(500).send("Unable to Update Employee");
    });
});
app.get("/departments/add", ensureLogin, (req, res) => {
    res.render("addDepartment");
});
app.post('/departments/add', ensureLogin, (req, res) => {
    dataServic_req.addDepartment(req.body)
    .then((data)=>{res.redirect("/departments");})
    .catch((err)=>{
        res.status(500).send("Unable to Add Department");
    });  
}); 

app.get('/images', ensureLogin, function(req,res){
    var img = { images: [] };
    fs.readdir("./public/images/uploaded", function(err,items){
      for(var i =0; i < items.length; i++)
      {
        img.images.push(items[i]);
      }
      res.render("images", {data: img.images});
    });
});
app.post("/department/update", ensureLogin, (req, res) => {
    dataServic_req.updateDepartment(req.body)
    .then(res.redirect('/departments')) 
});
app.get('/department/:departmentId', ensureLogin, (req, res) => {
    dataServic_req.getDepartmentById(req.params.departmentId).then((data) => {
        res.render("department",{department:data});
        if(data.length <= 0) {
            res.status(404).send("Department Not Found");
        } 
    }).catch((err)=>{
        res.status(404).send("Department Not Found!!!");
    })
});
app.get("/departments/delete/:departmentId", ensureLogin, (req, res) => {
    dataServic_req.deleteDepartmentById(req.params.departmentId).then((data) => {
		res.redirect("/departments");
    }).catch((err) =>{
        res.status(500).send("Unable to Remove Department / Department not found");
    })
});
app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    dataServic_req.deleteEmployeeByNum(req.params.empNum).then((data) => {
		res.redirect("/employees");
    }).catch((err) =>{
        res.status(500).send("Unable to Remove Employee / Employee not found");
    })
});
app.engine('.hbs',exphbs({
    extname:'.hbs', 
    defaultLayout:'main',
    helpers:{
        navLink:function(url, options){
            return '<li' + ((url==app.locals.activeRoute)? ' class="active"':'')
                +'><a href="'+url+'">'+options.fn(this)+'</a></li>'
        },
        equal:function(lvalue, rvalue, options){
            if(arguments.length<3)
                throw new Error("Handlerbars Helper equal needs 2 parameters");
            if(lvalue != rvalue){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        }
    }
}));



app.set('view engine','.hbs');
app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname,"/views/err404.html"));
})
dataServic_req.initialize()
.then(dataServiceAuth.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});