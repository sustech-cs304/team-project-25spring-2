import time
from kubernetes.stream import stream
import os
from hashlib import sha256


sha = sha256()

def create_pod(api_instance, env_id):
    # copy raw files to `id` directory
    # create id directory:
    env_id = str(env_id)
    os.makedirs(f"/app/data/{env_id}", exist_ok=True)
    sha.update(env_id.encode())
    name = "prac-" + sha.hexdigest()[:8]

    pod_manifest = {
        'apiVersion': 'v1',
        'kind': 'Pod',
        'metadata': {
            'name': name,
            'labels': {
                'app': name,
                'egress': 'practicum-ws'
            }
        },
        'spec': {
            'containers': [{
                'image': 'ghcr.io/chanbengz/peach-websocket:latest',
                'name': name,
                'imagePullPolicy': 'IfNotPresent',
                'ports': [{
                    "containerPort": 1234,
                    "name": name
                }],
                "volumeMounts": [{
                    "mountPath": "/root/data",
                    "name": "data-volume",
                    "subPath": env_id
                }]
            }],
            'volumes': [{
                'name': 'data-volume',
                'persistentVolumeClaim': {
                    'claimName': 'backend-pv-claim'
                }
            }]
        }
    }

    service_manifest = {
        'apiVersion': 'v1',
        'kind': 'Service',
        'metadata': {
            'name': name,
            'labels': {
                'app': name,
            }
        },
        'spec': {
            'type': 'ClusterIP',
            'ports': [
                {
                    "port": 1234,
                    "targetPort": 1234,
                    "name": name + "-y"
                },
                {
                    "port": 4000,
                    "targetPort": 4000,
                    "name": name + "-term"
                }
            ],
            'selector': {
                'app': name
            }
        },
        'status': {
            'loadBalancer': {}
        }
    }

    resp = api_instance.create_namespaced_pod(body=pod_manifest,
        namespace='default')
    while True:
        resp = api_instance.read_namespaced_pod(name=name,
                                                namespace='default')
        if resp.status.phase != 'Pending':
            break
        time.sleep(1)

    resp = api_instance.create_namespaced_service(body=service_manifest,
        namespace='default')

    return name