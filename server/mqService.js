const amqp = require('amqplib/callback_api');
const config = require('config');
const mqConfig = config.get('mq');
const gameStatus = require('./gameStatus');
const knex = require('./db.js');

let channel = null;
const jogadores = [];
let player_da_vez = 0;
let palavras = [];
let players_conectados = [];

let pack = {
    round_points: gerarPontoRodada(),
    palavras: [],
    palavrasTraco: [],
    wrong_letters: [],
    palavras_completas: [],
    status: '',
    jogador_vez_nome: '',
    jogadores: jogadores,
    vencedor: null
}



amqp.connect(mqConfig, function (error, connection) {
    if (error) {
        console.error('error', error);
    }

    connection.createChannel((error, ch) => {
        if (error) {
            console.error('error', error);
        }

        channel = ch;

        channel.assertExchange(mqConfig.toPlayers.exchange, 'fanout', { durable: true });
        channel.assertQueue(mqConfig.fromPlayers.queue, { durable: true });

        channel.consume(mqConfig.fromPlayers.queue, (msg) => {
            handleMessage(JSON.parse(msg.content.toString()));
            ch.ack(msg);
        });

        console.log("[*] Waiting for messages. To exit press CTRL+C");
    });
});

async function handleMessage(msg) {
    switch (msg.header.type) {
        case 'register':
            if (palavras.length < 1) {
                await get_palavra();
                pack.palavras = palavras;
            }

            if (pack.status !== gameStatus.INICIADO) {
                controlarUser(msg);
            } else {
                reconectPlayer(msg);
            }
            break;
        case 'statusChange':
            if (msg.data.logado) {
                pack.status = gameStatus.INICIADO;
                pack.jogador_vez_nome = jogadores[player_da_vez].nome;
                pack.jogadores[player_da_vez].now = true;
                channel.publish(mqConfig.toPlayers.exchange, '', Buffer.from(JSON.stringify(pack)));
            }
            break;
        case 'update':
            pack.palavrasTraco = msg.data.update_w;

            if (msg.data.wrong_letter !== '') {
                pack.wrong_letters.push(msg.data.wrong_letter);
            }

            if (msg.data.acertos > 0) {
                atribuirPontos(msg.data.acertos, player_da_vez);
                pack.round_points = gerarPontoRodada();
            } else {
                pack.round_points = gerarPontoRodada();
                pack.jogadores[player_da_vez].now = false;
                const next = next_player();
                player_da_vez = next.id - 1;
                pack.jogador_vez_nome = next.nome;
                pack.jogadores[player_da_vez].now = true;
            }

            await checkReset();
            channel.publish(mqConfig.toPlayers.exchange, '', Buffer.from(JSON.stringify(pack)));
            break;
        case 'checkWord':
            const skip = validar_palavra(msg.data.validar_palavra.palavra, msg.data.validar_palavra.posicao);
            if (skip) {
                pack.jogadores[player_da_vez].now = false;
                const next = next_player();
                player_da_vez = next.id - 1;
                pack.jogador_vez_nome = next.nome;
                pack.jogadores[player_da_vez].now = true;
            }

            await checkReset();
            channel.publish(mqConfig.toPlayers.exchange, '', Buffer.from(JSON.stringify(pack)));
            break;
    }
}

function controlarUser(msg) {
    jogadores.push({
        id: jogadores.length + 1,
        uid: msg.data.uid,
        pontuacao: 0,
        nome: 'Jogador ' + (jogadores.length + 1),
        now: false
    });

    players_conectados.push(msg.data.uid);

    validar_status();
}

function validar_status() {
    if (jogadores.length < 2) {
        pack.status = gameStatus.AGUARDANDO_JOGADORES
        channel.publish(mqConfig.toPlayers.exchange, '', Buffer.from(JSON.stringify(pack)));
    } else if (pack.status !== gameStatus.INICIADO) {
        pack.status = gameStatus.PRONTO_PARA_INICIAR
        channel.publish(mqConfig.toPlayers.exchange, '', Buffer.from(JSON.stringify(pack)));
    }
}

async function get_palavra() {
    await knex.select('*').from('palavra_chave').then(rows => {
        for (let index = 0; index < 3; index++) {
            let i = Math.floor(Math.random() * rows.length);
            palavras.push(rows.splice(i, 1)[0]);
        }
    });
}

function atribuirPontos(acertos, id) {
    const pontuacao = acertos * pack.round_points;

    jogadores[id].pontuacao += pontuacao;
}

function gerarPontoRodada() {
    var pontos = Math.floor(Math.random() * 11);
    return pontos;
}

function validar_palavra(palavra, campo) {
    if (palavra === '') {
        return false;
    } else if (palavras[campo - 1].palavra === palavra) {
        jogadores[player_da_vez].pontuacao += 50;
        pack.palavras_completas.push(campo);

        return false;
    } else {
        return true;
    }
}

function next_player() {
    const vez = player_da_vez;

    let retorno = null;

    if (vez < jogadores.length - 1) {
        retorno = jogadores[vez + 1];
    } else {
        retorno = jogadores[0];
    }

    return retorno;
}

async function checkReset() {
    if (pack.palavras_completas.length === 3) {
        palavras = [];
        pack.palavrasTraco = [];
        pack.wrong_letters = [];
        pack.palavras_completas = [];

        await get_palavra();
        pack.palavras = palavras;
    }
}

function reconectPlayer(msg) {
    if (players_conectados.includes(msg.data.uid)) {
        channel.publish(mqConfig.toPlayers.exchange, '', Buffer.from(JSON.stringify(pack)));
    }
}