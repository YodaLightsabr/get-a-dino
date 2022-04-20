const home = `Welcome to Get-A-Dino! This website pulls dinosaurs from https://github.com/hackclub/dinosaurs.

GET /dinos - Get the ID and URL to a random dino
GET /dinos/all - Get all dinos
GET /dinos/:id - Serve a dino by its id
GET /info/:id - Get the info of a dino
GET /random - Redirect to a random dino
GET /dino.png - Serve a random dino as a raw PNG`;

export default async function handler(request, response) {
    response.send(home);
}