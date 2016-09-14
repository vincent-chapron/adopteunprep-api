const request = require('request')

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
