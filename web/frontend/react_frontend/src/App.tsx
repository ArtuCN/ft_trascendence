import { useState } from 'react'
import Navbar from './components/ui/navbar'
import './styles/App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <div className="p-8">
        <div>
          
        </div>
        <h1>Vite + React</h1>
        <div className="card p-2">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </div>
    </>
  )
}

export default App
