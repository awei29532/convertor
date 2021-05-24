const fs = require('fs');
const params = require('minimist')(process.argv.slice(2));

// type
const type = params['type'];
const TYPE_JSON_TO_CSV = 'json-to-csv';
const TYPE_CSV_TO_JSON = 'csv-to-json';

// json to csv
const pivot = params['pivot'];
const langs = params['langs'] || '';

// url
const src = params['src'] ? `${params['src']}/` : '';
const output = params['output'] ? `${params['output']}/` : '';

switch (type) {
    case TYPE_CSV_TO_JSON:
        csvToJson();
        break;
    case TYPE_JSON_TO_CSV:
        if (!pivot) {
            console.log('param "pivot" is required.');
            return;
        }

        if (!langs) {
            console.log('param "langs" is required.');
            return;
        }
        jsonToCsv();
        break;
    default:
        console.log('illegal type string.')
        break;
}

function jsonToCsv() {
    const converter = require('json-2-csv');
    let csvArray = [];

    // pivot
    let jsonFile = JSON.parse(fs.readFileSync(src + `/${pivot}.json`));

    for (const key in jsonFile) {
        if (typeof jsonFile[key] == 'object') {
            handle(jsonFile[key], key)
        } else {
            let array = { key };
            array[pivot] = jsonFile[key];
            csvArray.push(array);
        }
    }

    // other langs
    fs.readdir(src, (err, files) => {
        files.forEach(file => {
            const lang = file.split('.')[0];
            if (lang == pivot || langs.indexOf(lang) == -1) {
                return;
            }

            jsonFile = JSON.parse(fs.readFileSync(`${src}/${file}`));
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
            fs.writeFileSync(`${output}translate.csv`, csv);
        });
    });

    function handle(obj, parentKey, lang = pivot) {
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