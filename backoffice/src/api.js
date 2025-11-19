import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

// CREATE USER
export const createUser = (data) => API.post("/user", data);

// CREATE ORDER
export const createOrder = (data) => API.post("/create/order", data);

// VERIFY PAYMENT
export const verifyPayment = (data) => API.post("/payment/success", data);

// export default { createUser, createOrder, verifyPayment };
const apiService = {
  createUser,
  createOrder,
  verifyPayment
};

export default apiService;
