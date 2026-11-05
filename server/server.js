import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"])

//Creatong a basic express app
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import router from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

const port = process.env.PORT || 8000;

connectDB();

app.use(express.json());

app.use(cookieParser());

app.use(cors({credentials: true}));

//Api endpoints
app.get('/', (req, res) => {res.send("API Working")});
app.use('/api/auth', router);
app.use('/api/user', userRouter);

app.listen(port, () => console.log(`Start Server on port ${port}`));

//url - http://localhost/4000/api/auth/...

export default app;