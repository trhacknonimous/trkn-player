const express = require('express');
const helmet = require('helmet');
const xss = require('xss');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('');
const dompurify = require('dompurify')(window);
const fs = require('fs');
const path = require('path');

const app = express();
app.use(helmet()); // Utilisation du middleware Helmet pour ajouter des en-têtes de sécurité
const port = 3000;


app.use(express.static('public'));

app.get('/', (req, res) => {
    const files = getMusicFiles();
    const rapContent = getRapContent();
    res.send(buildHTML(files, rapContent));
});

// Utilisation de xss pour filtrer les entrées utilisateur potentiellement dangereuses
function sanitizeInput(input) {
    return xss(input);
}

// Utilisation de dompurify pour nettoyer les données HTML potentiellement dangereuses
function sanitizeHTML(html) {
    return dompurify.sanitize(html);
}


function getMusicFiles() {
    const files = fs.readdirSync(path.join(__dirname, 'public'));
    return files.filter(file => ['.mp3', '.webm', '.mp4'].includes(path.extname(file)));
}

function getRapContent() {
    return [
        { artist: 'TAFTAF', song: 'BAZAR', punchline: 'on parle pas aux bavard.' },
        { artist: 'Zbig', song: 'DlD', punchline: 'que du sale ma dis le four...arrete un peu de taffole . tous on le sait que test une follete' },
        { artist: 'voleur2voleur', song: 'INDÉCIS', punchline: 'devant les calibres sa devient sentimental.' },
        { artist: 'RAOUS', song: 'terrain mine', punchline: `Sur le terrain, j'pose ma mine, mon rap est explosif, t'entends le gyrophare briller comme une étoile dans la nuit.` },
        // Ajoutez plus de contenu ici
    ];
}

function buildHTML(files, rapContent) {
    let listHTML = '';
    let rapContentHTML = '';

    for (const file of files) {
        const fileType = path.extname(file).toLowerCase();
        let fileLink = `/play?file=${encodeURIComponent(file)}`;
        if (fileType === '.mp4') {
            listHTML += `
                <li>
                    <video width="320" height="240" controls>
                        <source src="${fileLink}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </li>`;
        } else if (fileType === '.mp3') {
            listHTML += `
                <li>
                    <audio controls>
                        <source src="${fileLink}" type="audio/mpeg">
                        Your browser does not support the audio tag.
                    </audio>
                </li>`;
        }
    }

    for (const rap of rapContent) {
        rapContentHTML += `
            <div class="rap">
                <h2>${rap.artist} - ${rap.song}</h2>
                <p>${rap.punchline}</p>
            </div>
        `;
    }

    return `
        <html>
           <head>
            <title>Rap Attack Player</title>
            <link rel="icon" href="hack.ico" type="image/x-icon">
            <meta property="og:title" content="Rap Attack Player">
            <meta property="og:description" content="Écoutez les meilleurs sons de rap et découvrez des paroles percutantes.">
            <meta property="og:image" content="rap.jpg">
            <meta property="og:url" content="http://player.jeankilindrangh.repl.co:${port}/">
            <meta property="og:type" content="website">
            <style>
                body {
                    background-color: black;
                    color: #00ff00; /* Green */
                    font-family: 'Courier New', monospace;
                }
                h1, h2 {
                    color: #ff00ff; /* Magenta */
                }
                a {
                    color: #00ff00; /* Green */
                    text-decoration: none; /* Supprime le soulignement des liens */
                }
                .rap {
                    background-color: #000033; /* Dark Blue */
                    padding: 20px;
                    margin: 10px;
                    border: 2px solid #ff00ff; /* Magenta */
                }
                video {
                    outline: 2px solid #00ff00; /* Green */
                }
            </style>
        </head>
        <body>
            <h1>Rap Attack Player</h1>
            <h2>C'est du lourd !</h2>
            ${rapContentHTML}
            <h2>Fais péter les sons</h2>
            <ul>${listHTML}</ul>
        </body>
        </html>
    `;
}

app.get('/play', (req, res) => {
    const file = sanitizeInput(req.query.file); // Filtrer les entrées utilisateur
    const filePath = path.join(__dirname, 'public', file);
    const fileType = path.extname(file).toLowerCase();

    if (['.mp3', '.webm', '.mp4'].includes(fileType)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});