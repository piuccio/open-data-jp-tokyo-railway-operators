const fs = require('fs');
const util = require('util');
const convert = require('html-to-json-data');
const csv = require('csv-parse');
const { group, text } = require('html-to-json-data/definitions');
const openData = require('./input/odpt_Railway.json');

const OPERATOR_PREFIX = 'odpt.Operator:'.length;
const RAILWAY_PREFIX = 'odpt.Railway:'.length;

async function readCsv(filePath, transform = (x) => x) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath).pipe(csv({ columns: true }, (err, data) => {
      if (err) reject(err);
      else resolve(transform(data));
    }));
  });
}

async function railwayDataFromWikipedia() {
  const readFile = util.promisify(fs.readFile);
  return readFile('./input/List_of_railway_companies_in_Japan.html').then((data) => {
    const list = convert(data, group('li', {
      en: text('a'),
      rest: text(':self'),
    }));
    return list.map((item) => ({
      en: item.en,
      search: item.rest.replace(/ū/g, 'u').replace(/ō/g, 'o').replace(/[ -]/g, '').toLowerCase(),
      ja: item.rest.substring(item.en.length).trim().replace(/^[^\u3041-\uFF9F]+/, '').replace(/\)\)$/, ')'),
    }));
  });
}

async function generate() {
  const wikipedia = await railwayDataFromWikipedia();
  const manual = await readCsv('./input/manual_additions.csv');
  const operators = {};

  openData.forEach((data) => {
    const operatorName = data['odpt:operator'].substring(OPERATOR_PREFIX);
    if (!operators[operatorName]) {
      const details = wikipedia.find((item) => item.search.includes(operatorName.toLowerCase().replace('-', '')));
      if (!details) console.log(`Missing data for ${operatorName}`);
      operators[operatorName] = {
        code: operatorName,
        name_kanji: details.ja,
        name_romaji: details.en,
        railways: [],
      };
    }

    const railwayTitle = data['odpt:railwayTitle'];
    const lineCode = data['owl:sameAs'].substring(RAILWAY_PREFIX);
    operators[operatorName].railways.push({
      code: lineCode,
      name_kanji: railwayTitle.ja,
      name_romaji: railwayTitle.en,
    });
  });

  manual.forEach((line) => {
    if (!operators[line.operator_code]) {
      operators[line.operator_code] = {
        code: line.operator_code,
        name_kanji: line.operator_name,
        name_romaji: line.operator_name_en,
        railways: [],
      }
    }
    operators[line.operator_code].railways.push({
      code: line.railway_code,
      name_kanji: line.railway_name,
      name_romaji: line.railway_name_en,
    });
  });

  return util.promisify(fs.writeFile)('./operators.json', JSON.stringify(Object.values(operators), null, '  '));
}

if (require.main === module) {
  generate();
}
