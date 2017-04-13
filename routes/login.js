/**
 * Created by ARVIND on 4/13/2017.
 */
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var random = require('random-js');
var jwt = require('jsonwebtoken');

var pool = mysql.createPool({
    connectionLimit: 1000,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'job_listing'
});

function login_user(req, res) {
    var body = req.body;

    if(body === null){
        res.json({"code": 400, "message": "Malformed request"});
        return;
    }

    pool.getConnection(function (err,conn) {
        if(err){
            res.json({"code": 100, "message": "Connection could not be established. Server too busy"});
            return;
        }
        var username = body.username;
        var password = body.password;

        if(!username || !password){
            res.json({"code": 400, "message": "Malformed request"});
            return;
        }

        conn.query("SELECT * FROM `user_basic_details` WHERE `username`='"+username+"' OR `email`='"+username+"'", function (err,rows) {
            conn.release();
            if(err){
                res.json({"code": 100, "message": "Connection could not be established. Server too busy"});
                return;
            }
            if(rows.length === 0){
                res.json({"code":200, "message": "User Not found"});
                return;
            }
            var hash = rows[0].password;
            bcrypt.compare(password, hash).then(function (resp) {
                if(resp === true){
                    var engine = random.engines.mt19937().autoSeed();
                    var secret = ''+random.integer(0,1000000)(engine);
                    var token = jwt.sign(rows[0], secret, {
                        expiresIn: 86400
                    });
                    console.log(secret);
                    res.json({"code": 200, "message": "Authenticated", "token": token});
                    return;
                }
                else{
                    res.json({"code": 200, "message": "Could Not Authenticate"});
                    return;
                }
            })
                .catch(function (err) {
                    console.log(err);
                    res.json({"code": 400, "message": err});
                    return;
                })
        });
        conn.on('error', function (err) {
            res.json({"code": 100, "message": "Connection could not be established. Server too busy"});
        })
    });
}

router.post('/', function (req,res) {
   login_user(req,res);
});

module.exports = router;