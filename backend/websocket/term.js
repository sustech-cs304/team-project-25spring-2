import { WebSocketServer } from 'ws';
import * as pty from "node-pty";

const shell = "sh";
const wss = new WebSocketServer({ host: '0.0.0.0', port: 4000 });

let term = null;

wss.on('connection', function connection(ws) {
  if (!term) {
    term = pty.spawn(shell, [], {
        name: "xterm-color",
        cwd: "/root/data",
        env: process.env,
    });
  }

  term.onData((data) => {
    ws.send(data);
  });

  ws.on("message", (data) => {
    term.write(data);
  });

  ws.on("close", function () {
    term.kill();
    term = null;
  });
});