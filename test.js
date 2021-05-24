const inquirer = require('inquirer');
const fs = require('fs');
let files = fs.readdirSync('src');
let type = '';
const TYPE_JSON_TO_CSV = 'json to csv';
const TYPE_CSV_TO_JSON = 'csv to json';

init();

function init() {
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
                console.log('ing...')
                // csvToJson();
                break;
        }
    });
}

function jsonToCsv() {
    const converter = require('json-2-csv');
    files = files.filter(file => file.indexOf('.json') != -1);
    let csvArray = [];

    // select pivot
    inquirer.prompt([{
        type: 'list',
        name: 'pivot',
        message: 'choose pivot.',
        choices: files,
    }]).then(a => {
        let jsonFile = JSON.parse(fs.readFileSync(`src/${a.pivot}`));
        files = files.filter(file => file != a.pivot);
        pivotLang = a.pivot.split('.')[0];

        for (const key in jsonFile) {
            if (typeof jsonFile[key] == 'object') {
                handle(jsonFile[key], key, pivotLang);
            } else {
                let array = { key };
                array[pivotLang] = jsonFile[key];
                csvArray.push(array);
            }
        }
    });

    // other langs
    files.forEach(file => {
        let jsonFile = JSON.parse(fs.readFileSync(`src/${file}`));
        const lang = file.split('.')[0];

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

    // convert JSON array to CSV string
    converter.json2csv(csvArray, (err, csv) => {
        if (err) {
            throw err;
        }
        fs.writeFileSync(`export/translate.csv`, csv);
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
    const CSVToJSON = require('csvtojson');
    let json = {};

    // convert csv file to JSON array
    CSVToJSON().fromFile(`${src}translate.csv`)
        .then(data => {

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

                fs.writeFileSync(`${output}${lang}.json`, JSON.stringify(json[lang]));
            }

        }).catch(err => {
            console.log(err);
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