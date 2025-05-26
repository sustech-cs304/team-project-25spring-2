import express from "express";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());

const shell = "sh";
const port = 4000;

const terminalMap = new Map(); // pid -> term

app.post("/init", (req, res) => {
    const term = pty.spawn(shell, [], {
        name: "xterm-color",
        cwd: "/root/data",
        env: process.env,
    });
    const pid = term.pid.toString();
    terminalMap.set(pid, term);
    res.json({ pid });
});

const server = app.listen(port, () => {
    console.log("Server running on port", port);
});

const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws, req) {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const pid = urlParams.get("pid");

    if (!pid || !terminalMap.has(pid)) {
        ws.close();
        return;
    }

    const term = terminalMap.get(pid);

    term.onData((data) => {
        ws.send(data);
    });

    ws.on("message", (data) => {
        term.write(data.toString());
    });

    ws.on("close", () => {
        term.kill();
        terminalMap.delete(pid);
    });
});
