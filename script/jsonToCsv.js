function handle(srcJson, exportCsv, handleLang, parentKey = null) {
    for (const key in srcJson) {
        mixKey = parentKey ? `${parentKey}.${key}` : key;

        if (typeof srcJson[key] == 'object') {
            handle(srcJson[key], exportCsv, handleLang, mixKey);
        } else {
            const index = exportCsv.findIndex(item => item.key == mixKey);
            if (!exportCsv[index]) {
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
    handle,
};