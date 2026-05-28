import React, { useEffect, useState } from "react";
import "./Withdraw.css";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import {
  addBankDetails,
  GetBankDetails,
  SECRET_KEY,
  updateBankDetails,
  withdrawReq,
} from "../Api";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import pako from "pako";
const encryptedUser = Cookies.get("proboWebUser");

const Withdraw = () => {
  const navigate = useNavigate();

  const [bankDetails, setBankDetails] = useState(null);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // ✅ edit mode

  const [userId, setUserId] = useState("");
  const [holderName, setHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [upiId, setUpiId] = useState("");

  const [tradePassword, setTradePassword] = useState(""); // For withdrawal
  const [BUpTRadePassword, setBUpTRadePassword] = useState(""); // For bank update
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [responseMessage, setResponseMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const getUserId = async () => {
    if (encryptedUser) {
   
          const base64 = encryptedUser.replace(/-/g, "+").replace(/_/g, "/");
                    
                        // 🔹 3. AES decrypt (gives compressed Base64 string)
                        const decryptedBase64 = CryptoJS.AES.decrypt(base64, SECRET_KEY).toString(CryptoJS.enc.Utf8);
                        if (!decryptedBase64) return null;
                    
                        // 🔹 4. Convert Base64 → Uint8Array (binary bytes)
                        const binaryString = atob(decryptedBase64);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                          bytes[i] = binaryString.charCodeAt(i);
                        }
                    
                        // 🔹 5. Decompress (restore JSON string)
                        const decompressed = pako.inflate(bytes, { to: "string" });
                    const UserData = await JSON.parse(decompressed);
                   
       setUserId(UserData?._id);
         setIsLoading(false);
      return UserData?._id;
    }
      return null;
    
  };

  const fetchBankDetails = async () => {
    try {
      const id = await getUserId();
      const res = await GetBankDetails(id);
  
      if (res.data.bankDetails && Object.keys(res.data.bankDetails).length > 0) {
        setHasBankDetails(true);
        setBankDetails(res.data.bankDetails);
        setHolderName(res.data.bankDetails.holderName || "");
        setAccountNumber(res.data.bankDetails.accountNumber || "");
        setIfscCode(res.data.bankDetails.ifscCode || "");
        setBankName(res.data.bankDetails.bankName || "");
        setUpiId(res.data.bankDetails.upiId || "");
        setBalance(res.data.Withdrawal || 0);
      } else {
        setHasBankDetails(false);
        setBalance(res.data.Withdrawal || 0);
      }
    } catch (err) {
      setResponseMessage({
        type: "error",
        message: err.response?.data?.message || "Failed to fetch bank details",
      });
    }
  };

  useEffect(() => {
    getUserId();
    fetchBankDetails();
  }, []);

  const handleAddBank = async () => {
    if (!holderName || !accountNumber || !ifscCode || !bankName) return alert("Fill all required fields");
    try {
      const res = await addBankDetails({ userId, holderName, accountNumber, ifscCode, bankName, upiId });
      setHasBankDetails(true);
           
      setBankDetails(res?.bankDetails);
      setIsAdding(false);
      setResponseMessage({ type: "success", message: res.message });
    } catch (err) {
      setResponseMessage({ type: "error", message: err.response?.message || "Failed to add bank details" });
    }
  };

  const handleUpdateBank = async () => {
    if (!BUpTRadePassword) return alert("Enter trade password to update bank details");
    try {
      const res = await updateBankDetails({
        userId,
        tradePassword: BUpTRadePassword,
        bankDetails: { holderName, accountNumber, ifscCode, bankName, upiId },
      });
      
  setResponseMessage({ type: "error", message: err.response?.data?.message || "Bank update failed" });
 
      setBankDetails(res?.data?.bankDetails);
      setResponseMessage({ type: "success", message: res.data.message });
      setBUpTRadePassword("");
      setIsEditing(false); // ✅ exit edit mode
    } catch (err) {
      setResponseMessage({ type: "error", message: err.response?.data?.message || "Bank update error" });
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || !tradePassword) return alert("Enter amount and trade password");
    try {
      const res = await withdrawReq({ userId, tradePassword, amount: withdrawalAmount, bankDetails });
      setBalance((prev) => prev - withdrawalAmount);
      setTradePassword("");
      setWithdrawalAmount("");
      setResponseMessage({ type: "success", message: res.data.message });
    } catch (err) {
      console.log(err.message)
      setResponseMessage({ type: "error", message: err.message || "Withdrawal failed" });
    }
  };

  return (
    <div className="app-container">
      <div className="header2">
        <button className="back-btnR" onClick={() => navigate(-1)}>
          <ArrowLeft color="black" />
        </button>
        <h1 className="header-title">Withdraw</h1>
        <div className="spacer"></div>
      </div>

      <div className="main-content">
        <div className="card0 withdrawal-form-card">
          <div className="balance-info">
            <span className="balance-label">Withdrawal Balance:</span>
            <span className="balance-amount">₹ {balance || 0}</span>
          </div>

          <div className="input-group">
            {responseMessage && <div className={`response-card ${responseMessage.type}`}>{responseMessage.message}</div>}

            {/* Bank Details */}
            {!hasBankDetails ? (
              <>
                {!isAdding ? (
                  <button className="apply-button" onClick={() => setIsAdding(true)}>
                    + Add Bank Details
                  </button>
                ) : (
                  <>
                    <input type="text" className="input-field" placeholder="Account Holder Name" value={holderName} onChange={(e) => setHolderName(e.target.value)} />
                    <input type="number" className="input-field" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                    <input type="text" className="input-field" placeholder="IFSC Code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} />
                    <input type="text" className="input-field" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                    <input type="text" className="input-field" placeholder="UPI ID (Optional)" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                    <div className="btn-group">
                      <button onClick={handleAddBank} className="apply-button">Save</button>
                      <button onClick={() => setIsAdding(false)} className="cancel-button">Cancel</button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div>
                <span className="balance-label">My Bank Details</span>
                {isEditing ? (
                  <>
                    <input type="text" className="input-field" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Holder Name" />
                    <input type="number" className="input-field" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account Number" />
                    <input type="text" className="input-field" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} placeholder="IFSC Code" />
                    <input type="text" className="input-field" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank Name" />
                    <input type="text" className="input-field" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="UPI ID (Optional)" />
                    <input type="password" className="input-field mt-2" placeholder="Trade Password" value={BUpTRadePassword} onChange={(e) => setBUpTRadePassword(e.target.value)} />
                    <div className="btn-group">
                      <button onClick={handleUpdateBank} className="apply-button">Save</button>
                      <button onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p><b>Holder:</b> {bankDetails.holderName??""}</p>
                    <p><b>Account:</b> {bankDetails.accountNumber??""}</p>
                    <p><b>IFSC:</b> {bankDetails.ifscCode??""}</p>
                    <p><b>Bank:</b> {bankDetails.bankName??""}</p>
                    {bankDetails.upiId && <p><b>UPI:</b> {bankDetails.upiId??""}</p>}
                    <button onClick={() => setIsEditing(true)} className="apply-button">Edit</button>
                  </>
                )}
              </div>
            )}

            {/* Withdrawal */}
            {hasBankDetails && (
              <>
                <input type="number" className="input-field" placeholder="Withdrawal Amount" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} />
                <input type="password" className="input-field" placeholder="Trade Password" value={tradePassword} onChange={(e) => setTradePassword(e.target.value)} />
                <button onClick={handleWithdrawal} disabled={isLoading} className="apply-button">{isLoading ? <Loader2 className="spin" /> : "Apply Withdrawal"} </button>
              </>
            )}

            {/* Rules */}
            <div className="explanation">
              <h2 className="explanation-title">Explain</h2>
              <ol className="rules-list">
                <li>Daily marketing from 00:00:00 to 23:59:59.</li>
                <li>Withdraw amount between 300 to 500000.</li>
                <li>Only one withdrawal per day.</li>
                <li>Withdrawal rate 5%.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
