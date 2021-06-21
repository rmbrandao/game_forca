const WebSocket = require('ws');
const knex = require('./db.js');

const jogadores = [];
var player_da_vez = 0;
var palavras = [];

const status = {
    INICIADO: 'iniciado',
    AGUARDANDO_JOGADORES: 'aguardando_jogadores',
    PRONTO_PARA_INICIAR: 'pronto_para_iniciar'
}

let pack = {
    round_points: 0,
    points_player: 0,
    now: false,
    palavras: [],
    palavrasTraco: [],
    wrong_letters: [],
    palavras_completas: [],
    status: '',
    name: '',
    jogador_vez_nome: '',
    jogadores: jogadores,
    vencedor: null
}

const wss = new WebSocket.Server({
    port: 8080
});

wss.on('connection', async function connection(ws, req) {
    ws.on('message', message => {
        
        let aux = JSON.parse(message);
        if (aux.tipo == 'update_w'){
            pack.palavrasTraco = aux.update_w;
            pack.wrong_letters = aux.wrong_letters;  
        }
        if(aux.logado){
            pack.status = status.INICIADO;
        }

        atribuirPontos(aux.acertos, player_da_vez);

        if(aux.next_player || validar_palavra(aux.validar_palavra.palavra, aux.validar_palavra.posicao)) {
            const next = next_player();
            player_da_vez = next.id - 1;
            pack.jogador_vez_nome = next.nome;
        }

        pack.round_points = gerarPontoRodada();

        checkWin()
        sendToClient(wss);
    });
    
    
    if (palavras.length < 1){
        await get_palavra();
        pack.palavras = palavras;
    }
    pack.round_points = gerarPontoRodada();
    controlarUser(req);
    
    sendToClient(wss);

    ws.on('error', (err) => {
        console.log(err);
    });
  
});

async function get_palavra(){
    await knex.select('*').from('palavra_chave').then(rows => {
        for (let index = 0; index < 3; index++) {
            let i = Math.floor(Math.random() * rows.length);
            palavras.push(rows.splice(i, 1)[0]);
        }
    });
}

function sendToClient(wss) {
    i = 0;

    wss.clients.forEach(client => {
        if(client._socket.remoteAddress === jogadores[player_da_vez].ip){
            pack.now = true;
        } else{
            pack.now = false;
        }
        pack.jogador_vez_nome = jogadores[player_da_vez].nome;
        pack.name = jogadores[i].nome;
        pack.points_player = jogadores[i].pontuacao;
        client.send(JSON.stringify(pack))
        i++
    });
}

function next_player() {
    const vez = player_da_vez;
    
    let retorno = null;
    
    if(vez < jogadores.length - 1){
        retorno = jogadores[vez+1];
    } else {
        retorno = jogadores[0];
    }

    return retorno;
}

function atribuirPontos(acertos, id) {
    const pontuacao = acertos * pack.round_points;
    
    jogadores[id].pontuacao += pontuacao;
}

function gerarPontoRodada(){
    var pontos = Math.floor(Math.random() * 11);
    return pontos;
}

function controlarUser(req){
    if(jogadores.length > 0) {
        jogadores.forEach(jog => {
            if(jog.ip !== req.socket.remoteAddress) {
                jogadores.push({
                    ip: req.socket.remoteAddress,
                    pontuacao: 0,
                    id: jogadores.length + 1,
                    nome: 'Jogador ' + (jogadores.length + 1) 
                });
            }
        });
    }else {
        jogadores.push({
            ip: req.socket.remoteAddress,
            pontuacao: 0,
            id: jogadores.length + 1, 
            nome: 'Jogador ' + (jogadores.length + 1)
        });
    }
    validar_status();
}

function validar_status(){
    if(jogadores.length < 2){
        pack.status = status.AGUARDANDO_JOGADORES
        wss.clients.forEach(client => {
            client.send(JSON.stringify(pack));
        });
    } else if(pack.status !== 'iniciado'){
        pack.status = status.PRONTO_PARA_INICIAR
        wss.clients.forEach(client => {
            client.send(JSON.stringify(pack));
        });
    }
}

function validar_palavra(palavra, campo){
    if(palavra === ''){
        return false;
    } else if (palavras[campo-1].palavra === palavra){
        jogadores[player_da_vez].pontuacao += 50; 
        pack.palavras_completas.push(campo);
        return false;
    } {
        return true;
    }

}

function checkWin(){
    if(pack.palavras_completas.length === 3){
        const vencedor = null;
        let maxScore = 0;
        jogadores.forEach( jog =>{
            if (jog.pontuacao > maxScore){
                maxScore = jog.pontuacao;
                pack.vencedor = jog
            }
        })
    }
    
}