import React, { useEffect, useState } from 'react';
import { database, ref } from '../firebase';
import { onValue, off } from 'firebase/database';

const TagList = ({ tweetId }) => {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const tagsRef = ref(database, `tags/${tweetId}`);

    const handleData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tagsArray = Object.values(data);
        setTags(tagsArray);
      }
    };

    const unsubscribe = onValue(tagsRef, handleData);

    return () => {
      off(tagsRef, 'value', unsubscribe);
    };
  }, [tweetId]);

  return (
    <div>
      {tags.map((tag, index) => (
        <span key={index}>{tag}{index !== tags.length - 1 ? ', ' : ''}</span>
      ))}
    </div>
  );
};

export default TagList;
