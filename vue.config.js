const axios = require('axios');
const bodyParser = require('body-parser')
const httpContentTypeBase64 = 'X-user/base64-data'
const bodyTextParser = bodyParser.text({type: '*/*', limit: '1000kb'})

const PROXY_PATH = '/proxy'

module.exports = {
    devServer: {
        setup: function (app) {
            app.all(PROXY_PATH, bodyTextParser, function (req, res) {
                const address = req.query.address
                if (!address) {
                    return res.status(400).end()
                }
                const proxyReq = {
                    url: address,
                    method: req.method,
                    responseType: 'arraybuffer',
                    headers: {'content-type': ''} // is this required here?
                }
                if (req.method === 'POST') {
                    if (req.headers['content-type'] !== httpContentTypeBase64) {
                        return res.status(400).end()
                    }
                    const requestBodyBase64String = req.body
                    proxyReq.data = Buffer.from(requestBodyBase64String, 'base64')

                }
                axios.request(proxyReq).then(function (proxyResponse) {
                    if (proxyResponse.status !== 200) {
                        return res.status(proxyResponse.status).end()
                    }
                    res.set('Content-Type', httpContentTypeBase64)
                    const proxyResponseBodyBase64String = Buffer.from(proxyResponse.data).toString('base64')
                    res.status(proxyResponse.status)
                    res.send(proxyResponseBodyBase64String).end()
                }).catch(function (error) {
                    if (error.response) {
                        res.status(error.response.status).end()
                    } else {
                        res.status(500).end()
                    }
                })
            });
        }
    }
}
