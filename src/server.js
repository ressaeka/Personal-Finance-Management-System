import app from "./app.js";

const port = process.env.PORT || 3000;
const host = process.env.HOST === "production" ? "0.0.0.0" : "localhost";

app.listen(port, host, () => {
    console.log(`Server is running http://${host}:${port}`)
})





