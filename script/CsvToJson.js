const converter = require('json-2-csv');
const fs = require('fs');
let files = fs.readdirSync('resource');

async function init() {
    let json = {};
    let csvFile = files.filter(file => file.indexOf('.csv') != -1);
    if (!csvFile.length) {
        console.log('file translate.csv is not exists!');
        return;
    }
    csvFile = fs.readFileSync(`resource/${csvFile}`, 'utf-8');
    await handle(csvFile, json);

    for (const lang in json) {
        fs.writeFileSync(`export/${lang}.json`, JSON.stringify(json[lang]));
    }
    console.log('Convert complete.');
}

async function handle(csvString, exportJson) {
    const csvArray = await converter.csv2jsonAsync(csvString);

    if (!csvArray[0].key) {
        console.log('Wrong format!');
        return;
    }

    for (const lang in csvArray[0]) {
        if (lang == 'key') {
            continue;
        }
        exportJson[lang] = {};

        for (const item of csvArray) {
            generatorObj(exportJson, item.key, lang, item[lang]);
        }
    }
}

function generatorObj(exportJson, keypath, lang, value) {
    const keyArray = keypath.split('.');
    const length = keyArray.length;
    create(exportJson[lang], keyArray[0], 0);

    function create(obj, key, index) {
        if (index >= length - 1) {
            obj[key] = value;
            return;
        }

        if (typeof obj[key] === 'undefined') {
            obj[key] = {};
        }

        index++;
        create(obj[key], keyArray[index], index);
    }
}

module.exports = {
    init,
};