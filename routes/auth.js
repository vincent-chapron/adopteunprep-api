const express = require('express');
const jwt     = require('jsonwebtoken');
const request = require('request');
const router  = express.Router();

const config_app  = require('../config/application');

module.exports = router;

router.post('/login', (req, res, next) => {
    const data = {login: req.body.login, password: req.body.password};
    const options = {
        method: "POST",
        uri: "https://auth.etna-alternance.net/identity",
        body: data,
        json: true
    }

    const rq = new Promise((done, reject) => {
        request(options, (error, response, body) => {
            done({error, response, body});
        });
    });

    rq.then(({error, response, body}) => {
        if (response.statusCode == 200) {
            const token = jwt.sign({user: body}, config_app.secret, {expiresIn: 604800, issuer: body.login});
            const cookie = response.headers["set-cookie"].toString();
            return res.json({success: true, token, cookie});
        }
        res.statusCode = response.statusCode;
        return res.json({success: false});
    })
});
