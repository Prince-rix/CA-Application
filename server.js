const express = require("express");
const app = express();
require("dotenv").config();
console.log(process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME, process.env.DB_HOST);

const Port = process.env.PORT
const { connectionDb } = require("./api/config/dbconnection");
const router = require("./api/routes/router");
const cors = require("cors");


app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/api",router)







connectionDb();

app.listen(Port,()=>{
    console.log(`Running on Port ${Port}`)
})