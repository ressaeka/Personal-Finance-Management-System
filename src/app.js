import express from "express";
import auth from './routes/auth.js';
import category from './routes/category.js';
import dotenv from "dotenv"
import "./config/database.js"

dotenv.config()

const app = express();

app.use(express.json())

app.use("/api/v1/auth", auth);        
app.use("/api/v1/category", category)


export default app;


