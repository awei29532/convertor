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

module.exports = {
    handle,
    fillInOtherLang,
};