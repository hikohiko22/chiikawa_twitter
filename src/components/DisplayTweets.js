// DisplayTweets.js
import React, { useEffect, useState } from 'react';
import { database, ref } from '../firebase';
import { onValue, query, limitToFirst } from 'firebase/database';

const DisplayTweets = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const dbRef = ref(database, 'tweets');
    const q = query(dbRef, limitToFirst(100));
    const unsub = onValue(q, (snapshot) => {
      const fbData = snapshot.val();
      const newDataArray = Object.entries(fbData).map(([id, value]) => ({id, ...value}));
      setData(newDataArray);
    });

    // Clean-up function
    return () => {
      unsub();
    };
  }, []);

  return (
    <div className="App">
      <h1>Tweets Data</h1>
      {data.map(item => (
        <div key={item.id}>
          <h2>Tweet ID: {item.id}</h2>
          <p>Display name: {item['Display name']}</p>
          <p>Tweet content: {item['Tweet content']}</p>
          <p>Tweet URL: <a href={item['Tweet URL']} target="_blank" rel="noopener noreferrer">Link</a></p>
          <p>Likes: {item.Likes}</p>
          {/* 他のフィールドも同様に表示できます */}
        </div>
      ))}
    </div>
  );
};

export default DisplayTweets;
