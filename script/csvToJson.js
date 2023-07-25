const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

const csvFilePath = './script/tweets/ngnchiikawa.csv'; // CSVファイルのパス
const jsonFilePath = './script/json/ngnchiikawa.json'; // JSONファイルのパス

function removeQueryParam(url) {
  const urlObj = new URL(url);
  urlObj.searchParams.delete('name');
  return urlObj.toString();
}

let jsonData = {};

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    let tweetDate = new Date(row['Tweet date']).getTime(); // Tweet dateをUNIXタイムスタンプに変換
    const statusId = row['Tweet URL'].match(/status\/(\d+)/); // Tweet URLからstatus以下の数字の羅列を抽出
    const key = statusId ? statusId[1] : uuidv4(); // 抽出したstatusIdがあればそれをキーとして使用し、なければUUIDを生成してキーとする
    const mediaURL = row['Media URL'] ? removeQueryParam(row['Media URL']) : '';
    jsonData[key] = { ...row, 'Tweet date timestamp': tweetDate, 'Media URL': mediaURL };
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
