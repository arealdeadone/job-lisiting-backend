/**
 * Created by ARVIND on 4/13/2017.
 */
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const random = require('random-js');
const jwt = require('jsonwebtoken');
const process = require('process');

const pool = mysql.createPool({
    connectionLimit: 1000,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'job_listing'
});

router.use((req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if(token){
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if(err){
                next();
            } else {
                res.json({'status': false, 'message': 'User already authenticated'});
            }
        })
    }
    else
        next();
});

function login_user(req, res) {
    const body = req.body;
    res.status(200);
    if(body === null){
        res.json({"code": 400, "message": "Malformed request"});
        return;
    }

    pool.getConnection(function (err,conn) {
        if(err){
            res.json({"code": 100, "message": "Connection could not be established. Server too busy"});
            return;
        }
        const username = body.username;
        const password = body.password;

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
            const hash = rows[0].password;
            bcrypt.compare(password, hash).then(function (resp) {
                if(resp === true){
                    const secret = process.env.SECRET_KEY;
                    const user_data = {
                        user_id: rows[0].user_id,
                        username: rows[0].username,
                        email: rows[0].email
                    };
                    const token = jwt.sign(user_data, secret, {
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
    // res.status(200).json({"code":200, "message": "success"});
});

module.exports = router;