const express = require('express');
const passport = require('passport');
const request = require('request');
const router  = express.Router();

const routes_auth = require('./auth');
const routes_group = require('./group');
const validation = require('../middleware/validation');

module.exports = router;

router.get('/', (req, res, next) => {
    res.json({});
});

router.get('/projects', passport.authenticate('jwt', { session: false }), validation, (req, res, next) => {
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
            let projects = []
            console.log(body)
            for (var ue in body) {
                if(body.hasOwnProperty(ue)) {
                    const data = body[ue]
                    if (data.hasOwnProperty("activities")) {
                        data.activities.forEach(activity => {
                            if (activity.type == "project") projects.push(activity)
                        })
                    }
                }
            }

            res.json(projects);
        } else {
            res.statusCode = response.statusCode;
            res.json({success: false});
        }
    })
});

router.get('/projects/:id/sessions/:session', passport.authenticate('jwt', { session: false }), validation, (req, res, next) => {
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
            res.json(body);
        } else {
            res.statusCode = response.statusCode;
            res.json({success: false});
        }
    })
});

router.post('/projects/:id/sessions/:session', passport.authenticate('jwt', { session: false }), validation, (req, res, next) => {
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
            res.json(body);
        } else {
            console.log(body)
            res.statusCode = response.statusCode;
            res.json({success: false});
        }
    })
});

router.use('/', routes_auth);
router.use('/', routes_group);
