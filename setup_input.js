const fs = require('fs');
const util = require('util');
const got = require('got');

const BASE_REQUEST = `https://api-tokyochallenge.odpt.org/api/v4/odpt:Railway?acl:consumerKey=${process.env.CONSUMER_KEY}`;

async function loadWikipediaPage() {
  const { body } = await got('https://en.wikipedia.org/wiki/List_of_railway_companies_in_Japan');
  return util.promisify(fs.writeFile)('./input/List_of_railway_companies_in_Japan.html', body);
}

async function loadOpenDataRailway() {
  // The first request might cap the number of results, so first try to get all operators and then the lines
  const { body } = await got(BASE_REQUEST);
  const json = JSON.parse(body);
  const operators = json.map((item) => item['odpt:operator']);
  const unique = [...new Set(operators)].sort();
  const pages = await Promise.all(unique.map((op) => got(`${BASE_REQUEST}&odpt:operator=${op}`)));
  const data = [];
  pages.forEach(({ body }) => {
    const json = JSON.parse(body);
    data.push(...json);
  });
  return util.promisify(fs.writeFile)('./input/odpt_Railway.json', JSON.stringify(data));
}

async function generate() {
  await Promise.all([
    loadWikipediaPage(),
    loadOpenDataRailway(),
  ]);
}

if (require.main === module) {
  generate();
}
