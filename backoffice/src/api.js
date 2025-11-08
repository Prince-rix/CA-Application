import axios from "axios";

// Change port if your backend is different
const API_URL = "http://localhost:3001/api";

export const createUser = async (data) => {
  return axios.post(`${API_URL}/user`, data);
};
