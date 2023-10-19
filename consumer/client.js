const k8s = require('@kubernetes/client-node');

async function createRabbitMQConsumerPod() {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  const podDefinition = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: { name: 'rabbitmq-consumer-pod' },
    spec: {
      containers: [
        {
          name: 'consumer-container',
          image: 'node:18',
          command: ['/bin/sh', '-c', 'cd /app && npm i && node consumer.js'],
          volumeMounts: [
            {
              name: 'app-code',
              mountPath: '/app',
            },
          ],
          envFrom: [
            {
              configMapRef: {
                name: 'rabbitmq-config-env',
              },
            },
          ],
        },
      ],
      volumes: [
        {
          name: 'app-code',
          hostPath: {
            path: '/run/desktop/mnt/host/wsl/consumer',
          },
        },
      ],
    },
  };

  try {
    const response = await k8sApi.createNamespacedPod('default', podDefinition);
    console.log('Pod created:', response.body.metadata.name);
  } catch (error) {
    console.error('Error creating Pod:', error);
  }
}

createRabbitMQConsumerPod();
