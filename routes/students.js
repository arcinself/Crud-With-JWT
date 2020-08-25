const express = require('express');
const router = express.Router();
const fs=require('fs');


router.get('/', function(req, res) {
    const data=JSON.parse(fs.readFileSync("data/students.json"));
    if(data.students.length<1){
        return res.json({
            err : "No student to display."
        });
    }
    return res.json({
        data : data.students,
        err : null
    });
});

router.post('/',function(req, res){
    const data = JSON.parse(fs.readFileSync("data/students.json"));
    const name= req.body.name;
    if(!name){
        return res.json({
            err : "Invalid payload."
        });
    }
    const newId=data.students.length+1;
    const newStudent={
        id : newId,
        name : name,
    }
    data.students.push(newStudent);
    fs.writeFile("data/students.json", JSON.stringify(data,null,2) ,err => {
        if(err) {
            return res.json({
                err : "Error while adding the student"
            });
        }
        else{
            return res.json({
                data : "Student successfully added"
            });
        }
    });
});

module.exports = router;


