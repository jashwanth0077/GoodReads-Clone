import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Cart.css";
import Navbar from "../components/Navbar";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
 const [error, setError] = useState(null);
 const [message, setMessage] = useState("");
 const [pincode, setPincode] = useState("");
 const [street, setStreet] = useState("");
 const [city, setCity] = useState("");
 const [state, setState] = useState("");

 const navigate = useNavigate();

  // TODO: Implement the checkStatus function
  // If the user is already logged in, fetch the cart.
  // If not, redirect to the login page.
  useEffect(() => {
   

    const checkStatus = async () => {
      // Implement your logic to check if the user is logged in
      // If logged in, fetch the cart data, otherwise navigate to /login
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, { credentials: "include" });
        const data = await response.json();
        if (!response.ok) {
          navigate("/login");
        } else {
          fetchCart();
        }
      } catch (err) {
        setError("Failed to check authentication.");
      }
    };
    checkStatus();
  }, [navigate]);

  // TODO: Manage cart state with useState
  // cart: Stores the items in the cart
  // totalPrice: Stores the total price of all cart items
  // error: Stores any error messages (if any)
  // message: Stores success or info messages
  

  // TODO: Implement the fetchCart function
  // This function should fetch the user's cart data and update the state variables
  const fetchCart = async () => {
    // Implement your logic to fetch the cart data
    // Use the API endpoint to get the user's cart
    try {
      const response = await fetch(`${apiUrl}/display-cart`, { method: "GET",credentials: "include" ,});
      const data = await response.json();

      if (response.ok) {
        // data.sort((a, b) => a.product_id - b.product_id);
        // setCart(data);
        // calculateTotal(data);
        const { cart, totalPrice } = data;
        setCart(cart.sort((a, b) => a.product_id - b.product_id));
        setTotalPrice(totalPrice);
        console.log(totalPrice);
      } else {
        setError(data.message || "Failed to fetch cart.");
      }
    } catch (err) {
      setError("Error fetching cart data.");
    }
  };

  
  

  // TODO: Implement the updateQuantity function
  // This function should handle increasing or decreasing item quantities
  // based on user input. Make sure it doesn't exceed stock limits.
  const updateQuantity = async (productId, change, currentQuantity, stockQuantity) => {
    // const newQuantity = currentQuantity + change;
    const newQuantity = change;
    if (newQuantity+currentQuantity < 1 || newQuantity+currentQuantity > stockQuantity) {
      // setError("Insufficient Stock Quantity");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/update-cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: newQuantity+currentQuantity }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchCart();
      } else {
        setError(data.message || "Failed to update quantity.");
      }
    } catch (err) {
      console.error("Error updating quantity.");
    }
  };

  // TODO: Implement the removeFromCart function
  // This function should remove an item from the cart when the "Remove" button is clicked
  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`${apiUrl}/remove-from-cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({product_id: productId }),
      });

      if (response.ok) {
        setMessage("Item removed from cart.");
        fetchCart();
      } else {
        setError("Failed to remove item.");
      }
    } catch (err) {
      setError("Error removing item.");
    }
  };

  // TODO: Implement the handleCheckout function
  // This function should handle the checkout process and validate the address fields
  // If the user is ready to checkout, place the order and navigate to order confirmation
  const handleCheckout = async () => {
    if (!street || !pincode || !city || !state) {
      setError("Please enter a complete address.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/place-order`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, address: { street, city, state, pincode } }),
      });

      if (response.ok) {
        setMessage("Order placed successfully!");
        setCart([]);
        setTotalPrice(0);
        navigate("/order-confirmation");
      } else {
        setError("Failed to place order.");
      }
    } catch (err) {
      setError("Error during checkout.");
    }
  };
  // TODO: Implement the handlePinCodeChange function
  // This function should fetch the city and state based on pincode entered by the user
  const handlePinCodeChange = async (e) => {
    const newPincode = e.target.value;
    setPincode(newPincode);

    if (newPincode.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${newPincode}`);
        const data = await response.json();

        if (data[0].Status === "Success") {
          setCity(data[0].PostOffice[0].Name);
          setState(data[0].PostOffice[0].State);
        } else {
          setCity("");
          setState("");
          setError("Invalid pincode.");
        }
      } catch (err) {
        setError("Failed to fetch address data.");
      }
    } else {
      setCity("");
      setState("");
    }
  };
  // TODO: Display error messages if any error occurs
  if (error) {
    return <div className="cart-error">{error}</div>;
  }

  return (
    <>
    <Navbar />
    <div className="cart-container">
      <h1>Your Cart</h1>

      {message && <div className="cart-message">{message}</div>}

      {cart.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock Available</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.item_id}>
                  <td>{item.product_name}</td>
                  <td>${item.unit_price}</td>
                  <td>{item.stock_quantity-item.quantity}</td>
                  <td>
                    <button onClick={() => updateQuantity(item.item_id, -1, item.quantity, item.stock_quantity-item.quantity)}>-</button>
                    {item.quantity}
                    <button onClick={() => updateQuantity(item.item_id, 1, item.quantity, item.stock_quantity-item.quantity)}>+</button>
                  </td>
                  <td>${item.unit_price * item.quantity}</td>
                  <td>
                    <button onClick={() => removeFromCart(item.item_id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <form className="address-form">
            <h3>Shipping Address</h3>
            <input type="text" placeholder="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} required />
            <input type="text" placeholder="Pincode" value={pincode} onChange={handlePinCodeChange} required />
            <input type="text" placeholder="City" value={city} readOnly />
            <input type="text" placeholder="State" value={state} readOnly />
          </form>

          <div className="cart-total">
            <h3>Total: ${totalPrice}</h3>
            <button onClick={handleCheckout} disabled={cart.length === 0}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default Cart;