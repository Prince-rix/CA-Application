const express = require("express");
const router = express.Router();
const userController = require("../controller/user_registers");

router.post("/user", userController.createUser);

module.exports = router;
