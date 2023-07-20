import React, { useState } from 'react';
import { database, ref } from '../firebase';
import { push, set, orderByValue, get } from 'firebase/database';

const TagForm = ({ tweetId }) => {
  const [tag, setTag] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // タグが存在するかどうかを確認し、存在しない場合は新しいタグを作成
    const tagId = await getOrCreateTag(tag);
    
    const db = database();
    const newTweetTagRef = ref(db, `tweet_tags/${tweetId}`);
    set(newTweetTagRef, tagId);
  
    setTag('');
  };

  const handleChange = (event) => {
    setTag(event.target.value);
  };

  const getOrCreateTag = async (tagName) => {
    const db = database();
    const tagsRef = ref(db, 'tags');
  
    // タグが存在するか確認
    const existingTag = await getTagsByName(tagName);
  
    if (existingTag) {
      return existingTag.key;
    }
  
    // タグが存在しない場合、新しいタグを作成
    const newTagRef = push(tagsRef);
    set(newTagRef, tagName);
    return newTagRef.key;
  };

  const getTagsByName = async (tagName) => {
    const db = database();
    const tagsRef = ref(db, 'tags');
    const query = orderByValue().equalTo(tagName);
  
    const snapshot = await get(query(tagsRef));
    return snapshot.exists() ? Object.entries(snapshot.val())[0] : null;
  };  

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={tag}
        onChange={handleChange}
        placeholder="Add a tag"
      />
      <button type="submit">Add</button>
    </form>
  );
};

export default TagForm;
