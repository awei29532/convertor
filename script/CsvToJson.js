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

module.exports = {
    generatorObj,
};