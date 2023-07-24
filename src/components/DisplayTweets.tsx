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
  const [tagInput, setTagInput] = useState('');
  const [selectedTweetId, setSelectedTweetId] = useState<string | null>(null);

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

  useEffect(() => {
    if (selectedTweetId) {
      const db = getDatabase();
      const tweetRef = ref(db, `tweets/${selectedTweetId}/tags`);
      get(tweetRef).then((snapshot) => {
        const tagsData = snapshot.val();
        const tagsArray: string[] = tagsData ? Object.values(tagsData) : [];
        setTagInput(tagsArray.join(', '));
      });
    }
  }, [selectedTweetId]);

  const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };

  const handleTagAdd = (tweetId: string) => {
    const tags: string[] = tagInput.split(',').map(tag => tag.trim());
    const db = getDatabase();
    const tweetRef = ref(db, `tweets/${tweetId}/tags`);
    set(tweetRef, tags).then(() => {
      // タグを追加した後にデータを更新して表示する
      setData(prevData => prevData.map(item => {
        if (item.id === tweetId) {
          return { ...item, tags };
        }
        return item;
      }));
      setTagInput('');
      setSelectedTweetId(null); // タグ追加が完了したらselectedTweetIdをリセットする
    }).catch(error => {
      console.error('Error adding tags:', error);
    });
  };

  return (
    <div className="App">
      <h1>Tweets Data</h1>
      {data.map((item: TweetData) => (
        <div key={item.id}>
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
            <input type="text" value={tagInput} onChange={handleTagInputChange} />
            <button onClick={() => handleTagAdd(item.id)}>Add Tags</button>
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
