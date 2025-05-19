import time
from kubernetes.stream import stream


def create_pod(api_instance, env_id):
    # copy raw files to `id`

    name = "practicum-ws-" + env_id
    pod_manifest = {
        'apiVersion': 'v1',
        'kind': 'Pod',
        'metadata': {
            'name': name,
            'labels': {
                'app': 'practicum-ws',
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
    print("Done.")


def exec_pod(api_instance, env_id: str, cmd: str):
    name = "practicum-ws-" + env_id
    # Calling exec and waiting for response
    exec_command = [
        '/bin/sh',
        '-c',
        cmd
    ]

    # When calling a pod with multiple containers running the target container
    # has to be specified with a keyword argument container=<name>.
    resp = stream(
        api_instance.connect_get_namespaced_pod_exec,
        name,
        'default',
        command=exec_command,
        stderr=True, stdin=False,
        stdout=True, tty=False
    )

    output = str(resp)
    resp.close()
    return output
