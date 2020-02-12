const bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName":{
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});
let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("string");
        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};
//signing up a new user
module.exports.registerUser = function (userData){
    return new Promise(function (resolve, reject) {
        if( userData.password != userData.password2 ){//validating password
            reject ("Passwords do not match");
        }else{        
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {// encrypt the password: "myPassword123"
                // TODO: Store the resulting "hash" value in the DB
                    if (err){
                        reject("There was an error encrypting the password");
                    }else{
                        let newUser = new User(userData);
                        newUser.password = hash;
                        newUser.save()
                        .then(()=>{resolve();})
                        .catch( (err)=>{
                            if (err.code != 11000){
                                reject("There was an error creating the user: err"+err);                 
                            }else{
                                reject("User Name already taken");
                            }
                        }); 
                    }
                });
            });
        }
    });
}
module.exports.checkUser = function (userData){
    return new Promise(function (resolve, reject){
        User.find({userName: userData.userName})//searching for user
        .exec().then((user_res) => {
            if (!user_res){
                reject("Unable to find user: " + userData.userName);
            }else{ 
                bcrypt.compare(userData.password, user_res[0].password ).then((res) => {
                    if(res===false){//if password was wrong
                        reject('Incorrect Password for user: '+userData.userName);
                    }else{
                        user_res[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                        User.update({ userName: user_res[0].userName},
                        { $set: { loginHistory: user_res[0].loginHistory } },
                        { multi: false })
                        .exec().then(() =>{
                            resolve(user_res[0]);//resolves the promise
                        })
                    }
                });
            }
        }).catch((err)=>{
            reject("Unable to find user: " + userData.userName);
        });
    });
}