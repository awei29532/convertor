const inquirer = require('inquirer');
const converter = require('json-2-csv');
const fs = require('fs');
const path = require('path');

let files = fs.readdirSync('src');
const TYPE_JSON_TO_CSV = 'json to csv';
const TYPE_CSV_TO_JSON = 'csv to json';

inquirer.prompt([
    {
        type: 'list',
        name: 'type',
        message: 'choose a type.',
        choices: [TYPE_JSON_TO_CSV, TYPE_CSV_TO_JSON],
    }
]).then(answers => {
    switch (answers.type) {
        case TYPE_JSON_TO_CSV:
            jsonToCsv();
            break;
        case TYPE_CSV_TO_JSON:
            csvToJson();
            break;
    }
});

async function jsonToCsv() {
    files = files.filter(file => file.indexOf('.json') != -1);
    if (!files.length) {
        console.log('There is no json file.');
        return;
    }
    const jsonToCsv = require('./jsonToCsv');
    let csvArray = [];

    // select pivot
    const pivotAns = await inquirer.prompt([{
        type: 'list',
        name: 'pivot',
        message: 'choose pivot.',
        choices: files,
    }]);

    let jsonFile = JSON.parse(fs.readFileSync(`src/${pivotAns.pivot}`));
    files = files.filter(file => file != pivotAns.pivot);
    const pivotLang = path.basename(`src/${pivotAns.pivot}`, '.json');

    jsonToCsv.handle(jsonFile, csvArray, pivotLang);

    // choose other langs
    const langAns = await inquirer.prompt([{
        type: 'checkbox',
        name: 'files',
        message: 'Choose the files you want to transform.',
        choices: files
    }]);
    files = langAns.files;

    files.forEach(file => {
        let jsonFile = JSON.parse(fs.readFileSync(`src/${file}`));
        const lang = path.basename(`src/${file}`, '.json');

        jsonToCsv.handle(jsonFile, csvArray, lang);

        // 缺少的key補上空字串
        csvArray.filter(o => !o[lang]).forEach(item => {
            item[lang] = '';
        });
    });

    // convert json to csv
    converter.json2csv(csvArray, (err, csv) => {
        if (err) {
            throw err;
        }
        fs.writeFileSync(`export/translate.csv`, csv);
        console.log('Convert complete.');
    });
}

async function csvToJson() {
    const csvToJson = require('./CsvToJson');
    let json = {};
    let csvFile = files.filter(file => file.indexOf('.csv') != -1);
    if (!csvFile.length) {
        console.log('file translate.csv is not exists!');
        return;
    }
    csvFile = fs.readFileSync(`src/${csvFile}`, 'utf-8');
    await csvToJson.handle(csvFile, json);

    for (const lang in json) {
        fs.writeFileSync(`export/${lang}.json`, JSON.stringify(json[lang]));
    }
    console.log('Convert complete.');
}
