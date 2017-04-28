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

router.post('/', (req,res)=>{
    const body = req.body;
    if(body === null)
        res.status(200).json({"code": 400, "message": "Malformed request"});
    const {company_id, title, description, requirements, compensation, locations, jtype} = body;
    if(!company_id || !title || !description || !requirements || !locations || !compensation || !jtype)
        res.status(200).json({"code": 400, "message": "Malformed request"});
    pool.getConnection((err,conn) => {
        if(err){
            res.status(200).json({'code': 400, 'message': 'Couldn\'t Establish Database Connection'});
        }
        const engine = random.engines.mt19937().autoSeed();
        const job_id = random.integer(0,	2147483646)(engine);
        conn.query("INSERT INTO `job_basic_details`(`job_id`, `company_id`, `title`, `description`, `location`, `compensation`, `type`, `requirements`)" +
            " VALUES(" + job_id +", " + company_id +", '" + title +"', '" + description +"', '" + locations +"', '" + compensation +"'" +", '" + jtype +"', '" + requirements +"');"
            ,(err,rows) =>{
                if(err){
                    res.status(200).json({'code': 400, 'message': "Oops! Some Error Occurred"});
                }
                conn.query("INSERT INTO `company_job_listing`(`company_id`, `job_id`) " +
                    "VALUES (" + company_id +
                    ", " +job_id +")",
                    (err,rows)=>{
                        if(err){
                            res.status(200).json({'code': 400, 'message': "Oops! Some Error Occurred"});
                        }
                        conn.release();
                        res.status(200).json({'status': "Success", 'message': "Job created successfully"});
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
        conn.query("SELECT * FROM company_employees JOIN company_job_listing JOIN job_basic_details ON company_employees.company_id = company_job_listing.company_id AND company_job_listing.job_id=job_basic_details.job_id WHERE company_employees.user_id="+req.decoded.user_id,
            (err,rows) => {
                conn.release();
                res.status(200).json({'status': 'Success', 'data': rows});
            })
    });
});

module.exports = router;