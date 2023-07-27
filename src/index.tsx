import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import firebaseConfig from './firebaseConfig' // Firebaseの設定をインポート

// Firebaseを初期化
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
