var express = require('express');
var passport = require('passport');
var request = require('request')
var router  = express.Router();

var routes_auth = require('./auth');

var User = require('../models/users/users');

module.exports = router;

router.get('/', (req, res, next) => {
    res.json({});
});

router.get('/projects', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const options = {
        method: 'GET',
        url: `https://prepintra-api.etna-alternance.net/students/${req.user}/currentactivities`,
        json: true,
        headers: {Cookie: req.headers.cookie}
    }

    rq = new Promise(done => {
        request(options, (error, response, body) => done({error, response, body}))
    })

    rq.then(({error, response, body}) => {
        if (response.statusCode == 200) {
            res.json({success: true, data: body});
        } else {
            res.statusCode = response.statusCode;
            res.json({success: false});
        }
    })
});

router.get('/projects/:id/sessions/:session', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const options = {
        method: 'GET',
        url: `https://modules-api.etna-alternance.net/${req.params.session}/activities/${req.params.id}`,
        json: true,
        headers: {Cookie: req.headers.cookie}
    }

    rq = new Promise(done => {
        request(options, (error, response, body) => done({error, response, body}))
    })

    rq.then(({error, response, body}) => {
        if (response.statusCode == 200) {
            res.json({success: true, data: body});
        } else {
            res.statusCode = response.statusCode;
            res.json({success: false});
        }
    })
});

router.post('/projects/:id/sessions/:session', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const options = {
        method: 'POST',
        url: `https://prepintra-api.etna-alternance.net/sessions/${req.params.session}/project/${req.params.id}/group `,
        json: true,
        body: {activity_id: req.params.id, activity_type: req.body.type, session_id: req.params.session},
        headers: {Cookie: req.headers.cookie}
    }

    rq = new Promise(done => {
        request(options, (error, response, body) => done({error, response, body}))
    })

    rq.then(({error, response, body}) => {
        if (response.statusCode == 200) {
            res.json({success: true, data: body});
        } else {
            console.log(body)
            res.statusCode = response.statusCode;
            res.json({success: false});
        }
    })
});

router.use('/', routes_auth);
