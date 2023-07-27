import React, { useEffect, useState } from 'react'
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
  limitToLast,
  get,
  set,
  push,
  remove,
} from 'firebase/database'

interface TweetData {
  id: string
  'Display name': string
  'Tweet date': string
  'Tweet date timestamp': number
  'Tweet content': string
  'Tweet URL': string
  'Media URL': string
  Likes: string
  tags?: { [key: string]: string }
}

const DisplayTweets: React.FC = () => {
  const [data, setData] = useState<TweetData[]>([])
  const [tagInputs, setTagInputs] = useState<{ [tweetId: string]: string }>({})
  const [selectedTweetIds, setSelectedTweetIds] = useState<string[]>([])
  const [bulkTagInput, setBulkTagInput] = useState('')

  useEffect(() => {
    const db = getDatabase()
    const dbRef = ref(db, 'tweets')
    const q = query(
      dbRef,
      orderByChild('Tweet date timestamp'),
      limitToLast(100)
    )
    const unsub = onValue(q, (snapshot) => {
      const fbData = snapshot.val()
      if (fbData) {
        const newDataArray: TweetData[] = Object.entries(fbData).map(
          ([id, value]: [string, any]) => ({ id, ...value })
        )
        const sortedDataArray: TweetData[] = newDataArray.sort(
          (a, b) => b['Tweet date timestamp'] - a['Tweet date timestamp']
        )
        setData(sortedDataArray)
      }
    })

    // Clean-up function
    return () => {
      unsub()
    }
  }, [])

  const handleCheckboxChange =
    (tweetId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target
      setSelectedTweetIds((prevSelectedTweetIds) => {
        if (checked) {
          return [...prevSelectedTweetIds, tweetId]
        } else {
          return prevSelectedTweetIds.filter((id) => id !== tweetId)
        }
      })
    }

  const handleTagInputChange =
    (tweetId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setTagInputs((prevTagInputs) => ({
        ...prevTagInputs,
        [tweetId]: event.target.value,
      }))
    }

  const handleTagAdd = (tweetId: string, tag: string) => {
    const db = getDatabase()
    const tweetRef = push(ref(db, `tweets/${tweetId}/tags`))
    set(tweetRef, tag)
      .then(() => {
        setData((prevData) =>
          prevData.map((item) => {
            if (item.id === tweetId) {
              return {
                ...item,
                tags: { ...(item.tags || {}), [tweetRef.key as string]: tag },
              }
            }
            return item
          })
        )
        setTagInputs((prevTagInputs) => {
          const { [tweetId]: _, ...newTagInputs } = prevTagInputs
          return newTagInputs
        })
      })
      .catch((error) => {
        console.error('Error adding tag:', error)
      })
  }

  const handleTagRemove = (tweetId: string, tagId: string) => {
    const db = getDatabase()
    const tweetRef = ref(db, `tweets/${tweetId}/tags/${tagId}`)
    remove(tweetRef)
      .then(() => {
        setData((prevData) =>
          prevData.map((item) => {
            if (item.id === tweetId) {
              const { [tagId]: _, ...newTags } = item.tags || {}
              return { ...item, tags: newTags }
            }
            return item
          })
        )
      })
      .catch((error) => {
        console.error('Error removing tag:', error)
      })
  }

  const handleMultipleTagAdd = () => {
    const tags: string[] = bulkTagInput.split(',').map((tag) => tag.trim())
    selectedTweetIds.forEach((id) =>
      tags.forEach((tag) => handleTagAdd(id, tag))
    )
    setBulkTagInput('')
  }

  const handleBulkTagInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBulkTagInput(event.target.value)
  }

  return (
    <div className="App">
      <h1>Tweets Data</h1>
      <div>
        <label>Tags for selected tweets (comma-separated):</label>
        <input
          type="text"
          value={bulkTagInput}
          onChange={handleBulkTagInputChange}
        />
        <button onClick={handleMultipleTagAdd}>Add Tags to Selected</button>
      </div>
      {data.map((item: TweetData) => (
        <div key={item.id}>
          <input
            type="checkbox"
            checked={selectedTweetIds.includes(item.id)}
            onChange={handleCheckboxChange(item.id)}
          />
          <h2>Tweet ID: {item.id}</h2>
          <p>Display name: {item['Display name']}</p>
          <p>Tweet Date: {item['Tweet date']}</p>
          <p>Tweet Date timestamp: {item['Tweet date timestamp']}</p>
          <p>
            Tweet content:{' '}
            {item['Tweet content'].replace(/ https:\/\/t\.co\/\S*/, '')}
          </p>
          <p>
            Tweet URL:{' '}
            <a
              href={item['Tweet URL']}
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
          </p>
          <img src={item['Media URL']} alt="Tweet Media" />
          <p>Likes: {item.Likes}</p>
          <div>
            <label>Tags (comma-separated):</label>
            <input
              type="text"
              value={tagInputs[item.id] || ''}
              onChange={handleTagInputChange(item.id)}
            />
            <button
              onClick={() => {
                const tags =
                  tagInputs[item.id]?.split(',').map((tag) => tag.trim()) || []
                tags.forEach((tag) => handleTagAdd(item.id, tag))
              }}
            >
              Add Tags
            </button>
          </div>
          {item.tags && (
            <div>
              <p>Tags:</p>
              {Object.entries(item.tags).map(([tagId, tag]) => (
                <div key={tagId}>
                  <span>{tag}</span>
                  <button onClick={() => handleTagRemove(item.id, tagId)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* 他のフィールドも同様に表示できます */}
        </div>
      ))}
    </div>
  )
}

export default DisplayTweets
