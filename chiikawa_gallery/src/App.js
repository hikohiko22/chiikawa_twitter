import React from 'react';
import EmbeddedTweet from './components/EmbeddedTweet';
import TagForm from './components/TagForm';
import TagList from './components/TagList';

const App = () => {
  const tweetId = '1645025423162744832';

  return (
    <div>
      <h1>画像ギャラリー</h1>
      <EmbeddedTweet tweetId={tweetId} />
      <TagForm tweetId={tweetId} />
      <TagList tweetId={tweetId} />
    </div>
  );
};

export default App;