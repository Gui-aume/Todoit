async function routes (fastify) {
    const db = fastify.db
  
    // return all items in DB
    fastify.get('/items', async () => {
        const result = await db.getItems()

        if (result.length === 0) {
            throw new Error('No documents found')
        }
        return result
    })
    // return a specific item from its ID
    .get('/item/:id', async (req,res) => {
        const id = parseInt(req.params.id)
        if(isNaN(id)) {
            res.statusCode = 422
            return 'Invalid param requested'
        }

        const result = await db.getItem(id)
        if(!result) {
            res.statusCode = 404
            return 'Item not found'
        }
        return result
    })

    // Create a new item received from the client
    .post('/items/new', async (req, res) => {
        if(typeof req.body !== 'object'){
            res.statusCode = 400
            return 'Invalid parameters'
        }

        let isValidItem = true
        let logError = 'Error:\n'

        const item = req.body

        if(typeof item?.desc !== 'string'){
            logError += 'A valid description is needed\n'
            isValidItem = false
        }
        if(!item.deadline || isNaN(parseInt(item.deadline))){
            isValidItem = false
            logError += 'Deadline invalid format\n'
        }

        // set params to 0 if not declared (task is one shot)
        if(item.repeat && !item.frequency) {
            isValidItem = false
            logError += 'A valid frequency must be defined for repeated events'
        }
        item.done = 0
        
        // Create item if all checks are good
        if(isValidItem){
            try {
                await db.createItem(item)
                return item
            } catch(err) {
                res.status(500)
                return 'Server error when creating the Item'
            }
        }

        res.statusCode = 422
        return logError
    })

    // Update the "done" field for a specific item
    .patch('/item/:id/done', async (req, res) => {
        const id = parseInt(req.params.id)
        if(isNaN(id)) {
            res.statusCode = 422
            return 'Invalid param requested'
        }

        const updated = await db.updateItemDone(id)
        return updated
    })
    // Update an item with new params
    .patch('/item/:id/update', async(req, res) => {
        const id = parseInt(req.params.id)
        if(isNaN(id)) {
            res.statusCode = 422
            return 'Invalid param requested'
        }

        if(typeof req.body !== 'object'){
            res.statusCode = 400
            return 'Invalid parameters'
        }

        try {
            // 0 or 1
            const newItem = await db.updateItem(id, req.body)
            return newItem ? newItem : {}
        } catch(err) {
            res.status(500)
            return 'Server error when updating the Item'
        }
    })

    // remove item from DB
    .delete('/item/:id', async (req, res) => {
        const id = parseInt(req.params.id)
        if(isNaN(id)) {
            res.statusCode = 422
            return 'Invalid param requested'
        }

        const deleted = await db.removeItem(id)
        return deleted
    })
}
  
module.exports = routes