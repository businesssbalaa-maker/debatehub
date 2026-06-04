import { useEffect, useState, useRef } from "react";
import {
  Smile,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import "./pay.css";
import { getRandomUPI, QRrandom, RechargeBalence, SECRET_KEY } from "../Api";
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
  const navigate = useNavigate();
  const timerRef = useRef(null);

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

  // 🧩 Fetch new QR code
  const fetchQRCode = async () => {
    setMessage({ text: "Fetching latest QR code...", type: "info" });
    try {
      const data = await QRCode();
      setQrCodeUrl(data.url);
      setQrImageName(data.filename);
      setMessage({
        text: "QR Code loaded. Please complete payment within the time limit.",
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
    const encryptedUser = Cookies.get("2ndtredingWebUser");
    if (encryptedUser) {
      const base64 = encryptedUser.replace(/-/g, "+").replace(/_/g, "/");
      const decryptedBase64 = CryptoJS.AES.decrypt(base64, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      if (!decryptedBase64) return null;
      
      const binaryString = atob(decryptedBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const decompressed = pako.inflate(bytes, { to: "string" });
      const data = await JSON.parse(decompressed);
      setuser(data);
      setIsLoading(true);
      if (!data?._id) navigate("/login");
    } else {
      const backupUid = localStorage.getItem("userId");
      if (backupUid) setuser({ _id: backupUid });
    }
  };

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
      currentAmount = "1.00";
    }

    const formattedAmount = parseFloat(currentAmount).toFixed(2);
    const transactionNote = `Recharge for User ${user?._id || "Guest"} via ${appName}`;

    const params = new URLSearchParams();
    params.append("pa", upiId);
    params.append("pn", payeeName);
    params.append("am", formattedAmount);
    params.append("cu", currency);
    params.append("tn", transactionNote);

    if (appName === "Paytm") {
      const intentUrl = `intent://upi/pay?${params.toString()}#Intent;scheme=paytm;package=net.one97.paytm;end;`;

      if (isMobileDevice()) {
        window.location.href = intentUrl;
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
      return;
    }

    let schemeBase = appName === "PhonePe" ? "phonepe://pay?" : "upi://pay?";
    const upiUrl = schemeBase + params.toString();

    if (isMobileDevice()) {
      window.location.href = upiUrl;
      setTimeout(() => {
        setMessage({
          text: `${appName} not detected. Opening website instead...`,
          type: "info",
        });
        if (appName === "PhonePe") window.open("https://www.phonepe.com/", "_blank");
      }, 2500);

      setMessage({
        text: `Opening ${appName} app to pay ₹${formattedAmount}...`,
        type: "info",
      });
    } else {
      let fallbackUrl = appName === "PhonePe" ? "https://www.phonepe.com/" : "";
      if (fallbackUrl) {
        window.open(fallbackUrl, "_blank");
        setMessage({
          text: `Opening ${appName} website. Please scan QR or pay manually.`,
          type: "info",
        });
      } else {
        setMessage({
          text: "Desktop app links bypassed. Please complete payment using the master QR code below.",
          type: "info",
        });
      }
    }
  };

  const GetUPI = async () => {
    const res = await getRandomUPI();
    if (res.success) {
      setupiId(res?.data?.upiId || "Q065208051@ybl");
      setPayeeName(res?.data?.payeeName || "Guest Name");
    }
  };

  // 🚀 Initial setup
  useEffect(() => {
    GetUPI();
    getUserData();
    fetchQRCode();
  }, []);

  // ⏱ ✅ FIXED COUNTDOWN EFFECT: Structured clean tick parameters at exactly 1000ms execution frames
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // If interval window drops down to absolute zero limits, trigger reset events
          GetUPI();
          fetchQRCode();
          return 300; // Reset state back to a full 5 minutes sequence map cleanly
        }
        return prev - 1;
      });
    }, 1000); // Enforced 1 second delay execution pacing token

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // Bound strictly with empty anchors to prevent rerender execution cycles duplication

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

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
        text: "Payment submitted successfully! Awaiting manual ledger confirmation.",
        type: "success",
      });
      setUtr("");
      setTimeout(() => navigate(-1), 1200);
    } catch (error) {
      setMessage({
        text: `Submission failed: ${error.message || "Server verification error."}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const MessageDisplay = ({ text, type }) => {
    if (!text) return null;
    let icon, cssClass;
    switch (type) {
      case "success":
        icon = <CheckCircle size={16} />;
        cssClass = "msg success";
        break;
      case "error":
        icon = <AlertTriangle size={16} />;
        cssClass = "msg error";
        break;
      default:
        icon = <Smile size={16} />;
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
    <div className="pay-viewport">
      <div className="header2">
        <button className="back-btnR" onClick={() => navigate(-1)}>
          <ArrowLeft color="#ffffff" />
        </button>
        <h1 className="header-title">Checkout Gateway</h1>
        <div className="spacer"></div>
      </div>

      <div className="main-pay-layout">
        <div className="pay-card glass-panel">
          
          <header className="pay-header">
            <span className="pay-header-lbl">Order Pay Amount</span>
            <h3>₹{Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </header>

          <div className="intent-gateway-channels-container">
            <div className="intent-channel-item" onClick={() => initiatePayment("Paytm")}>
              <div className="channel-inner-flex">
                <img
                  src="https://img.icons8.com/?size=100&id=zB8j6RfneRmV&format=png&color=000000"
                  alt="Paytm"
                  className="channel-icon-vector"
                />
                <p className="channel-lbl-txt">Pay via Paytm</p>
              </div>
            </div>

            <div className="intent-channel-item" onClick={() => initiatePayment("PhonePe")}>
              <div className="channel-inner-flex">
                <img
                  src="https://img.icons8.com/?size=100&id=OYtBxIlJwMGA&format=png&color=000000"
                  alt="PhonePe"
                  className="channel-icon-vector"
                />
                <p className="channel-lbl-txt">Pay via PhonePe</p>
              </div>
            </div>
          </div>

          <section className="qr-section">
            <h2>Scan Merchant QR to Complete Payment</h2>
            <p className="qr-notice-para">
              Take a screenshot to import into your preferred payment application.
            </p>
            
            <div className="countdown-ticker-pill">
              <Clock size={14} className="timer-icon-pulse" />
              <span>Expires in: <strong>{minutes}:{seconds.toString().padStart(2, "0")} Mins Left</strong></span>
            </div>

            <div className="qr-box-wrapper">
              {isLoading && !qrCodeUrl ? (
                <div className="qr-loading-shimmer">
                  <Loader2 className="spin-animation-loop" />
                  <p>Generating dynamic merchant QR node...</p>
                </div>
              ) : (
                qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="Secure Matrix QR Code"
                    className="core-qr-image"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/200x200/13101d/ffffff?text=QR+Load+Error";
                    }}
                  />
                )
              )}
            </div>

            <div className="qr-warning-banner-text">
              ⚠️ Warning: Single-use QR string. Do not pay multiple times using the same code snippet.
            </div>
{/*             
            <div className="manual-upi-string-pill">
              <span className="upi-lbl">VPA String:</span>
              <span className="upi-val-text">{upiId || "Loading routing address..."}</span>
            </div> */}
          </section>

          <section className="utr-section">
            <h3>Enter 12-Digit UPI Ref / UTR Number</h3>
            <form onSubmit={handleSubmit} className="utr-form-matrix">
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter Transaction UTR (e.g., 6134...)"
                maxLength="12"
                required
                className="utr-text-field"
                disabled={isLoading || message.type === "success"}
              />
              <button
                type="submit"
                className="utr-submit-action-btn"
                disabled={isLoading || !utr.trim() || message.type === "success"}
              >
                {isLoading ? <Loader2 className="spin-animation-loop" /> : "Submit"}
              </button>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Pay;