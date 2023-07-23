import React, { useEffect, useState } from 'react';
import { database, ref } from '../firebase';
import { onValue, query, orderByChild, limitToLast } from 'firebase/database';

const DisplayTweets = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const dbRef = ref(database, 'tweets');
    const q = query(dbRef, orderByChild('Tweet date timestamp'), limitToLast(100));
    const unsub = onValue(q, (snapshot) => {
      const fbData = snapshot.val();
      const newDataArray = Object.entries(fbData).map(([id, value]) => ({ id, ...value }));
      const sortedDataArray = newDataArray.sort((a, b) => b['Tweet date timestamp'] - a['Tweet date timestamp']);
      setData(sortedDataArray);
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
          <p>Tweet Date: {item['Tweet date']}</p>
          <p>Tweet Date timestamp: {item['Tweet date timestamp']}</p>
          <p>Tweet content: {item['Tweet content'].replace(/ https:\/\/t\.co\/\S*/, "")}</p>
          <p>Tweet URL: <a href={item['Tweet URL']} target="_blank" rel="noopener noreferrer">Link</a></p>
          <img src={item['Media URL']} alt="Tweet Media" />
          <p>Likes: {item.Likes}</p>
          {/* 他のフィールドも同様に表示できます */}
        </div>
      ))}
    </div>
  );
};

export default DisplayTweets;
