import express from "express";
import auth from './routes/auth.js';
import dotenv from "dotenv"
import "./config/database.js"

dotenv.config()

const app = express();

app.use(express.json())

app.use("/auth", auth)


export default app;


