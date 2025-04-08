import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/OrderConfirmation.css";

const OrderConfirmation = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          navigate("/login");
        } else {
          fetchOrderConfirmation();
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);

  const fetchOrderConfirmation = async () => {
    try {
      const response = await fetch(`${apiUrl}/order-confirmation`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setOrderDetails({
          orderId: data.order.order_id,
          orderDate: data.order.order_date,
          totalAmount: data.order.total_amount,
          // Sort order items in increasing order by product_id
          items: data.orderItems.sort((a, b) => a.product_id - b.product_id),
        });
      } else {
        setError(data.message || "Failed to fetch order details.");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Error fetching order details.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="order-confirmation-container">
        {error && <p className="error">{error}</p>}

        {orderDetails ? (
          <div className="order-confirmation">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>

            {/* Order Summary in Tabular Format */}
            <table className="order-info-table">
              <tbody>
                <tr>
                  <td><strong>Order ID:</strong></td>
                  <td>{orderDetails.orderId}</td>
                </tr>
                <tr>
                  <td><strong>Order Date:</strong></td>
                  <td>{orderDetails.orderDate}</td>
                </tr>
                <tr>
                  <td><strong>Total Amount:</strong></td>
                  <td>${orderDetails.totalAmount}</td>
                </tr>
              </tbody>
            </table>

            <h2>Products</h2>
            <table className="order-products-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items.map((product) => (
                  <tr key={product.product_id}>
                    <td>{product.product_id}</td>
                    <td>{product.product_name}</td>
                    <td>{product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className="continue-shopping-button"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <p>Loading order details...</p>
        )}
      </div>
    </>
  );
};

export default OrderConfirmation;
