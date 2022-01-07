const sqlite3 = require('sqlite3').verbose()

const tableName = 'items'

// load DB - create the file if missing
const db = new sqlite3.Database('./DB/todoit.db')

// Simple SQL select : condition is optional
const requestDB = (select, condition) => new Promise((s,f) => {
    const where = condition ? 'WHERE ' + condition : ''
    db.all(`SELECT ${select} FROM ${tableName} ${where}`, (e,data) => {
        if(e) f(e)
        s(data)
    })
})

// Get the DB table, create it if it doesn't exist
exports.create = () => new Promise((s,f) => {
    db.serialize(() => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`, (e,data) => {
            if(e) f(e)

            if(data?.name !== tableName) {
                console.log('Create Table')
                db.run(`CREATE TABLE ${tableName} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    desc TEXT,
                    deadline INTEGER,
                    frequency VARCHAR(10),
                    done INTEGER,
                    repeat BOOLEAN
                )`)
            }

            s('DB Ready')
        })
    })
})

exports.getItem = id => requestDB('*', 'id='+id)

// dump all table
exports.getItems = () => requestDB('*')

// return taks not already done
exports.getItemsTodo = () => requestDB('*', 'repeat=1 OR (repeat=0 AND done=0)')

exports.createItem = item => new Promise((s,f) => {
    db.serialize(() => {
        db.prepare(`INSERT INTO ${tableName} (desc,deadline,frequency,done,repeat) VALUES (?,?,?,?,?)`)
            .run(item.desc, item.deadline, item.frequency, 0, item.repeat ? 1 : 0, function (e) {
                if(e) return f(e)
                item.id = this.lastID
                s(item)
            }).finalize()
    })
})

exports.updateItem = (id, newItem) => new Promise((s,f) => {
    const update = Object.entries(newItem).reduce((a,[k,v],i) => `${a} ${(i > 0 ? ',' : '')} ${k}='${v}'`, '')

    db.serialize(() => {
        db.run(`UPDATE ${tableName} SET ${update} WHERE id=${id}`, async function(e) {
            if(e) return f(e)
            if(this.changes) {
                const item = await getItem(id)
                return s(item)
            } else s()
        })
    })
})

/* Update the "done" field for an item and return new value
    - for unique actions: 1 = done
    - for repetitive tasks: increment everytime we proceed
*/
exports.updateItemDone = id => new Promise((s,f) => {
    db.serialize(() => {
        db.run(`UPDATE ${tableName} SET done=(CASE WHEN repeat=1 THEN done+1 WHEN done>0 THEN 0 ELSE 1 END) WHERE id=${id}`, e => {
            if(e) return f(e)
        })

        db.get(`SELECT done FROM ${tableName} WHERE id=${id}`, (e,row) => {
            if(e) f(e)
            s(row)
        })
    })
})


exports.removeItem = id => new Promise((s,f) => {
    db.serialize(() => {
        db.run(`DELETE FROM ${tableName} WHERE id=${id}`, (e,ret) => {
            if(e) f(e)
            s(id)
        })
    })
})