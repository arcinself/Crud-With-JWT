const express = require('express');
const router = express.Router();
const fs=require('fs');
const {checkToken} = require('./../middlewares/index');

router.get('/', function(req, res, next) {
    const data=JSON.parse(fs.readFileSync("data/courses.json"));
    if(data.courses.length<1){
        return res.json({
            err : "No course to display."
        });
    }
    return res.json({
        data : data.courses,
        err : null
    });
});

router.get('/:id',function(req,res){
    const data=JSON.parse(fs.readFileSync("data/courses.json"));
    const id=req.params.id;
    const course = data.courses.find((temp) => {
        return temp.id === parseInt(id);
    });
    if(!course){
        return res.json({
            err: "Course ID not found."
        });
    }
    return res.json({
        data : course
    });
});

router.post('/',function(req, res){
    const data = JSON.parse(fs.readFileSync("data/courses.json"));
    const name= req.body.name;
    const description= req.body.name;
    const availableSlots= req.body.name;
    if(!name || !description || !availableSlots){
        return res.json({
            err : "Invalid payload."
        });
    }
    const newId=data.courses.length+1;
    const newCourse={
        id : newId,
        name : name,
        description : description,
        enrolledStudents : [],
        availableSlots : availableSlots
    }
    data.courses.push(newCourse);
    fs.writeFile("data/courses.json", JSON.stringify(data,null,2) ,err => {
        if(err) {
            return res.json({
                err : "Error while adding the course."
            });
        }
        else{
            return res.json({
                data : "Course successfully added."
            });
        }
    });
});

router.post('/:id/enroll',checkToken,function(req,res) {

    const courseData = JSON.parse(fs.readFileSync("data/courses.json"));
    const studentData = JSON.parse(fs.readFileSync("data/students.json"));

    const courseid = parseInt(req.params.id);
    const studentid = parseInt(req.body.id);

    if(!studentid){
        return res.json({
            err : "Invalid payload."
        });
    }

    const course = courseData.courses.find((temp) => {
        return temp.id === courseid;
    });

    const student = studentData.students.find((temp) => {
        return temp.id === studentid;
    });

    if (!course) {
        return res.json({
            "err": "Course ID not found.",
        });
    }

    if (!student) {
        return res.json({
            "err": "Student ID not found."
        });
    }

    if (course.availableSlots < 1) {
        return res.json({
            "err": "Sorry, no slots are available for the course.",
        });
    }

    let i=0;
    course.enrolledStudents.forEach( student =>{
        if(student.id===studentid){
            i=1;
        }
    });
    if(i!=1){
        courseData.courses[courseid - 1].enrolledStudents.push({
            id: student.id,
            name: student.name
        });

        courseData.courses[courseid - 1].availableSlots -= 1;

        fs.writeFile("data/courses.json", JSON.stringify(courseData, null, 2), () => {
            return res.json({
                success: "Student enrolled successfully to the course."
            });
        });
    }
    else{
        return res.json({
            "err": "Student already enrolled in the course."
        });
    }
});

router.put('/:id/deregister',checkToken,function(req,res) {

    const courseData = JSON.parse(fs.readFileSync("data/courses.json"));
    const studentData = JSON.parse(fs.readFileSync("data/students.json"));

    const courseid = parseInt(req.params.id);
    const studentid = parseInt(req.body.id);

    if(!studentid){
        return res.json({
            err : "Invalid payload."
        });
    }

    const course = courseData.courses.find((temp) => {
        return temp.id === courseid;
    });

    const student = studentData.students.find((temp) => {
        return temp.id === studentid;
    });

    if (!course) {
        return res.json({
            "err": "Course ID not found.",
        });
    }

    if (course.enrolledStudents.length===0) {
        return res.json({
            "err": "No student enrolled in the course.",
        });
    }

    let i=0;
    course.enrolledStudents.forEach( student =>{
        if(student.id===studentid){
            i=1;
        }
    });

    if(i===1){
        courseData.courses[courseid-1].enrolledStudents.splice(studentid-1,1);

        courseData.courses[courseid-1].availableSlots +=1;

        fs.writeFile("data/courses.json", JSON.stringify(courseData, null, 2), () => {
            return res.json({
                success: "Student de-registered successfully from the course."
            });
        });
    }
    else{
        return res.json({
            "err": "Student ID not found and hence cannot be de-registered."
        });
    }
});

module.exports = router;


