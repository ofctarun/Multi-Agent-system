import express from 'express';
import agentRouter from './routes/agent.routes';
import morgan from 'morgan';

const app = express();

//MiddleWare
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/status/healthz", (req, res) => {
    res.status(200).json({
        message: 'Hello from the AI Orchestration app!',
        status: 'success'
    });
});

//Routes
app.use("/api/ai/agent", agentRouter);

export default app;