const amqp = require('amqplib');
require('dotenv').config();

async function main() {
  try {
    const username = process.env.RABBITMQ_USERNAME;
    const password = process.env.RABBITMQ_PASSWORD;
    const connection = await amqp.connect(`amqp://${username}:${password}@rabbitmq-service`);
    
    const queue = 'producer-queue';
    
    const channel = await connection.createChannel();
    await channel.assertQueue(queue);

    // Function to send a message to the queue
    const sendMessage = async () => {
      const message = `Hello, RabbitMQ! Here's a message at ${(new Date()).toDateString()}.`;
      channel.sendToQueue(queue, Buffer.from(message));
      console.log(`Sent: ${message}`);
    };

    setInterval(sendMessage, (process.env.MESSAGE_INTERVALS * 1000) || 10000); // 10,000 milliseconds (10 seconds)
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);
