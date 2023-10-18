const amqp = require('amqplib');
const express = require('express');
const promBundle = require('express-prom-bundle');
const promClient = require('prom-client');
require('dotenv').config();

const queueName = 'producer-queue'

const main = async () => {
  try {
    const username = process.env.RABBITMQ_USERNAME;
    const password = process.env.RABBITMQ_PASSWORD;
    const connection = await amqp.connect(`amqp://${username}:${password}@rabbitmq-service`);

    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);

    // Function to send a message to the queue
    const sendMessage = async () => {
      const message = `Hello, RabbitMQ! Here's a message at ${(new Date()).toDateString()}.`;
      channel.sendToQueue(queueName, Buffer.from(message));
      console.log(`Sent: ${message}`);
    };

    setInterval(sendMessage, (process.env.MESSAGE_INTERVALS * 1000) || 10000); // 10,000 milliseconds (10 seconds)

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);



const app = express();
const metricsMiddleware = promBundle({ includeMethod: true, autoregister: false });
app.use('/metrics', metricsMiddleware);
const getQueueSize = async () => {
  try {
    const username = process.env.RABBITMQ_USERNAME;
    const password = process.env.RABBITMQ_PASSWORD;
    const connection = await amqp.connect(`amqp://${username}:${password}@rabbitmq-service`);
    const channel = await connection.createChannel();

    const queueInfo = await channel.checkQueue(queueName);
    return queueInfo.messageCount;
  } catch (error) {
    console.error('Error:', error.message);
    return 0;
  }
}

const queueSizeMetric = new promClient.Gauge({
  name: 'rabbitmq_queue_size',
  help: 'Total number of messages in the RabbitMQ queue',
  labelNames: ['queue_name'],
});

app.get('/metrics', async (req, res) => {
  const queueSize = await getQueueSize();

  queueSizeMetric.set({ queue_name: queueName }, queueSize);
  res.set('Content-Type', promClient.register.contentType);
  console.log(promClient.register.contentType)
  let result = await promClient.register.metrics();
  console.log(result);
  res.end(result);
});

const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
