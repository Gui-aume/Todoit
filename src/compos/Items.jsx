// Container for the task items
import Item from "./Item.jsx"
import '../static/Items.css'

const Items = props => {
    const {data, deleteItem, updateItem, toggleDone, showFinished, setShowFinished} = props

    // to show/hide the finished tasks
    const toggleFinished = () => setShowFinished(prev => !prev)
    // make the Item component from object data
    const generateItem = (item,i) => <Item i={i} key={item.id} item={item} deleteItem={deleteItem} updateItem={updateItem} toggleDone={toggleDone} />

    return <div className='Items'>
        <button name='done' className='ToggleDone' onClick={toggleFinished}>{showFinished ? 'Masquer les tâches terminées' : 'Afficher les tâches terminées'}</button>
        <div className='itemList'>{data?.length > 0 ?
            showFinished ? data.map(generateItem)  // show all
            : data.filter(e => !e.done || e.repeat).map(generateItem) // show to do
        : <></>}</div>
    </div>
}

export default Items