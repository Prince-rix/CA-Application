const express = require("express");
const app = express();
require("dotenv").config();
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