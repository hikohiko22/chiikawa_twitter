const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

const csvFilePath = './script/tweets/ngnchiikawa.csv'; // CSVファイルのパス
const jsonFilePath = './script/json/ngnchiikawa.json'; // JSONファイルのパス

let jsonData = {};

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    let tweetDate = new Date(row['Tweet date']).getTime(); // Tweet dateをUNIXタイムスタンプに変換
    let key = uuidv4(); // UUIDを生成してキーとして使用
    jsonData[key] = { ...row, 'Tweet date timestamp': tweetDate };
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
