const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

const csvFilePath = './script/tweets/ngnchiikawa/allTweets.csv'; // CSVファイルのパス
const jsonFilePath = './script/json/ngnchiikawa.json'; // JSONファイルのパス

let jsonData = {};

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    let key = uuidv4();
    jsonData[key] = row;
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
    fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 4), (err) => {
      if (err) {
        throw err;
      }
      console.log("JSON data is saved.");
    });
  });