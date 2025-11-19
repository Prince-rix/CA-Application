const express = require("express");
const app = express();
require("dotenv").config();


const Port = process.env.PORT 
const { connectionDb } = require("./config/dbconnection");
const router = require("./routes/router");
const cors = require("cors");


app.use(cors({ origin: "http://localhost:3001" }));
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use("/api",router)




app.use((err, req, res, next) => {
    console.error(err); // log full error
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});


connectionDb();

app.listen(Port,()=>{
    console.log(`Running on Port ${Port}`)
})