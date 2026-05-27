import express from "express";
import auth from './routes/auth.js';
import category from './routes/category.js';
import transaksi from './routes/transaksi.js';
import dotenv from "dotenv"
import "./config/database.js"
import corsMiddleware from "./middleware/cors.js"

dotenv.config()

const app = express();

app.use(corsMiddleware)
app.use(express.json())

app.use("/api/v1/auth", auth);        
app.use("/api/v1/category", category)
app.use("/api/v1/transaksi", transaksi);


export default app;


