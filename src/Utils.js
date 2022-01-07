// Useful functions for the Frontend

// Used for repetitive tasks
const units = {
    's': 1,
    'm': 60,
    'h': 3600,
    'D': 86400,
    'M': 2592000,
    'Y': 31622400,
}

// Number of months between 2 dates
const getMonths = (first, second) => second.getMonth() - first.getMonth() + (12 * (second.getYear() - first.getYear()))

const twoDigits = n => Math.abs(n).toString().padStart(2, '0')

// Convert timestamp to human readable deadlin - param : timestamp of the deadline
const convertTime = timestamp => {
    const s = Math.trunc((timestamp - Date.now()) / 1000) // ms to s

    if(Math.abs(s) >= 86400) { // a day
        const months = getMonths(new Date(), new Date(timestamp))
        const days = Math.trunc(s / 86400)

        // A month or more
        if(months !== 0) {
            const years = Math.trunc(months / 12)
            return years !== 0 ? `${years}A ${Math.abs(Math.trunc(months%12))}M`
                : `${months}M ${Math.abs(days)}J`
        }

        // Less than a month
        return `${days}J ${Math.abs(Math.trunc(s / 3600 % 24))}h`
    }

    if(Math.abs(s) < 60) // Less than a minute
        return s + 's'

    const min = Math.trunc(s / 60) % 60
    const h = Math.trunc(s / 3600)

    return h !== 0 ? `${h}h${twoDigits(min)}min`
        : `${min}min${twoDigits(s%60)}s`
}

// For repetitive taks, add to the deadline: the frequency for each times task was done
const calculateNextDeadline = (deadline, frequency, done=0) => {
    const matches = frequency.match(/(\d+)([YMDhms])/) // to validate unit format
    let val=0, unit
    if (matches?.length > 2 ) {
        val = parseInt(matches[1])
        unit = matches[2]
    }
    
    if(unit in units) // deadline + interval * done
        return deadline + (units[unit] * val * 1000) * done

    console.error(`Unit "${unit}" not defined for deadline: "${deadline}"`)
    return deadline
}

// Used to sort tasks from most urgent to less urgent : repetitive tasks are updated when incremented
const sortByDeadline = (a,b) => {
    let deadlineA = a.repeat ? calculateNextDeadline(a.deadline, a.frequency, a.done) : a.deadline
    let deadlineB = b.repeat ? calculateNextDeadline(b.deadline, b.frequency, b.done) : b.deadline

    return deadlineA - deadlineB
}

// Sort the list of todos, then add done tasks
const sortItems = items => {
    if(items.length < 1) return []

    const list = items.filter(e => !e.done || e.repeat).sort(sortByDeadline)
    list.push(...items.filter(e => e.done && !e.repeat).sort(sortByDeadline))

    return list
}

export {units, convertTime, calculateNextDeadline, sortItems}