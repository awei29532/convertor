const inquirer = require('inquirer');
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
            require('./script/jsonToCsv').init();
            break;
        case TYPE_CSV_TO_JSON:
            require('./script/CsvToJson').init();
            break;
    }
});
