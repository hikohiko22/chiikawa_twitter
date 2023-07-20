const playwright = require('playwright');
const fs = require('fs');
const request = require('request');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        {id: 'imageUrl', title: 'IMAGEURL'},
        {id: 'text', title: 'TEXT'},
        {id: 'timestamp', title: 'TIMESTAMP'}
    ]
});

async function loginToTwitter(page, username, password) {
    await page.goto('https://twitter.com/login');
    
    await page.waitForSelector('input');
    await page.fill('input', username);
    await page.click('.css-18t94o4.css-1dbjc4n.r-sdzlij.r-1phboty.r-rs99b7.r-ywje51.r-usiww2.r-2yi16.r-1qi8awa.r-1ny4l3l.r-ymttw5.r-o7ynqc.r-6416eg.r-lrvibr.r-13qz1uu');

    await page.waitForSelector('input');
    await page.fill('input:not(:disabled)', password);
    await page.click('div[data-testid="LoginForm_Login_Button"]');
    
    
    // Ensure login was successful
    await page.waitForNavigation();
}

async function scrapeTwitter(loginUsername, loginPassword, targetUsername) {
    const browser = await playwright.chromium.launch({ headless: false }); // <-- headless mode disabled
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // login to Twitter
    await loginToTwitter(page, loginUsername, loginPassword);
    
    // then go to target user's media page
    await page.goto(`https://twitter.com/${targetUsername}/media`);

    await page.waitForSelector('article[data-testid="tweet"]');
    tweetsDOM = document.querySelectorAll('article[data-testid="tweet"]');
    console.log({tweetsDOM});
    const tweets = await page.evaluate(() =>
        Array.from(document.querySelectorAll('article[data-testid="tweet"]')).map(tweet => ({
            imageUrl: tweet.querySelector('img') ? tweet.querySelector('img').src : null,
            text: tweet.querySelector('div[data-testid="tweetText"]').innerHTML,
            timestamp: tweet.querySelector('time').dateTime
        }))
    );

    await browser.close();

    // save images and prepare csv data
    let csvData = [];
    for (let tweet of tweets) {
        if (tweet.imageUrl) {
            // download image
            let imageName = `${new Date(tweet.timestamp).toISOString()}.jpg`;
            download(tweet.imageUrl, imageName, function(){
                console.log('Image saved');
            });
        }
        
        // prepare csv data
        csvData.push({
            imageUrl: tweet.imageUrl,
            text: tweet.text,
            timestamp: tweet.timestamp
        });
    }

    // write data to csv
    csvWriter
        .writeRecords(csvData)
        .then(()=> console.log('The CSV file was written successfully'));
}

function download(uri, filename, callback){
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}

scrapeTwitter('fireshitaiyou', 'Mitchal@12', 'ngnchiikawa');
