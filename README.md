# Game Forca

Projeto referente ao trabalho de *"Forca com middleware"* da disciplina de *Tópicos avançados em computação*.

O jogo foi implementado em 3 versões diferentes acessiveis por tag:

## Tag v1.0
    Nesta tag o jogo é apresentado utilizando uma arquitetura cliente/servidor que apenas funciona de maneira local (em um único cliente/pc).

    Server
        - clonar este repositório
        - acessar a pasta server
        - rodar o comando: git checkout tags/v1.0
        - rodar o comando: npm install
        - rodar o comando: npm run dev

    Client
        - clonar este repositório
        - acessar a pasta client
        - rodar o comando: npm install
        - rodar o comando: npm run start (Antes de rodar este comando é necessário que o servidor esteja rodando).

    

## Tag v2.0
    Nesta tag o jogo é apresentado utilizando uma arquitetura de cliente/servidor porém com a utilização de Socket, destam maneira é possível jogar com multiplos clientes/pcs em uma mesma rede.

    Server
        - clonar este repositório
        - acessar a pasta server
        - rodar o comando: git checkout tags/v2.0
        - rodar o comando: npm install
        - rodar o comando: npm run devws

    Client
        - clonar este repositório
        - acessar a pasta client
        - rodar o comando: npm install
        - rodar o comando: npm run start (Antes de rodar este comando é necessário que o servidor esteja rodando).

## Tag v4.0
    Nesta tag o jogo é apresentado utilizando uma arquitetura de client/servidor, porém fazendo a utilização de filas, no caso a ferramenta utilizada foi o RabbitMQ.

    Requerimentos e pré-configurações:
        - Possuir o docker instalado
        - rodar o comando abaixo

```bash
docker run -d --hostname my-rabbit --name some-rabbit --rm -p 8080:15672 -p 5672:5672 rabbitmq:3-management
```
        

    Server
        - clonar este repositório
        - acessar a pasta server
        - rodar o comando: git checkout tags/v4.0
        - rodar o comando: npm install
        - rodar o comando: npm run mq

    Client
        - clonar este repositório
        - acessar a pasta client
        - rodar o comando: npm install
        - rodar o comando: npm run start (Antes de rodar este comando é necessário que o servidor esteja rodando).