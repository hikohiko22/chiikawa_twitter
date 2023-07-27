import React from 'react'
import DisplayTweets from './components/DisplayTweets'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Chiikawa Twitter App</h1>
      </header>
      <main>
        <DisplayTweets />
      </main>
    </div>
  )
}

export default App
