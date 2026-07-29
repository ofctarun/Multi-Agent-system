import {k8sV1Api} from './config.js';

export const createService = async (sandboxId) => {
    const serviceManifest = {
        metadata: {
            name: `sandbox-service-${sandboxId}`,
            labels: {
                app: 'sandbox',
                sandboxId: sandboxId
            }
        },
        spec: {
            selector: {
                app: 'sandbox',
                sandboxId: sandboxId
            },
            ports: [
                {
                    protocol: 'TCP',
                    port: 80,
                    targetPort: 5173,
                    name: 'http'
                }
            ],
            type: 'ClusterIP'
        }
    }

    const response = await k8sV1Api.createNamespacedService('default', serviceManifest);
    
    return response;
}


