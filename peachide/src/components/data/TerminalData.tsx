export const getCommandResponse = async (command: string, env_id: string) => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/terminal/${env_id}`, {
        method: 'POST',
        body: JSON.stringify({ cmd: command }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
};