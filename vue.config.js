module.exports = {
    devServer: {
        proxy: {
            '^/proxy': {
                target: 'http://localhost',
                // ws: true,
                // changeOrigin: true
                router: function (req) {
                    console.log(req.query.address)
                    return req.query.address
                }
            },
        }
    }
}