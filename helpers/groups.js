const request = require('request')
const Observable = require('rxjs/Observable').Observable;
require('rxjs/add/observable/of')
require('rxjs/add/observable/fromPromise')
require('rxjs/add/observable/forkJoin')
const Like = require('../models/likes');

let groups = {}

module.exports = groups;

groups.findMyGroup = function(cookie, session, project) {
    const options = {
        method: 'GET',
        url: `https://prepintra-api.etna-alternance.net/sessions/${session}/project/${project}/mygroup`,
        json: true,
        headers: {Cookie: cookie}
    }

    return new Promise(done => {
        request(options, (error, response, body) => done({error, response, body}))
    })
}

groups.addToMyGroup = function(cookie, session, project, groupe, student) {
    const options = {
        method: 'POST',
        url: `https://prepintra-api.etna-alternance.net/sessions/${session}/project/${project}/group/${groupe}`,
        json: true,
        body: {student},
        headers: {Cookie: cookie}
    }

    return new Promise(done => {
        request(options, (error, response, body) => done({error, response, body}))
    })
}

groups.putGroup = function(cookie, session, project, groupe, validation, user = null, student = null) {
    const options = {
        method: 'PUT',
        url: `https://prepintra-api.etna-alternance.net/sessions/${session}/project/${project}/group/${groupe}`,
        json: true,
        body: {validation},
        headers: {Cookie: cookie}
    }

    let obs = [
        Observable.fromPromise(new Promise(done => {
            if (validation && user && student) Like.remove({like: user, login: student, session_id: session, project_id: project}, (err,docs) => done({err, docs}));
            else done()
        })),
        Observable.fromPromise(new Promise(done => {
            if (validation && user && student) Like.remove({like: student, login: user, session_id: session, project_id: project}, (err,docs) => done({err, docs}));
            else done()
        })),
        Observable.fromPromise(new Promise(done => {
            request(options, (error, response, body) => done({error, response, body}))
        })),
    ]

    return new Promise(done => {
        Observable.forkJoin(obs).subscribe(data => done(data[2]))
    })
}
