// Component for a specific task
import React, { useState, useEffect } from 'react';
import { convertTime, calculateNextDeadline } from "../Utils.js"

// Called every second : update the remaining time of the task
const updateDeadline = (item, done) => {
    if(!item.repeat)
        return done ? 'Done' : convertTime(item.deadline)

    return convertTime(calculateNextDeadline(item.deadline, item.frequency, item.done))
}

const Item = props => {
    const item = props.item
    const [done, setDone] = useState(item.done)
    // remaining time before next deadline
    const [remains, setRemains] = useState(updateDeadline(item, done))
    // For deadline color
    const [color, setColor] = useState('grey')

    // Done button
    const handleDone = async () => {
        const newDone = await props.toggleDone(item)
        setDone(newDone)
    }

    // Delete button
    const handleDelete = async e => {
        e.preventDefault()
        if (window.confirm('Supprimer ?')) {
            props.deleteItem(e.target.id.substring(3))
        }
    }

    // Action over and not repetitive : strike text
    const desc = done && !item.repeat ? <strike>{item.desc}</strike> : item.desc

    // Change deadline color
    useEffect(() => {
        if(!item.repeat && done)
            setColor('grey')
        else if (remains[0] === '-')
            setColor('red')
        else
            setColor('yellowgreen')
    }, [done, remains, item.repeat])

    // refresh deadline value each second
    useEffect(() => {
        if(item.repeat || !done) {
            const intervalId = setInterval(() => setRemains(updateDeadline(item, done)), 1000)
            return () => clearInterval(intervalId)
        } else 
            setRemains(updateDeadline(item, done))
    }, [item, done])

    const notDone = done && !item.repeat

    return <div className={'item ' + (props.i%2===0 ? 'even' : 'odd')}>
        <span className='desc'>{desc}</span>
        <span className='repeat'>{item.repeat ? `⭮ ${item.frequency}` : ''}</span>
        <span className='deadline' style={{color}}>{!item.repeat && done ? 'Terminé' : remains}</span>
        <button className='done' id={'do'+item.id} title={notDone ? 'Annuler' : 'Finir'} onClick={handleDone}>{notDone ? '✖' : '✔'}</button>
        <button className='delete' id={'del'+item.id} title='Supprimer' onClick={handleDelete}></button>
    </div>
}

export default Item