const podDefinition = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
        name: 'rabbitmq-worker-pod',
        labels: {
            app: 'rabbitmq-worker-pod'
        }
    },
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
}

exports.podDefinition = podDefinition;