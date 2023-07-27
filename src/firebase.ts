import { initializeApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  query,
  orderByChild,
  limitToLast,
} from 'firebase/database'
import firebaseConfig from './firebaseConfig'

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export { database, ref, set, get, onValue, query, orderByChild, limitToLast }
