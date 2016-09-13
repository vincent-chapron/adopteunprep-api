var express = require('express');
var request = require('request');
var Observable = require('rxjs/Observable').Observable;
require('rxjs/add/observable/fromPromise')
require('rxjs/add/observable/forkJoin')
var router  = express.Router();

var config_app  = require('../config/application');

module.exports = router;

router.get('/projects/:id/sessions/:session/groups/me', (req, res, next) => {
    const options = {
        method: 'GET',
        url: `https://prepintra-api.etna-alternance.net/sessions/${req.params.session}/project/${req.params.id}/mygroup`,
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
            console.log(body)
            res.statusCode = response.statusCode;
            res.json({success: false});
        }
    })
});

router.get('/projects/:id/sessions/:session/available/students', (req, res, next) => {
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

    Observable.forkJoin(
        Observable.fromPromise(group),
        Observable.fromPromise(unsubscribe)
    ).subscribe(data => {
        res.json(data)
    });

    // JAI UN GROUPE ?
        // OUI
            // CHEF DE GROUPE ?
                // OUI
                    // CEUX QUI N'ONT PAS DE GROUPE
                // NON
                    // RIEN
        // NON
            // VOIR LES CHEFS DE GROUPE
});
