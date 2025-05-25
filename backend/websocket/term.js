import { WebSocketServer } from 'ws';
import * as pty from "node-pty";

const shell = "bash";
const wss = new WebSocketServer({ host: '0.0.0.0', port: 8080 });
let term = null;

function nodeEnvBind() {
    const term = pty.spawn(shell, ["--login"], {
        name: "xterm-color",
        cols: 80,
        rows: 24,
        cwd: "/root",
        env: process.env,
    });
    termMap.set(term.pid, term);
    return term;
}

wss.on('connection', function connection(ws, req) {
  if (!term) {
    term = nodeEnvBind(req);
  }

  term.on("data", function (data) {
    ws.send(data);
  });

  ws.on("message", (data) => {
    console.log(typeof data === "string");
    term.write(data);
  });

  ws.on("close", function () {
    term.kill();
    term = null;
  });
});