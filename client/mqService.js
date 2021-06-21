const amqp = require('amqplib');
const config = require('config');
const mqConfig = config.get('mq');
const { ipcRenderer } = require('electron');

class RabbitMQ {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queue = null;
    }

    async init() {
        try {
            this.connection = await amqp.connect(mqConfig);
            this.channel = await this.connection.createChannel();
            
            this.queue = await this.channel.assertQueue('', {
                durable: false,
                autoDelete: true
            });

            this.channel.bindQueue(this.queue.queue, mqConfig.server.exchange, '');

            
            this.channel.consume(this.queue.queue, (msg) => {
                ipcRenderer.send('NEW_MQ_MESSAGE_TO_MAIN', msg.content.toString());
                this.channel.ack(msg);
            });
        } catch(error) {
            console.log(error);
        }
    }

    async sendMessage(data) {
        if (!this.connection) {
            await this.init();
        }

        this.channel.sendToQueue(mqConfig.client.queue, Buffer.from(JSON.stringify(data)), { persistent: true });
    }
}

module.exports = RabbitMQ;