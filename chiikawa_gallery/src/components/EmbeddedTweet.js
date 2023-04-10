import React from 'react';

const EmbeddedTweet = ({ tweetId }) => {
  const src = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&embed_source=clientlib`;

  return (
    <div>
      <iframe
        title={`Tweet-${tweetId}`}
        src={src}
        width="550"
        height="250"
        frameBorder="0"
        allowTransparency="true"
        scrolling="auto"
        style={{ border: 'none', overflow: 'hidden' }}
      ></iframe>
    </div>
  );
};

export default EmbeddedTweet;
