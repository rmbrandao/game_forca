"use strict";

const axios = require('axios');
var bfim = false;
var jog1 = 0;
var jog2 = 0;
var jog3 = 0;
var pontos = Math.floor(Math.random() * 11);
var jogador_da_vez = Math.floor(Math.random() * 3)+1;
var palavras_completas = [];
var champion = { 'jogador': '', 'pontos': 0}

function add_pontos(pontos, player){
  if(player === 1){
    jog1 = jog1 + pontos;
    document.getElementById("jogador1").innerHTML = "Jogador 1: " + jog1;
  } else if (player === 2){
    jog2 = jog2 + pontos;
    document.getElementById("jogador2").innerHTML = "Jogador 2: " + jog2;
  } else{
    jog3 = jog3 + pontos;
    document.getElementById("jogador3").innerHTML = "Jogador 3: " + jog3;
  }
}

function next_player(player){
  if(player === 1){
    jogador_da_vez = 2
  } else if (player === 2){
    jogador_da_vez =  3;
  } else{
    jogador_da_vez = 1;
  }
  document.getElementById("player_view").innerHTML =  jogador_da_vez;
}

function validarPalavra(palavra, numeroPalavra){
  if (document.getElementById("plv"+numeroPalavra).value == palavra.toUpperCase()) {
    document.getElementById("palavra"+numeroPalavra).innerHTML = palavra.toUpperCase();
    add_pontos(50, jogador_da_vez);
    palavras_completas.push(numeroPalavra);
    win();
  } else{
    document.getElementById("palavracorreta"+numeroPalavra).value = '';
    next_player(jogador_da_vez);
  }
}

window.addEventListener('load', function() {
  axios.get('http://localhost:3000/novo_jogo').then(function(resposta){
    for(var i = 0; i< 3; i++){
      var aux = '';
      for (var j = 0; j < resposta.data[i]['tamanho']; j++) {
        if (j == (resposta.data[i]['tamanho'] - 1)){
          aux = aux+'_';
        }else{
          aux = aux+'_ ';
        }
      }
      document.getElementById("palavra"+(i+1)).innerHTML = aux;
    }
    document.getElementById("jogador1").innerHTML = "Jogador 1: " + jog1;
    document.getElementById("jogador2").innerHTML = "Jogador 2: " + jog2;
    document.getElementById("jogador3").innerHTML = "Jogador 3: " + jog3;
    document.getElementById("pontos_field").innerHTML = "Pontos da jogada: " + pontos;
    document.getElementById("player_view").innerHTML = jogador_da_vez;
    document.getElementById("plv1").value = resposta.data[0]['palavra'];
    document.getElementById("plv2").value = resposta.data[1]['palavra'];
    document.getElementById("plv3").value = resposta.data[2]['palavra'];

    console.log(resposta.data);
  }).catch(function (error){
    if (error){
      console.log('ferro -> '+error);
    }
  });
});

function escolheLetra(letra) {
  document.getElementById(letra).classList.add("disabled")
  var existeletra = false;
  for(var i = 1; i <= 3; i++){
    if(!palavras_completas.includes(i)){
      var palavra = document.getElementById("plv"+i).value;
      if(palavra.includes(letra)){
        var aux = document.getElementById("palavra"+i).innerHTML.split(' ');
        for(var j = 0; j < palavra.length; j++){
          if (palavra[j] == letra){
            existeletra = true;
            aux[j] = letra;
            document.getElementById("player_view").innerHTML = jogador_da_vez;
            add_pontos(pontos, jogador_da_vez);
          }
        }
        document.getElementById("palavra"+i).innerHTML = aux.join(' ');
        console.log(!aux.includes("_"));
        if (!aux.includes("_")){
          palavras_completas.push(i);
          console.log(palavras_completas)
        }
      }
    }
  }
  if (!existeletra) {
    next_player(jogador_da_vez);
    document.getElementById("letraserradas").innerHTML = document.getElementById("letraserradas").innerHTML+' '+letra;
  }
  pontos = Math.floor(Math.random() * 11);
  document.getElementById("pontos_field").innerHTML = "Pontos da jogada: " + pontos;
  win()
}

function reload(){
  window.location.reload();
}

function win(){
  if(palavras_completas.includes(1) && palavras_completas.includes(2) && palavras_completas.includes(3)){
    var max = Math.max(jog1, jog2, jog3);
    if( jog1 === max){
      champion.jogador = ' JOGADOR 1';
      champion.pontos = jog1;
    } else if(jog2 === max){
      champion.jogador = ' JOGADOR 2';
      champion.pontos = jog2;
    } else{
      champion.jogador = ' JOGADOR 3';
      champion.pontos = jog3;
    }
    document.getElementById("conteudo").classList.add('display_none');
    document.getElementById("vencedor").classList.remove('display_none');
    document.getElementById("player-win").innerHTML = "PARABENS " + champion.jogador;
    document.getElementById("player-ponts").innerHTML = "Você marcou " + champion.pontos + " pontos";
  }
  
}