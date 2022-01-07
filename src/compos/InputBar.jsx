// Form to add new tasks
import '../static/InputBar.css'
import { useState } from 'react'

let frequencyFormat = false

const InputBar = props => {
    const now = new Date()
    
    // handle the form fields
    const [desc, setDesc] = useState('')
    const [frequency, setFrequency] = useState('')
    const [date, setDate] = useState(now.toISOString().split('T')[0])
    const [time, setTime] = useState(now.toTimeString().split(' ')[0])
    const [repeat, setRepeat] = useState()

    // function imported from parent
    const {addItem}  = props

    const onFrequency = e => {
        setFrequency(e.target.value)
        
        // check frequency format: only digits with a letter
        frequencyFormat = /^\d+[YMDhms]$/.test(e.target.value)
        e.target.style.color = frequencyFormat ? 'black':'red'
    }
  
    // Validate form data then send new task to the server
    const onSubmit = async e => {
        e.preventDefault()

        if(repeat && !frequencyFormat) {
            console.error('Frequency needed for repeated tasks')    
            return
        }

        const timestamp = new Date(`${date}T${time}`).getTime()
        const newTask = {
            desc,
            deadline: timestamp,
            done: false,
            repeat,
            frequency: repeat ? frequency : null
        }

        console.log('Adding ' + desc)

        await addItem(newTask)
        .catch(() => {
            console.error('Error when adding ' + desc)
        })
    }

    return <form className='InputBar' onSubmit={onSubmit}>
            <input type='text' placeholder='Action à réaliser' value={desc} onChange={e => setDesc(e.target.value )} />
            <span><input id='date' type='date' value={date} onChange={e => setDate(e.target.value)} />
            <input type='time' value={time} onChange={e => setTime(e.target.value)} /></span>

            <span><label htmlFor='cycle'>Cyclique</label> <input id='cycle' type='checkbox' onChange={e => setRepeat(e.target.checked)} value='repeat' /></span>
            {<input style={{visibility: repeat? 'inherit' : 'hidden'}}type='text' placeholder='Frequence: 1Y|2M|3D|4h|5m|6s' value={frequency} onChange={e => onFrequency(e)} />}
            <input type='submit' value='Ajouter' readOnly='readonly' />
        </form>
}

export default InputBar