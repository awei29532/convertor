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
    let csvArray = [];
    files = files.filter(file => file.indexOf('.json') != -1);
    if (!files.length) {
        console.log('There is no json file.');
        return;
    }

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

    for (const key in jsonFile) {
        if (typeof jsonFile[key] == 'object') {
            handle(jsonFile[key], key, pivotLang);
        } else {
            let array = { key };
            array[pivotLang] = jsonFile[key];
            csvArray.push(array);
        }
    }

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

        for (const key in jsonFile) {
            if (typeof jsonFile[key] == 'object') {
                fillInOtherLang(jsonFile[key], key, lang);
            } else {
                const index = csvArray.findIndex(item => item.key == key);
                csvArray[index][lang] = jsonFile[key];
            }
        }

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
        console.log('complete.');
    });

    function handle(obj, parentKey, lang) {
        for (const key in obj) {
            if (typeof obj[key] == 'object') {
                handle(obj[key], `${parentKey}.${key}`, lang);
            } else {
                let arr = { key: `${parentKey}.${key}` };
                arr[lang] = obj[key];
                csvArray.push(arr);
            }
        }
    }

    function fillInOtherLang(obj, parentKey, lang) {
        for (const key in obj) {
            if (typeof obj[key] == 'object') {
                fillInOtherLang(obj[key], `${parentKey}.${key}`, lang);
            } else {
                const index = csvArray.findIndex(item => item.key == `${parentKey}.${key}`);
                csvArray[index][lang] = obj[key];
            }
        }
    }
}

function csvToJson() {
    let json = {};
    let csvFile = files.filter(file => file.indexOf('.csv') != -1);
    if (!csvFile.length) {
        console.log('file translate.csv is not exists.');
        return;
    }
    csvFile = fs.readFileSync(`src/${csvFile}`, 'utf-8');

    // convert csv to json
    converter.csv2json(csvFile, (err, data) => {
        if (err) {
            throw err;
        }

        // lang
        for (const lang in data[0]) {
            if (lang == 'key') {
                continue;
            }
            json[lang] = {};

            // handle
            for (const item of data) {
                generatorObj(item.key, lang, item[lang])
            }

            fs.writeFileSync(`export/${lang}.json`, JSON.stringify(json[lang]));
        }
        console.log('complete.');
    });

    function generatorObj(keypath, lang, value) {
        const keyArray = keypath.split('.');
        const length = keyArray.length;
        create(json[lang], keyArray[0], 0);

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
}
