// This is the main component
import InputBar from './InputBar.jsx';
import Items from './Items.jsx';
import { useEffect, useState } from "react"
import {sortItems} from "../Utils.js"

// To set if not on localhost
const host = ''

// Make the HTTP header options to send JSON data
const makeOpts = (method, body) => {
    const opts = { method }
    if(body){
        opts.headers = {
            'Content-Type': 'application/json',
        }
        opts.body = JSON.stringify(body)
    }
    return opts
}

// Main component
const Todo = () => {

    // data contains the list of tasks
    const [data, SetData] = useState([])
    // to show/hide finished tasks
    const [showFinished, setShowFinished] = useState(false)
    
    const refreshItems = items => SetData(sortItems(items))

    // create new item and send to server
    const addItem = newItem => new Promise((s,f) => {
        fetch(host + '/items/new', makeOpts('POST', newItem))
        .then(res => res.json())
        .then(json => {
            // If valid, add to the data list
            refreshItems([...data, json])
            s()
        })
        .catch(f)
    })

    // Remove a task
    const deleteItem = id => new Promise(s => {
        fetch(host + '/item/' + id, makeOpts('DELETE'))
        .then(() => {
            const newData = data.filter(item => parseInt(id) !== item.id)
            refreshItems(newData)
            s()
        })
    })

    // Update data of an item and reload DOM
    const updateItem = (id, newItem) => new Promise((s,f) => {
        fetch(host + '/item/' + id + '/update', makeOpts('PATCH', newItem))
        .then(res => res.json())
        .then(json => {
            if (Object.keys(json).length > 0) { // if object updated
                const newData = data.map(e => e.id === id ? {json} : e)
                refreshItems(newData)
            }
            s()
        })
        .catch(f)
    })

    /* Handle "done" click
        - if repeat=0 : done=0|1
        - if repeat=1 : increment "done" everytime the task is done
    */
    const toggleDone = item => new Promise(s => {
        let done = item.done
        fetch(host + '/item/' + item.id + '/done', makeOpts('PATCH'))
        .then(res => res.json())
        .then(json => {
            done = json.done
            refreshItems(data.map(e => e.id === item.id ? {...e, done} : e))
            s(done)
        })
        .catch(e => {
            console.error('Erreur avec le serveur')
            s(done)
        })
    })

    // Load todo list when this component is mounted
    useEffect(() => {
        fetch(host + '/items', makeOpts('get'))
        .then(res => res.json())
        .then(json => {
            refreshItems(json)
        })
        .catch(console.error)
    }, [])

    return <><div className='Todo'>
        <InputBar addItem={addItem} />
        </div>
        <Items data={data} deleteItem={deleteItem} updateItem={updateItem} toggleDone={toggleDone} showFinished={showFinished} setShowFinished={setShowFinished} />
    </>
}

export default Todo