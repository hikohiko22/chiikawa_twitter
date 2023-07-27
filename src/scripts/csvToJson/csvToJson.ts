import * as fs from 'fs';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';

interface CsvData {
  'Tweet date': string;
  'Action date': string;
  'Display name': string;
  'Username': string;
  'Tweet URL': string;
  'Media type': string;
  'Media URL': string;
  'Saved filename': string;
  'Remarks': string;
  'Tweet content': string;
  'Replies': string;
  'Retweets': string;
  'Likes': string;
}

interface AdditionalData {
  'Tweet date timestamp': number;
  'Processed Media URL': string;
}

// eslint-disable-next-line prefer-const
let jsonData: { [key: string]: CsvData & AdditionalData } = {};

const csvFilePath = './src/scripts/csvToJson/tweets/ngnchiikawa.csv'; // CSVファイルのパス
const jsonFilePath = './src/scripts/csvToJson/json/ngnchiikawa.json'; // JSONファイルのパス

function removeQueryParam(url: string): string {
  const urlObj = new URL(url);
  urlObj.searchParams.delete('name');
  return urlObj.toString();
}

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => {
    const row = data as CsvData;
    const tweetDate: number = new Date(row['Tweet date']).getTime(); // Tweet dateをUNIXタイムスタンプに変換
    const statusId = row['Tweet URL'].match(/status\/(\d+)/); // Tweet URLからstatus以下の数字の羅列を抽出
    const key = statusId ? statusId[1] : uuidv4(); // 抽出したstatusIdがあればそれをキーとして使用し、なければUUIDを生成してキーとする
    const mediaURL: string = row['Media URL'] ? removeQueryParam(row['Media URL']) : '';
    jsonData[key] = {
      ...row,
      'Tweet date timestamp': tweetDate,
      'Processed Media URL': mediaURL,
    };
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
    fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 4), (err) => {
      if (err) {
        throw err;
      }
      console.log('JSON data is saved.');
    });
  });
