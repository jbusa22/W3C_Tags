const cheerio = require("cheerio");
const request = require("request-promise");
const puppeteer = require('puppeteer');
let mysql  = require('promise-mysql');
var config = {
    host    : 'localhost',
    user    : 'root',
    password: '',
    database: 'w3c'
  };
  const url = 'https://app.bigcontacts.com/#/reports/search';
  const processSQL = async () =>
  {
    const browser = await puppeteer.launch({headless : false});
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 900
    });
    await page.goto(url, {"waitUntil" : "networkidle0"});
    var connection = await mysql.createConnection(config);
    let username = await page.evaluate((user) => {
        document.querySelector('#username').value = '';
        document.querySelector('#username').value = user;
        return "good";
    }, "jbusa@w3.org");
    let password = await page.evaluate((pass) => {
        document.querySelector('#password').value = '';
        document.querySelector('#password').value = pass;
        return "good";
    }, "w3cisthebest!");
    await page.click(".cc-allow");
    await page.click("#app > div > div > div.m-b-lg > form > input");
    await page.waitForSelector('#contact_name_nav', {
        visible: true,
      });
    await page.waitFor(1000);
    await page.waitForFunction(() => document.querySelector('.spinner').style.display === "none");
    await page.goto(url, {"waitUntil" : "networkidle0"});
    await page.waitFor(1000);
    await page.waitForFunction(() => document.querySelector('.spinner').style.display === "none");
    
    const numtags = await page.$$('ul > li > .checkbox.m-l-n-md > .i-checks');
    await page.click(".include-field-checkbox[data-label = 'Tags']");
    for(let i = 0; i < (numtags.length / 2); i++)
    {
        await page.waitFor(2000);
        await page.click("#reports-table-primary > div > div.search-fields > div:nth-child(16) > div.col-sm-6.field-row.active-field-row > div:nth-child(4) > div > button");
        const tags = await page.$$('ul > li > .checkbox.m-l-n-md > .i-checks');
        await tags[i].click();
        if(i > 0)
        {
            await tags[i-1].click();
        }
        await page.click("#tab_advanced_search > div > div.row.m-b-md > div.col-sm-4.text-right.text-left-xs > div > a.btn.btn-primary");
        await page.waitForFunction(() => document.querySelector('.spinner').style.display === "none");
        let searchResults = await page.$('.advanced-search-result-summary');
        let tag = tags[i];
        let tagname = await page.evaluate(tag => tag.textContent, tag);
        let uses = await page.evaluate(searchResults => searchResults.textContent, searchResults);
        uses = uses.match(/\d+/)[0];
        if(await checkUnique(tagname, connection))
        {
            let sql = `INSERT INTO tagdata(tag, uses)
            VALUES(?,?)`;
            let sqlValues = [tagname, uses];
            let res1 = await connection.query(sql, sqlValues);
        }
    }
}
processSQL();

async function checkUnique(tag, connection) {
    let selectFalse = "SELECT id FROM tagdata WHERE tag = '"+ tag +"'";
    let dupe = await connection.query(selectFalse);
    return dupe.length === 0;
 }