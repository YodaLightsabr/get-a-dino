const crypto = require('crypto');
const github = require('download-git-repo');
const express = require('express');
const fs = require('fs');

const home = `Welcome to Get-A-Dino! This website pulls dinosaurs from https://github.com/hackclub/dinosaurs.

GET /dinos - Get the ID and URL to a random dino
GET /dinos/all - Get all dinos
GET /dinos/:id - Serve a dino by its id
GET /info/:id - Get the info of a dino
GET /random - Redirect to a random dino
GET /dino.png - Serve a random dino as a raw PNG`;

function download () {
    return new Promise((resolve, reject) => {
        github('hackclub/dinosaurs', 'dinos', err => {
            if (err) return reject(err);

            const files = fs.readdirSync(__dirname + '/dinos').filter(file => file.endsWith('.png')).map(file => 'dinos/' + file);

            const dictionary = {};
            files.forEach(file => {
                dictionary[crypto.createHash('md5').update(file).digest('hex').substring(0, 10)] = file; // Really bad method of generating IDs but at least it is unlikely for duplicates and will be the same each time a dinos.json is generated
            });

            fs.writeFileSync(__dirname + '/dinos.json', JSON.stringify(dictionary, null, 4), 'utf8');

            resolve(dictionary);
        });
    });
}

function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

let dinos = [];
const app = express();

app.get('/', (req, res) => {
    res.type('text/plain');
    res.send(home);
});

app.get('/dino.png', (req, res) => {
    res.sendFile(__dirname + '/' + Object.values(dinos)[random(0, Object.values(dinos).length - 1)]);
});

app.get('/dinos', (req, res) => {
    const id = Object.keys(dinos)[random(0, Object.keys(dinos).length - 1)];
    const name = dinos[id].substring(6, dinos[id].length - 4);
    const url = 'https://geta.dino.icu/dinos/' + id;
    const info = 'https://geta.dino.icu/info/' + id;
    const github = 'https://github.com/hackclub/dinosaurs/blob/main/' + name + '.png';
    
    res.json({
        id, name, url, info, github
    });
});

app.get('/dinos/all', (req, res) => {
    let output = [];
    for (const id in dinos) {
        const name = dinos[id].substring(6, dinos[id].length - 4);
        const url = 'https://geta.dino.icu/dinos/' + id;
        const info = 'https://geta.dino.icu/info/' + id;
        const github = 'https://github.com/hackclub/dinosaurs/blob/main/' + name + '.png';
        
        output.push({
            id, name, url, info, github
        });
    }
    res.json(output);
});

app.get('/dinos/dictionary', (req, res) => {
    res.json(dinos);
});

app.get('/random', (req, res) => {
    const id = Object.keys(dinos)[random(0, Object.keys(dinos).length - 1)];
    const url = 'https://geta.dino.icu/dinos/' + id;
    
    res.redirect(url);
});

app.get('/dinos/:id', ({ params: { id } }, res) => {
    if (!fs.existsSync(__dirname + '/' + dinos[id])) return res.json({ error: 'Dino not found' });
    res.sendFile(__dirname + '/' + dinos[id]);
});

app.get('/info/:id', ({ params: { id } }, res) => {
    if (!fs.existsSync(__dirname + '/' + dinos[id])) return res.json({ error: 'Dino not found' });
    const name = dinos[id].substring(6, dinos[id].length - 4);
    const url = 'https://geta.dino.icu/dinos/' + id;
    const info = 'https://geta.dino.icu/info/' + id;
    const github = 'https://github.com/hackclub/dinosaurs/blob/main/' + name + '.png';

    res.json({
        id, name, url, info, github
    });
});

download().then(downloaded => {
    dinos = downloaded;
    app.listen(3000, _ => {
        console.log('Ready! (:3000)');
    });
});