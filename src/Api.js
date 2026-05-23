import axios from "axios";
import { decryptResponse } from "./utils/decrypt"; 

// ==========================================
// 📡 CONFIGURATIONS & ENVIRONMENT ANCHORS
// ==========================================
export const API_BASE_URL = "http://localhost:5004/";
export const API_BASE_URL2 = "http://localhost:5004";
export const SECRET_KEY = "SECRET_KEY12356789";

// ==========================================
// 🔒 SYSTEM AUTHENTICATION MODULES
// ==========================================

export const verifyRegisterOtpCheck = async (phone) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/users/verifyRegisterOtp`, { phone });
    
    // Auto decrypt interceptor maps encrypted payloads seamlessly
    if (res.data && res.data.payload) {
      const decrypted = decryptResponse(res.data.payload);
      return typeof decrypted === "string" ? JSON.parse(decrypted) : decrypted;
    }
    return res.data;
  } catch (err) {
    console.error("Signup validation check failure:", err);
    if (err.response?.data?.payload) {
      const decryptedErr = decryptResponse(err.response.data.payload);
      return typeof decryptedErr === "string" ? JSON.parse(decryptedErr) : decryptedErr;
    }
    throw err.response?.data || err;
  }
};

export const registerUser = async (userData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/users/register`, userData);
    return res.data;
  } catch (err) {
    console.error("Error registering user:", err);
    throw err;
  }
};

export const loginUser = async (credentials) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/users/login`, credentials);
    return res.data;
  } catch (err) {
    console.error("Error logging in:", err);
    throw err;
  }
};

export const getUserInfo = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}api/users/user`, {
    params: { userId },
  });
  return res;
};

export const tokenVerify = async (token, phone) => {
  const res = await axios.get(`${API_BASE_URL}api/users/tokenVerify`, {
    params: { token, phone },
  });
  return res;
};

export const sendOtpNoCheck = async (phone) => {
  const res = await fetch(`${API_BASE_URL}api/users/sendOtp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const json = await res.json();
  return decryptResponse(json.payload);
};

// ==========================================
// 📈 PROBO PREDICTION MARKETPLACE MODULES
// ==========================================

export const getLiveStocksFeed = async (limit = 0) => {
  try {
    const res = await axios.get(`${API_BASE_URL}api/stocks`, { params: { limit } });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getStockById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE_URL}api/stocks/getProductById`, { params: { id } });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const buyStockShares = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/trades/api/buy-stock`, payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const exitStockPositionEarly = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/trades/api/sell-stock`, payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// ==========================================
// 🏦 BANK DETAILS & WINNINGS WITHDRAWALS
// ==========================================

export const GetBankDetails = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}api/withdraw/bank`, { params: { userId } });
  return res;
};

export const addBankDetails = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/withdraw/bank-details`, payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateBankDetails = async (payload) => {
  try {
    const res = await axios.put(`${API_BASE_URL}api/withdraw/bank-details/${payload.userId}`, payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const withdrawReq = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/withdraw`, payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// ==========================================
// 💳 GATEWAY DEPOSITS & RECHARGES MODULES
// ==========================================

export const QRrandom = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}api/trades/api/qr/random`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const RechargeBalence = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/trades/api/recharge`, payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getUserStatementHistory = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}api/users/purchase`, { params: { userId } });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};