const k8s = require('@kubernetes/client-node');
const amqp = require('amqplib');
const {podDefinition} = require('./pod');
const queueName = 'producer-queue';

async function createRabbitMQConsumerPod() {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);


    try {
        let podSpecs = podDefinition;
        podSpecs.metadata.name = `rabbitmq-worker-pod-${Math.random().toString(36).substring(2)}`;
        const response = await k8sApi.createNamespacedPod('default', podSpecs);
        console.log('Pod created:', response.body.metadata.name);
    } catch (error) {
        console.error('Error creating Pod:', error);
    }
}

async function deletePodsByPrefix(prefix) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    try {
        const podList = await k8sApi.listNamespacedPod('default');
        const podsToDelete = podList.body.items.filter((pod) =>
            pod.metadata.name.startsWith(prefix)
        );
        podsToDelete.forEach(async (pod) => {
            try {
                await k8sApi.deleteNamespacedPod(pod.metadata.name, 'default');
                console.log(`Pod deleted: ${pod.metadata.name}`);
            } catch (error) {
                console.error(`Error deleting pod ${pod.metadata.name}:`, error);
            }
        });
    } catch (error) {
        console.error('Error listing pods:', error);
    }
}

const checkAndCreateConsumer = async () => {
    const username = process.env.RABBITMQ_USERNAME;
    const password = process.env.RABBITMQ_PASSWORD;
    const connection = await amqp.connect(`amqp://${username}:${password}@rabbitmq-service`);
    const channel = await connection.createChannel();
    const queueCount = (await channel.checkQueue(queueName)).messageCount;
    console.log(`Queue count : ${queueCount}`)

    if (queueCount > 50) {
        console.log(`Dispatch another worker : ${queueCount}`)
        await createRabbitMQConsumerPod();
    } else if (queueCount === 0) {
        console.log('Queue is empty. Deleting worker pods.');
        await deletePodsByPrefix('rabbitmq-worker-pod');
    }
}
// createRabbitMQConsumerPod();
setInterval(checkAndCreateConsumer, 50000);// 50 seconds
