import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Products = () => {
  const navigate = useNavigate();

  // State for products, search term, and product quantities
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState({});

  // Check login status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.status !== 200) {
          navigate("/login");
        } else {
          // Optionally, you could also store the username from data.username
          fetchProducts();
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);

  // Fetch products from the backend
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/list-products`, {
        credentials: "include",
      });
      const data = await response.json();
      if (response.status === 200) {
        // Sort products by product_id in ascending order
        const sortedProducts = data.products.sort(
          (a, b) => a.product_id - b.product_id
        );
        setProducts(sortedProducts);
        // Initialize quantities for each product as 1
        const initialQuantities = {};
        sortedProducts.forEach((product) => {
          initialQuantities[product.product_id] = 1;
        });
        setQuantities(initialQuantities);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Handle quantity changes for each product
  const handleQuantityChange = (productId, change) => {
    setQuantities((prevQuantities) => {
      const currentQuantity = prevQuantities[productId] || 1;
      let newQuantity = currentQuantity + change;
      if (newQuantity < 1) newQuantity = 1;
      // Check if new quantity exceeds the available stock
      const product = products.find((p) => p.product_id === productId);
      if (product && newQuantity > product.stock_quantity) {
        alert(`Requested quantity exceeds available stock for ${product.name}.`);
        newQuantity = product.stock_quantity;
      }
      return { ...prevQuantities, [productId]: newQuantity };
    });
  };

  // Add a product to the cart with the selected quantity
  const addToCart = async (productId) => {
    try {
      const quantity = quantities[productId] || 1;
      const response = await fetch(`${apiUrl}/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  // Handle search form submission (filtering is done during rendering)
  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Filter products based on the search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div>
        <h1>Product List</h1>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Stock Available</th>
              <th>Quantity</th>
              <th>Add to Cart</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.product_id}>
                <td>{product.product_id}</td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.stock_quantity}</td>
                <td>
                  <button
                    onClick={() =>
                      handleQuantityChange(product.product_id, -1)
                    }
                  >
                    -
                  </button>
                  <span style={{ margin: "0 10px" }}>
                    {quantities[product.product_id]}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(product.product_id, 1)
                    }
                  >
                    +
                  </button>
                </td>
                <td>
                  <button onClick={() => addToCart(product.product_id)}>
                    ADD TO CART
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Products;
