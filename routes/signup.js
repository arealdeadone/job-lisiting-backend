/**
 * Created by ARVIND on 4/13/2017.
 */
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var random = require('random-js');

var pool = mysql.createPool({
   connectionLimit: 1000,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'job_listing'
});

function signup_user(req,res){
    if(req.body === null)
    {
        res.json({"code": 400, "message": "Malformed request"});
        return;
    }

    pool.getConnection(function (err,conn) {
        if(err){
            res.json({"code": 100, "message": "Connection could not be established. Server too busy"});
            return;
        }
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var username = req.body.username;

        if(!name || !username || !email || !password){
            res.json({"code": 400, "message": "Malformed request"});
            return;
        }

        var engine = random.engines.mt19937().autoSeed();
        var userid = random.integer(0,	2147483646)(engine);

        bcrypt.hash(password, 15)
            .then(function (hash) {
               conn.query("INSERT INTO `user_basic_details`(`user_id`,`username`, `password`, `salt`, `email`, `active`)" +
                   "VALUES("+userid+", '"+username+"', '"+hash+"', '"+hash+"', '"+email+"', 1)", function (err,rows) {
                   if(err){
                       res.json({"code": 100, "message": "Connection could not be established. Server too busy"});
                       return;
                   }
                   conn.query("INSERT INTO `user_profile_details`(`user_id`, `name`, `age`, `sex`, `location`)" +
                       "VALUES(" +
                           userid+", "+
                           "'"+name+"', "+
                           "0, ' ', ' '"+
                       ")", function (err,rows) {
                       if(err){
                           res.json({"code": 100, "message": "Connection could not be established. Server too busy"});
                           return;
                       }
                       conn.release();
                       res.json({"code": 200, "message": "User created successfully"});
                   })
               });
                conn.on('error', function(err) {
                    res.json({"code" : 100, "message" : "Error in connection database"});
                    return;
                });
            });
    });
}

router.post("/", function (req,res) {
    signup_user(req,res);
});

module.exports = router;