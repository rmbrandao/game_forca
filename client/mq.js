const { ipcRenderer, BrowserWindow } = require('electron');
const mqService = require('./mqService');
const { machineIdSync } = require("node-machine-id");

const machineId = machineIdSync();
let mq = new mqService(window);
let dado = null;

var send_server = {
    update_w: [],
    wrong_letter: '',
    next_player: false,
    tipo: 'update_w',
    logado: false,
    acertos: 0,
    validar_palavra: {
        palavra: '',
        posicao: null,
    }
};

ipcRenderer.on('register', (event, message) => {
    mq.sendMessage({
        header: {
            type: 'register'
        },
        data: {
            uid: message,
        }
    });
});

ipcRenderer.on('NEW_MQ_MESSAGE', (event, message) => {
    dado = JSON.parse(message);

    let client_player = getJogador(dado.jogadores);

    document.getElementById("player_name").innerHTML = client_player.nome;
    if (dado.status === 'aguardando_jogadores') {
        document.getElementById("conteudo").classList.add("display_none");
        document.getElementById("btn_login").classList.add("display_none");
        document.getElementById("msg_wait_player").classList.remove("display_none");
    } else if (dado.status === 'iniciado') {
        document.getElementById("conteudo").classList.remove("display_none");
        document.getElementById("btn_login").classList.add("display_none");
        document.getElementById("msg_wait_player").classList.add("display_none");
        document.getElementById("login").setAttribute("style", "display:none");
    } else if (dado.status === 'pronto_para_iniciar') {
        document.getElementById("conteudo").classList.add("display_none");
        document.getElementById("msg_wait_player").classList.add("display_none");
        document.getElementById("btn_login").classList.remove("display_none");
    }

    document.getElementById("pontos_field").innerHTML = "Pontos da jogada: " + dado.round_points;
    if (!client_player.now) {
        document.getElementById("player_view").innerHTML = dado.jogador_vez_nome;
        document.getElementById("letter_field").classList.add("disabled")
        document.getElementById("inputs").classList.add("disabled")
    } else {
        document.getElementById("player_view").innerHTML = dado.jogador_vez_nome;
        document.getElementById("letter_field").classList.remove("disabled")
        document.getElementById("inputs").classList.remove("disabled")
    }

    if (dado.jogadores.length) {
        let jogadores = '';
        dado.jogadores.forEach(jogador => {
            jogadores += `
        <h2>${jogador.nome}: ${jogador.pontuacao}</h2>
      `;

            document.getElementById("jogadores").innerHTML = jogadores;
        });
    }

    get_palavras(dado.palavras, dado.palavrasTraco);

    if (dado.palavras_completas.length) {
        for (var i = 1; i < 4; i++) {
            if (dado.palavras_completas.includes(i)) {
                document.getElementById("palavra" + i).innerHTML = dado.palavras[i - 1].palavra.toUpperCase();
            }
        }
    }

    document.getElementById("letraserradas").innerHTML = 'Letras erradas: ' + dado.wrong_letters.join(' ').toUpperCase();
});

function getJogador(jogadores) {
    if (jogadores.length > 0) {
        for (let i = 0; i < jogadores.length; i++) {
            const jog = jogadores[i];

            if (jog.uid === machineId) {
                return jog;
            }
        }
    }
}

function get_palavras(palavras, update_field) {
    if (update_field.length) {
        for (var i = 0; i < update_field.length; i++) {
            document.getElementById("palavra" + (i + 1)).innerHTML = update_field[i];
        }
    } else {
        for (var i = 0; i < 3; i++) {
            var aux = '';
            for (var j = 0; j < palavras[i]['tamanho']; j++) {
                if (j == (palavras[i]['tamanho'] - 1)) {
                    aux = aux + '_';
                } else {
                    aux = aux + '_ ';
                }
            }
            document.getElementById("palavra" + (i + 1)).innerHTML = aux;
        }
    }
    document.getElementById("plv1").value = palavras[0]['palavra'];
    document.getElementById("plv2").value = palavras[1]['palavra'];
    document.getElementById("plv3").value = palavras[2]['palavra'];
}

function logar() {
    send_server.logado = true;

    mq.sendMessage({
        header: {
            type: 'statusChange'
        },
        data: send_server
    });
}

function escolheLetra(letra) {
    let acertos = 0;
    document.getElementById(letra).classList.add("disabled")
    var existeletra = false;
    for (var i = 1; i <= 3; i++) {
        if (!dado.palavras_completas.includes(i)) {
            var palavra = document.getElementById("plv" + i).value;
            if (palavra.includes(letra)) {
                var aux = document.getElementById("palavra" + i).innerHTML.split(' ');
                for (var j = 0; j < palavra.length; j++) {
                    if (palavra[j] == letra) {
                        existeletra = true;
                        aux[j] = letra;
                        acertos++;
                    }
                }
                document.getElementById("palavra" + i).innerHTML = aux.join(' ');
                if (!aux.includes("_")) {
                    validarPalavra(dado.palavras[i - 1].palavra, i);
                }
            }
        }
    }

    send_server.acertos = acertos;

    if (!existeletra) {
        send_server.next_player = true;
        send_server.wrong_letter = letra;
    }

    send_server.update_w.push(document.getElementById("palavra1").innerHTML);
    send_server.update_w.push(document.getElementById("palavra2").innerHTML);
    send_server.update_w.push(document.getElementById("palavra3").innerHTML);

    mq.sendMessage({
        header: {
            type: 'update'
        },
        data: send_server
    });

    //reset das variavéis
    send_server.next_player = false;
    send_server.update_w = [];
    send_server.wrong_letter = '';
}

function validarPalavra(palavra, campo) {
    send_server.validar_palavra.palavra = palavra;
    send_server.validar_palavra.posicao = campo;
    mq.sendMessage({
        header: {
            type: 'checkWord'
        },
        data: send_server
    });

    document.getElementById('palavracorreta' + campo).value = '';
}