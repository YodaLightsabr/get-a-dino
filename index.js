const github = require('download-git-repo');
const express = require('express');
const fs = require('fs');

function download () {
    return new Promise((resolve, reject) => {
        github('hackclub/dinosaurs', 'dinos', err => {
            if (err) return reject(err);
            const files = fs.readdirSync(__dirname + '/dinos').filter(file => file.endsWith('.png')).map(file => 'dinos/' + file);
            fs.writeFileSync(__dirname + '/dinos.json', JSON.stringify(files, null, 4), 'utf8');
            resolve(files);
        });
    });
}

function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

let dinos = [];
const app = express();

app.get('/', (req, res) => {
    res.send('Get a dino API. Use /dino or /dino.png to get a dino.');
});

app.get('/dino', (req, res) => {
    res.sendFile(__dirname + '/' + dinos[random(0, dinos.length - 1)]);
});

app.get('/dino.png', (req, res) => {
    res.sendFile(__dirname + '/' + dinos[random(0, dinos.length - 1)]);
});

download().then(downloaded => {
    dinos = downloaded;
    app.listen(3000, _ => {
        console.log('Ready! (:3000)');
    });
});