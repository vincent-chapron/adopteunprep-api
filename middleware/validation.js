const Observable = require('rxjs/Observable').Observable;
require('rxjs/add/observable/of')
require('rxjs/add/observable/fromPromise')
require('rxjs/add/observable/forkJoin')

const groups = require('../helpers/groups');
const Like = require('../models/likes');

module.exports = (req, res, next) => {
    const my_likes = new Promise(done => {
        Like.find({login: req.user}, (err,docs) => done({err, docs}));
    });
    const likes_me = new Promise(done => {
        Like.find({like: req.user}, (err,docs) => done({err, docs}));
    });

    Observable.forkJoin([
        Observable.fromPromise(my_likes),
        Observable.fromPromise(likes_me),
    ]).subscribe(data => {
        if (data[0].err || data[1].err) {
            console.log(err)
            res.statusCode = 400
            return res.json({success: false})
        }

        var likes = data[1].docs.filter(like => {
            let match = false
            data[0].docs.map(l => (l.project_id == like.project_id) ? match = true : false)
            return match
        })

        let obs = likes.map(like => {
            return Observable.fromPromise(groups.findMyGroup(req.headers.cookie, like.session_id, like.project_id))
        })

        if (obs.length == 0) return next()

        Observable.forkJoin(obs).subscribe(data => {

            obs2 = data.map((like, i) => {
                if (like.response.statusCode == 200) {
                    // J'AI UN GROUPE
                    if (like.body.leader.login == req.user) {
                        // JE SUIS CHEF DE GROUPE
                        console.log('AJOUT DE ', likes[i].login)
                        return Observable.fromPromise(groups.addToMyGroup(req.headers.cookie, likes[i].session_id, likes[i].project_id, like.body.id, likes[i].login))
                    } else {
                        me = like.body.members.filter(member => member.login == req.user)[0]
                        if (me.validation == 0 && like.body.leader.login == likes[i].login) {
                            // J'AI UNE DEMANDE EN COURS D'UNE PERSONNE QUE J'AI AIMER JE l'ACCEPTE
                            console.log('ACCES AU GROUPE DE ', likes[i].login)
                            return Observable.fromPromise(groups.putGroup(req.headers.cookie, likes[i].session_id, likes[i].project_id, like.body.id, 1, req.user, likes[i].login))
                        } else if (me.validation == 0) {
                            // J'AI UNE DEMANDE EN COURS D'UNE AUTRE PERSONNE JE REFUSE
                            console.log('REFUS AU GROUPE DE ', likes[i].login)
                            return Observable.fromPromise(groups.putGroup(req.headers.cookie, likes[i].session_id, likes[i].project_id, like.body.id, 0))
                        }
                        // ELSE JE SUIS DEJA DANS UN GROUPE DONC JE SUPPRIME LES LIKES
                        return Observable.of(0)
                    }
                }
                // ELSE AUCUNE DEMANDE EN COURS DONC RIEN
                return Observable.of(0)
            })

            Observable.forkJoin(obs2).subscribe(data2 => {
                next()
            })
        })
    })
}
