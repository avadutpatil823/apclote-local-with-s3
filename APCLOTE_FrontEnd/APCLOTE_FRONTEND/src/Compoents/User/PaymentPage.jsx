import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { SyncLoader } from "react-spinners";
import { toast } from "react-toastify";
import { buildApiUrl } from "../../config/api";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { poId } = location.state;
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        buildApiUrl(`/payment/createOrder?poId=${poId}`),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`,
          },
        }
      );

      const { orderId, amount, currency, key, purchaseOrderId } = res.data;

      const options = {
        key,
        amount: Math.round(amount * 100),
        currency,
        name: "APCLOTE Online Coaching",
        description: "Course purchase",
        order_id: orderId,
        handler: async function (response) {
          setLoading(true);
          try {
            const verifyRes = await axios.post(
              buildApiUrl("/payment/verify"),
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                purchaseOrderId,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`,
                },
              }
            );

            if (verifyRes.data.status === "success") {
              toast.success("Payment successful and verified!");
              navigate("/myBatchs");
            } else {
              toast.error("Payment succeeded but verification failed.");
              navigate("/myBatchs");
            }
          } catch (err) {
            toast.error("Verification request failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "Avadut Patil",
          email: "test@example.com",
          contact: "9999999999",
        },
        notes: {
          purchase_order_id: purchaseOrderId,
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: {
          color: "#06b6d4",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error("Unable to create order");
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-content">
        <div className="form-shell surface-panel space-y-6">
          <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Checkout</span>
          <h2 className="title-dark text-3xl">Complete Payment for Order {poId}</h2>
          <p className="subtle-text">
            Continue to the Razorpay checkout window to finish the purchase securely.
          </p>
          <button disabled={loading} onClick={handlePayment} className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-70">
            <span className="flex items-center justify-center gap-3">
              {loading ? <SyncLoader color="white" size={8} /> : null}
              <span>{loading ? "Processing..." : "Pay Now"}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
