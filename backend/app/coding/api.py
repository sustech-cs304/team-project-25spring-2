import time
from kubernetes.stream import stream
import os


def create_pod(api_instance, env_id):
    # copy raw files to `id` directory
    # create id directory:
    env_id = str(hash(env_id))[:8]
    os.makedirs(f"/app/data/{env_id}", exist_ok=True)
    name = "prac-" + env_id
    pod_manifest = {
        'apiVersion': 'v1',
        'kind': 'Pod',
        'metadata': {
            'name': name,
            'labels': {
                'app': name,
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

    resp = api_instance.create_namespaced_pod(body=pod_manifest,
        namespace='default')
    while True:
        resp = api_instance.read_namespaced_pod(name=name,
                                                namespace='default')
        if resp.status.phase != 'Pending':
            break
        time.sleep(1)
    return name