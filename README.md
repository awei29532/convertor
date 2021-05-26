### Descreption
Vue、Angular i18n 語系 json 檔案轉換成 csv 檔案，或反向轉換。

### Install
`npm i ` 安裝相依套件。

### Use
1. 將要轉換的 json 檔或 csv 檔放在`resource`資料夾。
1. `npm run convertor` 開始執行。
1. 按照cmd畫面上選擇要執行的動作，`json to csv` 或 `csv to json`。

* json to csv
    1. `choose pivot.` 選擇要當基底的語系檔。
    1. `Choose the files you want to transform.` 選擇要轉換的語系。
* csv to json
    * csv檔案內容格式須符合以下圖示

    |key|zh-Hant|en|
    | ------------ | ------------ | ------------ |
    |index|首頁|home page|
    |login.button|登入|login|


### Export
轉換完成的檔案會輸出到`export`資料夾。

### Notice
* 如執行`json to csv`，json 檔名需為語系名稱，如:`zh-Hant.json`、`en.json`。
* 如執行`csv to json`，csv 檔名需為`translate.csv`。
