var express = require('express');
var request = require('request');
var passport = require('passport');
var Observable = require('rxjs/Observable').Observable;
require('rxjs/add/observable/fromPromise')
require('rxjs/add/observable/forkJoin')
var router  = express.Router();

var config_app  = require('../config/application');
var groups = require('../helpers/groups');
var Like = require('../models/likes');

module.exports = router;

// router.get('/likes', passport.authenticate('jwt', { session: false }), (req, res, next) => {
//     const my_likes = new Promise(done => {
//         Like.find({login: req.user}, (err,docs) => done({err, docs}));
//     });
//     const likes_me = new Promise(done => {
//         Like.find({like: req.user}, (err,docs) => done({err, docs}));
//     });
//
//     Observable.forkJoin([
//         Observable.fromPromise(my_likes),
//         Observable.fromPromise(likes_me),
//     ]).subscribe(data => {
//         if (data[0].err || data[1].err) {
//             console.log(err)
//             res.statusCode = 400
//             return res.json({success: false})
//         }
//
//         var likes = data[1].docs.filter(like => {
//             let match = false
//             data[0].docs.map(l => (l.project_id == like.project_id) ? match = true : false)
//             return match
//         })
//
//         let obs = likes.map(like => {
//             return Observable.fromPromise(groups.findMyGroup(req.headers.cookie, like.session_id, like.project_id))
//         })
//
//         Observable.forkJoin(obs).subscribe(data => {
//             data.forEach((like, i) => {
//                 if (like.response.statusCode == 200) {
//                     if (like.body.leader.login == req.user) {
//                         console.log('AJOUT DE ', likes[i].login)
//                     }
//                     // ELSE DEMANDE EN COURS ?
//                 }
//             })
//             res.json(likes)
//         })
//
//         // SI JE SUIS CHEF DE GROUPE =>
//             // FAIRE UNE DEMANDE DE GROUPE SI MON GROUPE < MAX DU PROJET
//                 // REUSSITE => JE SUPPRIME LES DEUX LIKES
//                 // ECHEC => JE RESSAIRAI LA PROCHAINE FOIS
//             // RETURN {max dans groupe, personne dans le groupe, nb demande effectuée, nb demande échouée}
//         // SI JE SUIS SANS GROUPE =>
//             // UNE DEMANDE EST EN COURS D'UN MATCH, ALORS J'ACCEPTE
//             // UNE DEMANDE EST EN COURS MAIS D'UN AUTRE, JE REFUSE
//             // JE N'AI PAS DE DEMANDE, JE FAIS RIEN
//             // RETURN {accepted, refused}
//     })
// });

router.post('/like/:login', passport.authenticate('jwt', { session: false }), (req, res, next) => {
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

router.delete('/projects/:id/sessions/:session/groups/:group', passport.authenticate('jwt', { session: false }), (req, res, next) => {
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

router.get('/projects/:id/sessions/:session/groups/me', passport.authenticate('jwt', { session: false }), (req, res, next) => {
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

router.get('/projects/:id/sessions/:session/available/students', passport.authenticate('jwt', { session: false }), (req, res, next) => {
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
