const amqp = require('amqplib');
require('dotenv').config()

async function main() {
  try {
    const username = process.env.RABBITMQ_USERNAME; // Use the environment variable for the username
    const password = process.env.RABBITMQ_PASSWORD;
    const connection = await amqp.connect(`amqp://${username}:${password}@rabbitmq-service`);
    

    const queue = 'producer-queue';
    const message = 'Hello, RabbitMQ! Here\'s a message';

    // Assert the queue (create it if it doesn't exist)
    const channel = await connection.createChannel();
    await channel.assertQueue(queue);

    // Send a message to the queue
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`Sent: ${message}`);

    // Consume messages from the queue
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);
