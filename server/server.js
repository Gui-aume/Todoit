const path = require('path')
const fastify = require('fastify')({ logger: true })
const fastifyS = require('fastify-static')

fastify.db = require('./db.js')

fastify.db.create().then(() => {

    // json parser
    fastify.addContentTypeParser('application/json', { parseAs: 'string'}, fastify.getDefaultJsonParser('remove','ignore'))

    // serve index page from builded React dir
    fastify.register(fastifyS, {
        root: path.join(__dirname, '..','build')
    })

    // handle HTTP requests
    fastify.register(require('./router.js'))

    fastify.listen(8000).then(console.log)
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
})
.catch(console.error)