const express = require('express');
const request = require('request');
const passport = require('passport');
const Observable = require('rxjs/Observable').Observable;
require('rxjs/add/observable/of')
require('rxjs/add/observable/fromPromise')
require('rxjs/add/observable/forkJoin')
const router  = express.Router();

const config_app  = require('../config/application');
const groups = require('../helpers/groups');
const Like = require('../models/likes');
const validation = require('../middleware/validation');

module.exports = router;

router.post('/like/:login', passport.authenticate('jwt', { session: false }), validation, (req, res, next) => {
    const data = {
        project_id: req.body.project_id,
        session_id: req.body.session_id,
        login: req.user,
        like: req.params.login
    };
    const like = new Like(data);

    Like.findOne(data, (err, find) => {
        if (err || find) {
            err ? console.log(err) : console.log("user already liked");
            res.statusCode = 400
            return res.json({success: false})
        }

        like.save(err => {
            if (err) {
                console.log(err)
                res.statusCode = 400;
                return res.json({success: false});
            }
            return res.json({success: true});
        })
    })
});

router.delete('/projects/:id/sessions/:session/groups/:group', passport.authenticate('jwt', { session: false }), validation, (req, res, next) => {
    const options = {
        method: 'GET',
        url: `https://prepintra-api.etna-alternance.net/sessions/${req.params.session}/project/${req.params.id}/group/${req.params.group}`,
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
            console.log(body)
            res.statusCode = response.statusCode;
            res.json({success: false});
        }
    })
});

router.get('/projects/:id/sessions/:session/groups/me', passport.authenticate('jwt', { session: false }), validation, (req, res, next) => {
    console.log(groups)
    rq = groups.findMyGroup(req.headers.cookie, req.params.session, req.params.id)

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

router.get('/projects/:id/sessions/:session/available/students', passport.authenticate('jwt', { session: false }), validation, (req, res, next) => {
    const options = {
        method: 'GET',
        json: true,
        headers: {Cookie: req.headers.cookie}
    }

    let groupOptions = options;
    groupOptions.url = `https://prepintra-api.etna-alternance.net/sessions/${req.params.session}/project/${req.params.id}/mygroup`
    group = new Promise(done => {
        request(options, (error, response, body) => done({error, response, body}))
    })

    let unsubscribeOptions = options;
    unsubscribeOptions.url = `https://prepintra-api.etna-alternance.net/sessions/${req.params.session}/project/${req.params.id}/unsubscribe`
    unsubscribe = new Promise(done => {
        request(options, (error, response, body) => done({error, response, body}))
    })

    let groupsOptions = options;
    groupsOptions.url = `https://prepintra-api.etna-alternance.net/sessions/${req.params.session}/project/${req.params.id}/groups`
    groups = new Promise(done => {
        request(options, (error, response, body) => done({error, response, body}))
    })

    Observable.forkJoin(
        Observable.fromPromise(group),
        Observable.fromPromise(unsubscribe),
        Observable.fromPromise(groups)
    ).subscribe(data => {
        if (data[0].response.statusCode === 200) {
            if (data[0].body.leader.login == req.user) {
                return res.json(data[1].body)
            }
            return res.json([])
        } else {
            let leaders = []
            data[2].body.forEach(group => {
                leaders.push(group.leader)
            })
            return res.json(leaders)
        }
    });
});
