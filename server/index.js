const express = require('express');
const bodyParser = require('body-parser');
const knex = require('./db.js');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/novo_jogo', (req, res) => {
    knex.select('*').from('palavra_chave').then(rows => {
        const palavras = Array();

        for (let index = 0; index < 3; index++) {
            let i = getRandomIntInclusive(0, rows.length - 1);
            palavras.push(rows.splice(i, 1)[0]);
        }

        res.status(200).json(palavras);
    });
});

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(3000, () => {
    console.log('Forca API, Porta 3000');
});