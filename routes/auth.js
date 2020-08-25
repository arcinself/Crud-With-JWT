const express = require('express');
const router = express.Router();
const fs = require('fs');
const bcrypt  = require('bcrypt');
const {to} = require('await-to-js');
const jwt = require('jsonwebtoken');

let salt = 'ZGV2c25lc3QK';

const passwordHash = async (password) => {
    const saltRounds = 12;
    const [err, passwordHash] = await to(bcrypt.hash(password, saltRounds));
    if (err) {
        return res.json({
            err : "Error while generating password hash."
        });
    }
    return passwordHash;
};

const generateToken  = (userData) => {
    let token = jwt.sign(userData, salt, {
        expiresIn: 172800000,
    });
    return token;
};

router.post('/signup', async function(req, res){
    let students = JSON.parse(fs.readFileSync("data/auth.json"));
    let {email, name, password} = req.body;
    if (!email || !name || !password) {
        return res.json({
            err: "Invalid payload."
        });
    }
    else{
        let id=students.data.length+1;
        let user = {
            id: id,
            email: email,
            name: name,
            password: await passwordHash(password)
        };
        students.data.push(user);
        fs.writeFileSync("data/auth.json", JSON.stringify(students, null, 2))
        return res.json({
            data: {
                isSignedUp: true
            },
            err: null
        });
    }
});


router.post('/login', async (req, res)=>{
    let students = JSON.parse(fs.readFileSync("data/auth.json"));
    let {email, password} = req.body;
    let student = students.data.find((temp) => {
        return temp.email === email;
    });
    if (!student){
        return res.json({
                err: "Student email not found."
        });
    }
    if (student){
        const [err, isValid] = await to(bcrypt.compare(password, student.password));
        if (isValid){
            return res.json({
                data: {
                    token: generateToken(student)
                },
                err: null
            });
        } else{
            return res.json({
                err : "Invalid password."
            });
        }
    }

});

module.exports = router;