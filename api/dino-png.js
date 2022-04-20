// ========= //
/* Begin boilerplate for serverless github files API */
import fetch from 'node-fetch'
async function getByFileName (name, res) {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/hackclub/dinosaurs/main/${name}`);
        response.headers.forEach((v, n) => res.setHeader(n, v));
        response.body.pipe(res);
    } catch (err) {
        console.error(err);
    }
}
let dinos = await download();
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
            // dictionary[crypto.createHash('md5').update('dinos/' + file).digest('hex').substring(0, 10)] = file; // Really bad method of generating IDs but at least it is unlikely for duplicates and will be the same each time a dinos.json is generated
            dictionary[encodeURIComponent(file).toLowerCase().padStart(10, 'x').substring(0, 10)] = file;
        });
        resolve(dictionary);
    });
}
function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
/* End boilerplate for serverless github files API */
// ========= //

export default async function handler(request, response) {
    getByFileName(Object.values(dinos)[random(0, Object.values(dinos).length - 1)], response);
}