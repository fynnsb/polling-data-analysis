const axios = require('axios');
const fs = require('fs');
const prettier = require('prettier');
const PollingDataLib = require('./PollingDataLib.js');

const apiUrl = 'https://api.dawum.de/';
const outputFile = 'data.json';

(async () => {
var data = {};

await axios.get(apiUrl)
    .then(async response => {
        fs.writeFileSync(outputFile, JSON.stringify(response.data));
        console.log('JSON file downloaded and saved successfully.');

        data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
        const formattedData = await prettier.format(JSON.stringify(data), { parser: 'json' });

        fs.promises.writeFile(outputFile, formattedData); // Save the formatted data back to the file
        console.log('Formatted data saved successfully.');
    })
    .catch(error => {
        console.error('Error downloading JSON file:', error);
    });


    Object.keys(data.Surveys).forEach(function(key) {
        if(data.Parliaments[data.Surveys[key].Parliament_ID].Surveys == undefined) {
            data.Parliaments[data.Surveys[key].Parliament_ID].Surveys = [];
        }

        data.Parliaments[data.Surveys[key].Parliament_ID].Surveys.push(data.Surveys[key]);
    });

    Object.keys(data.Parliaments).forEach(function(key) {
        console.log(data.Parliaments[key].Name);
        var pollingData = PollingDataLib.currentPolling(data, key);
        for(var i = 0; i < pollingData.length; i++) {
            console.log(data.Parliaments[key].Name + " - " + pollingData[i].name + ': ' + pollingData[i].value);
        }
    });

})();