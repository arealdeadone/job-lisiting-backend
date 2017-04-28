/**
 * Created by ARVIND on 4/16/2017.
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const process = require('process');
const company = require('./company');
const jobs = require('./jobs');

router.use((req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if(err){
                res.json({success: false, message: "Failed to authenticate the token"})
            } else {
                req.decoded = decoded;
                req.isLoggedIn = true;
                next();
            }
        })
    }
    else
    {
        res.status(200).json({'status':false, 'message': 'Bad Request'});
    }
});

router.use('/company', company);
router.use('/jobs', jobs);

module.exports = router;