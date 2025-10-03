// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // points to backend
});

export default api;
