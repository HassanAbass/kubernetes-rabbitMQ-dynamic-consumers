const amqp = require('amqplib');
const queueName = 'producer-queue';
const consumeMessages = async () => {
    const username = process.env.RABBITMQ_USERNAME;
    const password = process.env.RABBITMQ_PASSWORD;
    const connection = await amqp.connect(`amqp://${username}:${password}@rabbitmq-service`);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);

    channel.prefetch(1);

    const consumeMessage = () => {
        return channel.consume(queueName, (msg) => {
            setTimeout(function() {
                console.log(` [x] ack message : ${msg.content.toString()}`);
                channel.ack(msg);
              }, 3000);
        });
    };
    consumeMessage();
}

consumeMessages().catch(console.error);
