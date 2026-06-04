import axios from "axios";
import { decryptResponse } from "./utils/decrypt"; 

// ==========================================
// 📡 CONFIGURATIONS & ENVIRONMENT ANCHORS
// ==========================================
export const API_BASE_URL = "https://backend.debatehub.in/";
export const API_BASE_URL2 = "https://backend.debatehub.in";
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
// 🏦 BANK DETAILS & WINNINGS WITHDRAWALS
// ==========================================
export const getRandomUPI = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}api/upi/random`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  } catch (err) {
    console.error("Error fetching random UPI", err);
    return { success: false, message: "Network error" };
  }
};
export const QRrandom = async () => {
  const data = await fetch(`${API_BASE_URL}QR/api/qr/random`);
  return data;
};
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
// ==========================================
// 📊 MCQ PRODUCT MARKETPLACE MODULES
// ==========================================

// Fetch active prediction questions (Supports dynamic category & subCategory query filters)
export const getLiveProductsFeed = async (category = "", subCategory = "") => {
  try {
    const params = {};
    if (category) params.category = category;
    if (subCategory) params.subCategory = subCategory;

    const res = await axios.get(`${API_BASE_URL}api/products`, { params });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch products feed matrix:", err);
    throw err.response?.data || err;
  }
};

// Fetch a single MCQ product contract view block context by ID
export const getProductById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE_URL}api/products/getProductById`, {
      params: { id },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch targeted product record:", err);
    throw err.response?.data || err;
  }
};
// ==========================================
// 💸 TRANSACTIONAL PURCHASE & SETTLEMENT MODULES
// ==========================================

export const placeMarketPrediction = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE_URL}api/purchases`, payload);
    return res.data;
  } catch (err) {
    console.error("Failed to execute market position allocation stake:", err);
    throw err.response?.data || err;
  }
};

export const settleMarketPosition = async (questionId) => {
  try {
    const res = await axios.put(`${API_BASE_URL}api/purchases/settle/${questionId}`);
    return res.data;
  } catch (err) {
    console.error("Failed to run contract resolution settlement engine:", err);
    throw err.response?.data || err;
  }
};

export const getUserPurchaseHistory = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}api/purchases/user/${userId}`);
    return res.data;
  } catch (err) {
    console.error("Failed to compile target profile's trade portfolio passbook:", err);
    throw err.response?.data || err;
  }
};

export const getuserData = async (userId)=>{
  try {
    const res =await axios.get(`${API_BASE_URL}api/users/details/${userId}`);
    return res.data;
  } catch (error) {
    console.log(error)
  }
}