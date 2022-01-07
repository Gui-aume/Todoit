import './static/App.css'
import Todo from './compos/Todo.jsx'

const App = () => (
    <div className="App">
        <header className="App-header">
            ToDoIt
        </header>
        <main className='App-body'>
            <Todo className='Todo' />
        </main>
    </div>)

export default App;