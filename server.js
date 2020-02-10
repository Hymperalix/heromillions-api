var express = require('express');
var app = express(); 

var cors = require('cors')
let csvToJson = require('convert-csv-to-json');
const StreamZip = require('node-stream-zip');
var http = require('https');
var fs = require('fs');

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

app.get('/results', function (req, res) {
  let output = [];

  download('https://www.fdj.fr/generated/game/euromillions/euromillions_4.zip', './euromillions_4.zip', function() {
    const zip = new StreamZip({
      file: 'euromillions_4.zip',
      storeEntries: true
    });
  
    zip.on('ready', () => {
      zip.extract('euromillions_4.csv', './euromillions_4.csv', err => {
        console.log(err ? 'Extract error' : 'Extracted');
        zip.close(function() {
          console.log('Converting to JSON...');

          let json = csvToJson.getJsonFromCsv("euromillions_4.csv");
          let j = [];
          for (let i=0; i<(json.length); i++) {
            j[i] = {};
          }
          for(let i=(json.length-1); i>=0; i--){

            if (json[i].jour_de_tirage === 'MARDI   ') {
              j[i].day = 'Tuesday';
            }
            else if (json[i].jour_de_tirage === 'VENDREDI' || json[i].jour_de_tirage === 'VE') {
              j[i].day = 'Friday';
            }
            j[i].date = json[i].date_de_tirage;
            j[i].ball_1 = json[i].boule_1;
            j[i].ball_2 = json[i].boule_2;
            j[i].ball_3 = json[i].boule_3;
            j[i].ball_4 = json[i].boule_4;
            j[i].ball_5 = json[i].boule_5;
            j[i].star_1 = json[i].etoile_1;
            j[i].star_2 = json[i].etoile_2;
            j[i].draw = (json[i].annee_numero_de_tirage).substr(4);

            output.push(j[i]);
          }

          json = csvToJson.getJsonFromCsv("euromillions_3.csv");
          j = [];
          for (let i=0; i<(json.length); i++) {
            j[i] = {};
          }
          for(let i=(json.length-1); i>=0; i--){
            if (json[i].jour_de_tirage === 'MARDI   ') {
              j[i].day = 'Tuesday';
            }
            else if (json[i].jour_de_tirage === 'VENDREDI' || json[i].jour_de_tirage === 'VE') {
              j[i].day = 'Friday';
            }
            j[i].date = json[i].date_de_tirage;
            j[i].ball_1 = json[i].boule_1;
            j[i].ball_2 = json[i].boule_2;
            j[i].ball_3 = json[i].boule_3;
            j[i].ball_4 = json[i].boule_4;
            j[i].ball_5 = json[i].boule_5;
            j[i].star_1 = json[i].etoile_1;
            j[i].star_2 = json[i].etoile_2;
            j[i].draw = (json[i].annee_numero_de_tirage).substr(4);

            output.push(j[i]);
          }

          json = csvToJson.getJsonFromCsv("euromillions_2.csv");
          j = [];
          for (let i=0; i<(json.length); i++) {
            j[i] = {};
          }
          for(let i=(json.length-1); i>=0; i--){
            if (json[i].jour_de_tirage === 'MARDI   ') {
              j[i].day = 'Tuesday';
            }
            else if (json[i].jour_de_tirage === 'VENDREDI' || json[i].jour_de_tirage === 'VE') {
              j[i].day = 'Friday';
            }
            j[i].date = json[i].date_de_tirage;
            j[i].ball_1 = json[i].boule_1;
            j[i].ball_2 = json[i].boule_2;
            j[i].ball_3 = json[i].boule_3;
            j[i].ball_4 = json[i].boule_4;
            j[i].ball_5 = json[i].boule_5;
            j[i].star_1 = json[i].etoile_1;
            j[i].star_2 = json[i].etoile_2;
            j[i].draw = (json[i].annee_numero_de_tirage).substr(4);

            output.push(j[i]);
          }

          json = csvToJson.getJsonFromCsv("euromillions.csv");
          j = [];
          for (let i=0; i<(json.length); i++) {
            j[i] = {};
          }
          for(let i=(json.length-1); i>=0; i--){
            if (json[i].jour_de_tirage === 'MARDI   ') {
              j[i].day = 'Tuesday';
            }
            else if (json[i].jour_de_tirage === 'VENDREDI' || json[i].jour_de_tirage === 'VE') {
              j[i].day = 'Friday';
            }
            j[i].date = json[i].date_de_tirage;
            j[i].ball_1 = json[i].boule_1;
            j[i].ball_2 = json[i].boule_2;
            j[i].ball_3 = json[i].boule_3;
            j[i].ball_4 = json[i].boule_4;
            j[i].ball_5 = json[i].boule_5;
            j[i].star_1 = json[i].etoile_1;
            j[i].star_2 = json[i].etoile_2;
            j[i].draw = (json[i].annee_numero_de_tirage).substr(4);

            output.push(j[i]);
          }

          res.send(output)
        });
      });
    });
  });
});

app.listen(process.env.PORT || 3000);