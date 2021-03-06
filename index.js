import crypto from 'crypto'
import github from 'download-git-repo'
import express from 'express'
import fetch from 'node-fetch'
import fs from 'fs'

const home = `
[!!!] Warning: Geta.Dino.Icu is temporarily under maintenance. [!!!]

Welcome to Get-A-Dino! This website pulls dinosaurs from https://github.com/hackclub/dinosaurs.

GET /dinos - Get the ID and URL to a random dino
GET /dinos/all - Get all dinos
GET /dinos/:id - Serve a dino by its id
GET /info/:id - Get the info of a dino
GET /random - Redirect to a random dino
GET /dino.png - Serve a random dino as a raw PNG`;

async function getByFileName (name, res) {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/hackclub/dinosaurs/main/${name}`);
        response.headers.forEach((v, n) => res.setHeader(n, v));
        response.body.pipe(res);
    } catch (err) {
        console.error(err);
    }
}

async function json (...args) {
    const response = await fetch(...args);
    return await response.json();
}

function download () {
    return new Promise(async (resolve, reject) => {
        const fileTree = await json('https://api.github.com/repos/hackclub/dinosaurs/git/trees/main?recursive=1');
        const files = fileTree.tree.map(file => file.path).filter(file => {
            let isPng = file.endsWith('.png');
            return isPng;
        });
        const dictionary = {};
        files.forEach(file => {
            dictionary[crypto.createHash('md5').update('dinos/' + file).digest('hex').substring(0, 10)] = file; // Really bad method of generating IDs but at least it is unlikely for duplicates and will be the same each time a dinos.json is generated
        });
        resolve(dictionary);
    });
}

function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

let dinos = [];
const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.type('text/plain');
    res.send(home);
});

app.get('/dino.png', (req, res) => {
    getByFileName(Object.values(dinos)[random(0, Object.values(dinos).length - 1)], res);
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

app.get('/dinos/all/images', (req, res) => {
    let output = [];
    for (const id in dinos) {
        const url = 'https://geta.dino.icu/dinos/' + id;
        output.push(url);
    }
    res.json(output);
});

app.get('/dinos/all/object', (req, res) => {
    res.json(dinos);
});

app.get('/random', (req, res) => {
    const id = Object.keys(dinos)[random(0, Object.keys(dinos).length - 1)];
    const url = 'https://geta.dino.icu/dinos/' + id;
    
    res.redirect(url);
});

app.get('/dinos/:id', ({ params: { id } }, res) => {
    // if (!fs.existsSync(__dirname + '/' + dinos[id])) return res.json({ error: 'Dino not found' });
    getByFileName(dinos[id], res);
});

app.get('/info/:id', ({ params: { id } }, res) => {
    // if (!fs.existsSync(__dirname + '/' + dinos[id])) return res.json({ error: 'Dino not found' });
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
    console.log('Downloaded. (' + Object.keys(dinos).length + ' dinos)');
    app.listen(3000, _ => {
        console.log('Ready! (:3000)');
    });
});