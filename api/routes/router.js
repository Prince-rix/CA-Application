const express = require("express");
const router = express.Router();
const userController = require("../controller/registrations");
const paymentController = require("../controller/payment")

router.post("/user", userController.createUser);
router.post("/create/order", paymentController.createOrder);
router.post("/payment/success", paymentController.verifyPayment);
router.post("/webhook", paymentController.webhook);

module.exports = router;
