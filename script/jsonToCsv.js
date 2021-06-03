const inquirer = require('inquirer');
const converter = require('json-2-csv');
const fs = require('fs');
const path = require('path');
let files = fs.readdirSync('resource');

async function init() {
    files = files.filter(file => file.indexOf('.json') != -1);
    if (!files.length) {
        console.log('There is no json file.');
        return;
    }
    let csvArray = [];

    // select pivot
    const pivotAns = await inquirer.prompt([{
        type: 'list',
        name: 'pivot',
        message: 'choose pivot.',
        choices: files,
    }]);

    let jsonFile = JSON.parse(fs.readFileSync(`resource/${pivotAns.pivot}`));
    files = files.filter(file => file != pivotAns.pivot);
    const pivotLang = path.basename(`resource/${pivotAns.pivot}`, '.json');

    handle(jsonFile, csvArray, pivotLang, null, true);

    // choose other langs
    const langAns = await inquirer.prompt([{
        type: 'checkbox',
        name: 'files',
        message: 'Choose the files you want to transform.',
        choices: files
    }]);
    files = langAns.files;

    files.forEach(file => {
        let jsonFile = JSON.parse(fs.readFileSync(`resource/${file}`));
        const lang = path.basename(`resource/${file}`, '.json');

        handle(jsonFile, csvArray, lang);

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

function handle(srcJson, exportCsv, handleLang, parentKey = null, pivotMode = false) {
    for (const key in srcJson) {
        mixKey = parentKey ? `${parentKey}.${key}` : key;

        if (typeof srcJson[key] == 'object') {
            handle(srcJson[key], exportCsv, handleLang, mixKey, pivotMode);
        } else {
            const index = exportCsv.findIndex(item => item.key == mixKey);
            if (!exportCsv[index] && !pivotMode) {
                continue;
            } else if (!exportCsv[index]) {
                let obj = { key: mixKey };
                obj[handleLang] = srcJson[key];
                exportCsv.push(obj);
            } else {
                exportCsv[index][handleLang] = srcJson[key];
            }
        }
    }
}

module.exports = {
    init,
};