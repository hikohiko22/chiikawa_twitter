import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, limitToLast, get, set } from 'firebase/database';

interface TweetData {
  id: string;
  'Display name': string;
  'Tweet date': string;
  'Tweet date timestamp': number;
  'Tweet content': string;
  'Tweet URL': string;
  'Media URL': string;
  Likes: string;
  tags?: string[];
}

const DisplayTweets: React.FC = () => {
  const [data, setData] = useState<TweetData[]>([]);
  const [tagInputs, setTagInputs] = useState<{ [tweetId: string]: string }>({});
  const [selectedTweetIds, setSelectedTweetIds] = useState<string[]>([]);
  const [bulkTagInput, setBulkTagInput] = useState('');

  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, 'tweets');
    const q = query(dbRef, orderByChild('Tweet date timestamp'), limitToLast(100));
    const unsub = onValue(q, (snapshot) => {
      const fbData = snapshot.val();
      if (fbData) {
        const newDataArray: TweetData[] = Object.entries(fbData).map(([id, value]: [string, any]) => ({ id, ...value }));
        const sortedDataArray: TweetData[] = newDataArray.sort((a, b) => b['Tweet date timestamp'] - a['Tweet date timestamp']);
        setData(sortedDataArray);
      }
    });

    // Clean-up function
    return () => {
      unsub();
    };
  }, []);

  const handleCheckboxChange = (tweetId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setSelectedTweetIds(prevSelectedTweetIds => {
      if (checked) {
        return [...prevSelectedTweetIds, tweetId];
      } else {
        return prevSelectedTweetIds.filter(id => id !== tweetId);
      }
    });
  };

  const handleTagInputChange = (tweetId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInputs(prevTagInputs => ({ ...prevTagInputs, [tweetId]: event.target.value }));
  };

  const handleTagAdd = (tweetId: string, tags: string[]) => {
    const db = getDatabase();
    const tweetRef = ref(db, `tweets/${tweetId}/tags`);
    set(tweetRef, tags).then(() => {
      setData(prevData => prevData.map(item => {
        if (item.id === tweetId) {
          return { ...item, tags };
        }
        return item;
      }));
      setTagInputs(prevTagInputs => {
        const { [tweetId]: _, ...newTagInputs } = prevTagInputs;
        return newTagInputs;
      });
    }).catch(error => {
      console.error('Error adding tags:', error);
    });
  };

  const handleMultipleTagAdd = () => {
    const tags: string[] = bulkTagInput.split(',').map(tag => tag.trim());
    selectedTweetIds.forEach(id => handleTagAdd(id, tags));
    setBulkTagInput('');
  };

  const handleBulkTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBulkTagInput(event.target.value);
  };

  return (
    <div className="App">
      <h1>Tweets Data</h1>
      <div>
        <label>Tags for selected tweets (comma-separated):</label>
        <input type="text" value={bulkTagInput} onChange={handleBulkTagInputChange} />
        <button onClick={handleMultipleTagAdd}>Add Tags to Selected</button>
      </div>
      {data.map((item: TweetData) => (
        <div key={item.id}>
          <input type="checkbox" checked={selectedTweetIds.includes(item.id)} onChange={handleCheckboxChange(item.id)} />
          <h2>Tweet ID: {item.id}</h2>
          <p>Display name: {item['Display name']}</p>
          <p>Tweet Date: {item['Tweet date']}</p>
          <p>Tweet Date timestamp: {item['Tweet date timestamp']}</p>
          <p>Tweet content: {item['Tweet content'].replace(/ https:\/\/t\.co\/\S*/, "")}</p>
          <p>Tweet URL: <a href={item['Tweet URL']} target="_blank" rel="noopener noreferrer">Link</a></p>
          <img src={item['Media URL']} alt="Tweet Media" />
          <p>Likes: {item.Likes}</p>
          <div>
            <label>Tags (comma-separated):</label>
            <input type="text" value={tagInputs[item.id] || ''} onChange={handleTagInputChange(item.id)} />
            <button onClick={() => handleTagAdd(item.id, tagInputs[item.id]?.split(',').map(tag => tag.trim()) || [])}>Add Tags</button>
          </div>
          {item.tags && (
            <div>
              <p>Tags:</p>
              {item.tags.map((tag, index) => (
                <span key={index}>{tag}</span>
              ))}
            </div>
          )}
          {/* 他のフィールドも同様に表示できます */}
        </div>
      ))}
    </div>
  );
};

export default DisplayTweets;
