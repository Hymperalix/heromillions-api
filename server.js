const express = require('express');
const app = express(); 

const cors = require('cors')
const csvToJson = require('convert-csv-to-json');
const StreamZip = require('node-stream-zip');
const http = require('https');
const fs = require('fs');
const moment = require('moment');

app.use(cors())

app.use(express.static('public'));

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      console.log('Download latest');
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

var csv2json = function (file) {
    let json = csvToJson.getJsonFromCsv(file);
    let array = [];

    json.forEach(j => {

        let draw = j.annee_numero_de_tirage.substring(j.annee_numero_de_tirage.length - 3);
        let week_day = j.jour_de_tirage.toLowerCase().trim();
        if (week_day === 'mardi') {
            week_day = 'Tuesday';
        } else if (week_day === 'vendredi' || week_day === 've') {
            week_day = 'Friday';
        }
        let date = j.date_de_tirage;
        if (date.indexOf('/') === -1) {
            date = moment(date, 'YYYYMMDD').format('YYYY/MM/DD');
        } else {
            date = moment(date, 'DD/MM/YYYY').format('YYYY/MM/DD');
        }
        let id = moment(date, 'YYYY/MM/DD').format('YYYY') + draw
        let numbers = [j.boule_1, j.boule_2, j.boule_3, j.boule_4, j.boule_5];
        let stars = [j.etoile_1, j.etoile_2];

        array.push({ id, draw, week_day, date, numbers, stars });
    });

    return array;
};

app.get('/results', function (req, res) {
    let output = [];
    let csv_list = ['euromillions', 'euromillions_2', 'euromillions_3', 'euromillions_4', 'euromillions_201902', 'euromillions_202002']

    download('https://media.fdj.fr/static/csv/euromillions/' + csv_list[csv_list.length - 1] + '.zip', './' + csv_list[csv_list.length - 1] + '.zip', function() {
        const zip = new StreamZip({
            file: csv_list[csv_list.length - 1] +'.zip',
            storeEntries: true
        });
  
        zip.on('ready', () => {
            zip.extract(csv_list[csv_list.length - 1] + '.csv', './' + csv_list[csv_list.length - 1]+'.csv', err => {
                console.log(err ? 'Extract error' : 'Extracted');
                zip.close(function() {
                    console.log('Converting to JSON...');
                    for (let i = 0; i < csv_list.length; i++) {
                        output = output.concat(csv2json(csv_list[i] + '.csv'));
                    }
                    console.log('length')
                    console.log(output.length)
                    res.send(output);
                });
            });
        });
    });
});
app.listen(process.env.PORT || 3000);