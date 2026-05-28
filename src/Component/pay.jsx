import React, { useState, useEffect, useRef } from "react";
import {
  Smile,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,

  ArrowLeft,
} from "lucide-react";
import "./pay.css";
import { getRandomUPI, QRrandom, RechargeBalence, SECRET_KEY } from "../api";
import { useLocation, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import pako from "pako";


const QRCode = async () => {
  const res = await QRrandom();
  if (!res.ok) return;
  const selectedItem = await res.json();
  console.log(selectedItem);
  return {
    filename: selectedItem.filename,
    url: selectedItem.url,
  };
};

const Pay = () => {
  const location = useLocation();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrImageName, setQrImageName] = useState("");
  const [upiId, setupiId] = useState("");
  const [payeeName, setPayeeName] = useState("Guest Name");
  const [utr, setUtr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [price, setprice] = useState(location.state ?? 0);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [timer, setTimer] = useState(300); // countdown (in seconds)
  const [user, setuser] = useState(null); 
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // 🧩 Fetch new QR code
  const fetchQRCode = async () => {
    
    setMessage({ text: "Fetching latest QR code...", type: "info" });
    try {
      const data = await QRCode();
      setQrCodeUrl(data.url);
      setQrImageName(data.filename);
      setMessage({
        text: "QR Code loaded. Please complete payment within 1 minute.",
        type: "info",
      });
    } catch (error) {
      setMessage({
        text: "Failed to load QR code. Please refresh.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔐 Get user data
  const getUserData = async() => {
    const encryptedUser = Cookies.get("proboWebUser");
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
                const data = await JSON.parse(decompressed);
                setuser(data)
                setIsLoading(true);
      if (!data?._id) navigate("/login");
    }
  };
// --- Constants ---


const currency = "INR";

const isMobileDevice = () =>
  /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const initiatePayment = (appName) => {
  let currentAmount = String(price).trim();

  if (!upiId) {
    setMessage({ text: "UPI ID is missing. Cannot proceed.", type: "error" });
    return;
  }

  if (!currentAmount || parseFloat(currentAmount) <= 0) {
    currentAmount = "1.00"; // default minimum amount
  }

  const formattedAmount = parseFloat(currentAmount).toFixed(2);
  const transactionNote = `Recharge for User ${user?._id || "Guest"} via ${appName}`;

  // ✅ Prepare URL Params
  const params = new URLSearchParams();
  params.append("pa", upiId);
  params.append("pn", payeeName);
  params.append("am", formattedAmount);
  params.append("cu", currency);
  params.append("tn", transactionNote);

  // ✅ Handle Paytm separately using Intent-based scheme
  if (appName === "Paytm") {
    const intentUrl = `intent://upi/pay?${params.toString()}#Intent;scheme=paytm;package=net.one97.paytm;end;`;

    if (isMobileDevice()) {
      console.log("Opening Paytm Intent:", intentUrl);

      window.location.href = intentUrl;

      // Fallback after 2.5s
      setTimeout(() => {
        setMessage({
          text: "Paytm app not detected. Opening Paytm website...",
          type: "info",
        });
        window.open("https://paytm.com/", "_blank");
      }, 2500);

      setMessage({
        text: `Opening Paytm app to pay ₹${formattedAmount}...`,
        type: "info",
      });
    } else {
      window.open("https://paytm.com/", "_blank");
      setMessage({
        text: "Opening Paytm website. Please scan QR or pay manually.",
        type: "info",
      });
    }

    return; // stop further execution
  }

  // ✅ PHONEPE and OTHER APPS
  let schemeBase;

  if (appName === "PhonePe") {
    schemeBase = "phonepe://pay?";
  } else {
    schemeBase = "upi://pay?";
  }

  const upiUrl = schemeBase + params.toString();

  if (isMobileDevice()) {
    console.log(`Trying to open ${appName}: ${upiUrl}`);

    window.location.href = upiUrl;

    // Fallback if app not found
    setTimeout(() => {
      setMessage({
        text: `${appName} not detected. Opening website instead...`,
        type: "info",
      });

      if (appName === "PhonePe")
        window.open("https://www.phonepe.com/", "_blank");
    }, 2500);

    setMessage({
      text: `Opening ${appName} app to pay ₹${formattedAmount}...`,
      type: "info",
    });
  } else {
    // ✅ Desktop Fallback
    let fallbackUrl = "";

    if (appName === "PhonePe") fallbackUrl = "https://www.phonepe.com/";

    if (fallbackUrl) {
      window.open(fallbackUrl, "_blank");
      setMessage({
        text: `Opening ${appName} website. Please scan QR or pay manually.`,
        type: "info",
      });
    } else {
      setMessage({
        text: "Could not determine redirect URL.",
        type: "error",
      });
    }
  }
};

const GetUPI=async()=>{ const res=await getRandomUPI();
  console.log(res);
  if(res.success){
setupiId(res?.data?.upiId||"Q065208051@ybl")
setPayeeName(res?.data?.payeeName||"Guest Name")
  }
}
  // 🚀 Initial setup
  useEffect(() => {
   GetUPI();
    getUserData();
    fetchQRCode();
    setTimer(300);
  }, []);

  // ⏱ Countdown effect
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // 🔁 When timer hits 0, fetch new QR and reset timer
  useEffect(() => {
    if (timer === 0) {
      GetUPI();
      fetchQRCode(); // fetch new QR
      setTimer(300); // restart countdown
    }
  }, [timer]);
const minutes = Math.floor(timer / 60);
const seconds = timer % 60;
  // Inline styles
  const containerStyle = {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  };

  const itemStyle = {
    backgroundColor: "#F4F4F5",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #D1D1D6",
    width: "48%",
    cursor: "pointer",
  };

  const innerFlex = { display: "flex", alignItems: "center", gap: "10px" };
  const textStyle = { color: "#0F0F0F", fontSize: "12px", fontWeight: 500 };
  const imageStyle = { width: "24px", height: "auto" };

  // 🧾 Submit UTR
  const handleSubmit = async (e) => {
    e.preventDefault();
     if (isLoading) return;
    setIsLoading(true);

    setMessage({ text: "Submitting UTR for verification...", type: "info" });
    try {
      const payload = { userId: user?._id, amount: price, utr, qrImageName };
   
      const res = await RechargeBalence(payload);

      if (!res.status) throw new Error("Payment request failed");

      setMessage({
        text: "Payment submitted successfully! Awaiting approval.",
        type: "success",
      });
      setUtr("");
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      setMessage({
        text: `Submission failed: ${error.message || "Server error."}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Message component
  const MessageDisplay = ({ text, type }) => {
    if (!text) return null;
    let icon, cssClass;
    switch (type) {
      case "success":
        icon = <CheckCircle />;
        cssClass = "msg success";
        break;
      case "error":
        icon = <AlertTriangle />;
        cssClass = "msg error";
        break;
      default:
        icon = <Smile />;
        cssClass = "msg info";
    }
    return (
      <div className={cssClass}>
        {icon}
        <p>{text}</p>
      </div>
    );
  };

  return (
    <div className="pay-container">
       <div className="header2">
              <button className="back-btnR" onClick={() => navigate(-1)}>
                <ArrowLeft color="black" />
              </button>
              <h1 className="header-title">Recharge</h1>
              <div className="spacer"></div>
            </div>

      <div className="pay-card">
        <header className="pay-header">
          <h3>₹{price}</h3>
        </header>

     <div style={containerStyle}>
  <div style={itemStyle} onClick={() => initiatePayment("Paytm")}>
    <div style={innerFlex}>
      <img
        src="https://img.icons8.com/?size=100&id=zB8j6RfneRmV&format=png&color=000000"
        alt="Paytm"
        style={imageStyle}
      />
      <p style={textStyle}>Paytm</p>
    </div>
  </div>

  <div style={itemStyle} onClick={() => initiatePayment("PhonePe")}>
    <div style={innerFlex}>
      <img
        src="https://img.icons8.com/?size=100&id=OYtBxIlJwMGA&format=png&color=000000"
        alt="PhonePe"
        style={imageStyle}
      />
      <p style={textStyle}>PhonePe</p>
    </div>
  </div>
</div>


        {/* QR Section */}
        <section className="qr-section">
          <h2>Use Mobile Scan Code to Pay</h2>
          <p>
            Or take screenshot and scan in your payment app.
            <br />
            <Clock size={14} style={{ marginRight: 4 }} />
            QR will expire in <strong>{minutes}:{seconds.toString().padStart(2, "0")} Minutes Left</strong>
          </p>

          <div className="qr-box">
            {isLoading && !qrCodeUrl ? (
              <div className="qr-loading">
                <Loader2 className="spin" />
                <p>Loading QR...</p>
              </div>
            ) : (
              qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/160x160/F7F7F7/333333?text=QR+Error";
                  }}
                />
              )
            )}
          </div>

          <div className="qr-warning">
            ⚠️ Do not use the same QR code multiple times
            
            
          </div>
      
          {isLoading && !qrCodeUrl ? (
              <div className="qr-loading">
                <Loader2 className="spin" />
                <p>Loading QR...</p>
              </div>
            ):(<span>UPI Id: {upiId}</span>)}
        </section>

        {/* UTR Section */}
        <section className="utr-section">
          <h3>Enter Ref No. and Submit</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="Enter Your UTR..."
              required
              disabled={isLoading || message.type === "success"}
            />
            <button
              type="submit"
              disabled={isLoading || !utr.trim() || message.type === "success"}
            >
              {isLoading ? <Loader2 className="spin" /> : "Submit"}
            </button>
          </form>

          <MessageDisplay text={message.text} type={message.type} />
        </section>
      </div>
    </div>
  );
};

export default Pay;
