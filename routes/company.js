/**
 * Created by ARVIND on 4/28/2017.
 */
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const random = require('random-js');

const pool = mysql.createPool({
    connectionLimit: 1000,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'job_listing'
});

router.post('/', (req,res) => {
    const body = req.body;
    if(body === null)
        res.status(200).json({"code": 400, "message": "Malformed request"});
    const {c_name, c_industry, c_employees, c_locations} = body;
    if(!c_name || !c_industry || !c_employees || !c_locations)
        res.status(200).json({"code": 400, "message": "Malformed request"});
    pool.getConnection((err,conn) => {
        if(err){
            res.status(200).json({'code': 400, 'message': 'Couldn\'t Establish Database Connection'});
        }
        const engine = random.engines.mt19937().autoSeed();
        const company_id = random.integer(0,	2147483646)(engine);
        conn.query("INSERT INTO `company_profile`(`company_id`, `name`, `locations`, `no_of_employees`, `industry`)" +
            " VALUES(" + company_id +", '" + c_name +"', '" + c_locations +"', '" + c_employees +"', '" + c_industry +"');"
            ,(err,rows) =>{
                if(err){
                    res.status(200).json({'code': 400, 'message': "Oops! Some Error Occurred"});
                }
                conn.query("INSERT INTO `company_employees`(`company_id`, `user_id`, `designation`) " +
                    "VALUES (" + company_id +
                    ", " +req.decoded.user_id +
                    ", 'Owner')",
                    (err,rows)=>{
                        if(err){
                            res.status(200).json({'code': 400, 'message': "Oops! Some Error Occurred"});
                        }
                        conn.release();
                        res.status(200).json({'status': "Success", 'message': "Company created successfully"});
                    }
                );
            }
        );
    });
});
router.get('/', (req,res) => {
    pool.getConnection((err, conn)=>{
       if(err)
           res.status(200).json({'code':400, 'message': "Couldn't Connect to database"});
       conn.query("SELECT `company_profile`.`company_id`,`name`,`locations`,`no_of_employees`,`industry` FROM `company_employees` INNER JOIN `company_profile` ON `company_employees`.`company_id` = `company_profile`.`company_id` WHERE `company_employees`.`user_id`=" + req.decoded.user_id +" AND `company_employees`.`designation`='Owner'",
           (err,rows) => {
               conn.release();
                res.status(200).json({'status': 'Success', 'data': rows});
           })
    });
});

module.exports = router;