import express from "express";
import morgan from "morgan";
import http from "http";
import {createProxyMiddleware} from "http-proxy-middleware";
import dns from "node:dns";

dns.setDefaultResultOrder('ipv4first');

const app = express();
app.use(morgan("combined"));

app.get("/api/status/healthz", (req, res) => {
    res.status(200).json({ status: "healthy" });
});

app.get("/api/status/readyz", (req, res) => {
    res.status(200).json({ status: "ready" });
});

const proxies = {};
const agentProxies = {};

function getAgentProxy(sandboxId){
    if(!agentProxies[sandboxId]){
        agentProxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-service-${sandboxId}:3000`,
            changeOrigin: true,
            ws: true,
            onError: (err, req, res) => {
                console.error(`Agent proxy error for sandbox ${sandboxId}:`, err.message);
                res.status(502).send(`Bad Gateway: Could not connect to agent container (${err.message})`);
            }
        });
    }
    return agentProxies[sandboxId];
}

function getProxy(sandboxId){
    if(!proxies[sandboxId]){
        proxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-service-${sandboxId}`,
            changeOrigin: true,
            ws: true,
            onError: (err, req, res) => {
                console.error(`Proxy error for sandbox ${sandboxId}:`, err.message);
                res.status(502).send(`Bad Gateway: Could not connect to sandbox container (${err.message})`);
            }
        });
    }
    return proxies[sandboxId];
}

app.use((req,res,next)=>{
    const host = req.headers.host;

    if(host.includes("agent")){
        const sandboxId = host.split('.')[0];
        return getAgentProxy(sandboxId)(req,res,next);
    }else if(host.includes("preview")){
        const sandboxId = host.split('.')[0];
        return getProxy(sandboxId)(req,res,next);
    }
});

// Create the HTTP server explicitly
const server = http.createServer(app);

server.on('upgrade', (req, socket, head) => {
    const host = req.headers.host;
    const sandboxId = host.split('.')[0];
    const type = host.split('.')[1];

    console.log(`WS upgrade request: ${host}, sandboxId: ${sandboxId}, type: ${type}`);

    if(type === "agent"){
        const proxy = getAgentProxy(sandboxId);
        proxy.upgrade(req, socket, head);
    } else if(type === "preview"){
        const proxy = getProxy(sandboxId);
        proxy.upgrade(req, socket, head);
    } else {
        socket.destroy();
    }
});

export default server;