const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const port = 4000;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: 'test',
  host: 'localhost',
  database: 'ecommerce',
  password: 'test',
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

/////////////////////////////////////////////////////////////
// Authentication APIs
// Signup, Login, IsLoggedIn and Logout

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
      return next();
  } else {
      return res.status(401).json({ message: "Unauthorized: Please log in first." });
  }
}


// TODO: Implement user signup logic
// return JSON object with the following fields: {username, email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/signup", async (req, res) => {
  try {
      const { username, email, password } = req.body;

      // Check if all required fields are provided
      if (!username || !email || !password) {
          return res.status(400).json({ message: "Error: All fields are required." });
      }

      // Check if the email already exists
      const existingUser = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
      if (existingUser.rows.length > 0) {
          return res.status(400).json({ message: "Error: Email is already registered." });
      }

      // Hash the password before storing it
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user into the database
      await pool.query(
          "INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3)",
          [username, email, hashedPassword]
      );

      res.status(200).json({ message: "User Registered Successfully" });
  } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Error signing up" });
  }
});


// TODO: Implement user signup logic
// return JSON object with the following fields: {email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      // Check if all required fields are provided
      if (!email || !password) {
          return res.status(400).json({ message: "Error: All fields are required." });
      }

      // Check if the user exists
      const userQuery = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
      if (userQuery.rows.length === 0) {
          return res.status(400).json({ message: "Invalid credentials" });
      }

      const user = userQuery.rows[0];

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
      }

      // Create a new session
      req.session.userId = user.user_id;
      res.status(200).json({ message: "Login successful" });
  } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Error logging in" });
  }
});


// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
  try {
      if (!req.session.userId) {
          return res.status(400).json({ message: "Not logged in" });
      }

      // Fetch username from the database
      const userQuery = await pool.query("SELECT username FROM Users WHERE user_id = $1", [req.session.userId]);
      
      if (userQuery.rows.length === 0) {
          return res.status(400).json({ message: "User not found" });
      }

      const username = userQuery.rows[0].username;
      res.status(200).json({ message: "Logged in", username });
  } catch (error) {
      console.error("Error checking login status:", error);
      res.status(500).json({ message: "Server error" });
  }
});


// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

////////////////////////////////////////////////////
// APIs for the products
// use correct status codes and messages mentioned in the lab document
// TODO: Fetch and display all products from the database
app.get("/list-products", isAuthenticated, async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM Products");
    res.status(200).json({ message: "Products fetched successfully", products: products.rows });
  } catch (error) {
    res.status(500).json({ message: "Error listing products" });
  }
});

// APIs for cart: add_to_cart, display-cart, remove-from-cart
// TODO: impliment add to cart API which will add the quantity of the product specified by the user to the cart
app.post("/add-to-cart", isAuthenticated, async (req, res) => {
  try {
      const { product_id, quantity } = req.body;
      const user_id = req.session.userId;

      // Validate request body
      if (!product_id || !quantity || quantity <= 0) {
          return res.status(400).json({ message: "Invalid request data" });
      }

      // Check if product exists
      const productQuery = await pool.query("SELECT * FROM Products WHERE product_id = $1", [product_id]);
      if (productQuery.rows.length === 0) {
          return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = productQuery.rows[0];

      // Check if the requested quantity is available in stock
      if (quantity > product.stock_quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}.` });
      }

      // Check if product is already in cart
      const cartQuery = await pool.query("SELECT * FROM Cart WHERE user_id = $1 AND item_id = $2", [user_id, product_id]);
      
      if (cartQuery.rows.length > 0) {
          // Update existing cart quantity
          const newQuantity = cartQuery.rows[0].quantity + quantity;
          if (newQuantity > product.stock_quantity) {
              return res.status(400).json({ message: `Insufficient stock for ${product.name}.` });
          }
          await pool.query("UPDATE Cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3", [newQuantity, user_id, product_id]);
      } else {
          // Insert new item into cart
          await pool.query("INSERT INTO Cart (user_id, item_id, quantity) VALUES ($1, $2, $3)", [user_id, product_id, quantity]);
      }

      res.status(200).json({ message: `Successfully added ${quantity} of ${product.name} to your cart.` });
  } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Error adding to cart" });
  }
});


// TODO: Implement display-cart API which will returns the products in the cart
app.get("/display-cart", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const cartItems = await pool.query(
      `SELECT Cart.item_id, Cart.user_id, Products.name as product_name, Cart.quantity as quantity,Products.stock_quantity as stock_quantity ,
              Products.price as unit_price, (Cart.quantity * Products.price) as total_item_price
       FROM Cart 
       JOIN Products ON Cart.item_id = Products.product_id
       WHERE Cart.user_id = $1`,
      [userId]
    );
    
    if (cartItems.rows.length === 0) {
      return res.status(200).json({ message: "No items in cart.", cart: [], totalPrice: 0 });
    }
    const totalPrice = cartItems.rows.length > 0 
  ? Number(cartItems.rows.reduce((sum, item) => sum + Number(item.total_item_price), 0).toFixed(2)) 
  : 0;

    console.log(totalPrice);
    res.status(200).json({ message: "Cart fetched successfully.", cart: cartItems.rows, totalPrice });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// TODO: Implement remove-from-cart API which will remove the product from the cart
app.post("/remove-from-cart", isAuthenticated, async (req, res) => {
  try {
      const { product_id } = req.body;
      const user_id = req.session.userId;

      // Validate request body
      if (!product_id) {
          return res.status(400).json({ message: "Invalid request data" });
      }

      // Check if the product exists in the cart
      const cartQuery = await pool.query("SELECT * FROM Cart WHERE user_id = $1 AND item_id = $2", [user_id, product_id]);
      
      if (cartQuery.rows.length === 0) {
          return res.status(400).json({ message: "Item not present in your cart." });
      }

      // Remove the item from the cart
      await pool.query("DELETE FROM Cart WHERE user_id = $1 AND item_id = $2", [user_id, product_id]);
      
      res.status(200).json({ message: "Item removed from your cart successfully." });
  } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ message: "Error removing item from cart" });
  }
});

// TODO: Implement update-cart API which will update the quantity of the product in the cart
app.post("/update-cart", isAuthenticated, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.session.userId;
    // Check if the session is active
    if (!userId) {
      return res.status(400).json({ message: "Unauthorized" });
    }
    // console.log(product_id);
    // Retrieve product stock information
    const product = await pool.query("SELECT stock_quantity FROM Products WHERE product_id = $1", [product_id]);
    // console.log(product_id);
    if (product.rows.length === 0) {
      return res.status(400).json({ message: "Product not found" });
    }

    const availableStock = product.rows[0].stock_quantity;

    // Check if the product exists in the user's cart
    const cartItem = await pool.query("SELECT quantity FROM Cart WHERE user_id = $1 AND item_id = $2", [userId, product_id]);

    let newQuantity = quantity;
    const new1 = quantity;
    if (cartItem.rows.length > 0) {
      // If the product is already in the cart, adjust the quantity
      newQuantity += cartItem.rows[0].quantity;
    }

    // If the requested quantity exceeds available stock, return an error
    if (newQuantity > availableStock) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock" });
    }

    // If the new quantity is zero or negative, remove the product from the cart
    if (newQuantity <= 0) {
      await pool.query("DELETE FROM Cart WHERE user_id = $1 AND item_id = $2", [userId, product_id]);
    } else {
      // Otherwise, update or insert the product quantity in the cart
      await pool.query(
        "INSERT INTO Cart (user_id, item_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = $3",
        [userId, product_id, new1]
      );
    }

    // Return a success response
    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Error updating cart" });
  }
});

// APIs for placing order and getting confirmation
// TODO: Implement place-order API, which updates the order,orderitems,cart,orderaddress tables
app.post("/place-order", isAuthenticated, async (req, res) => {
  const client = await pool.connect();
  try {
    // Ensure the user is logged in
    const userId = req.session.userId;
    if (!userId) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    // Extract the shipping address from the request body
    const { address } = req.body;
    if (
      !address ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      return res.status(400).json({ message: "Complete address required" });
    }

    // Retrieve the user's cart items along with product details
    const cartQuery = `
      SELECT c.item_id, c.quantity, p.name, p.price, p.stock_quantity
      FROM Cart c
      JOIN Products p ON c.item_id = p.product_id
      WHERE c.user_id = $1
    `;
    const cartResult = await client.query(cartQuery, [userId]);
    const cartItems = cartResult.rows;

    // Check if the cart is empty
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Verify that each cart item has sufficient stock
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${item.name}` });
      }
    }

    // Calculate the total amount for the order
    let totalAmount = 0;
    cartItems.forEach((item) => {
      totalAmount += item.price * item.quantity;
    });

    // Begin transaction
    await client.query("BEGIN");

    // Insert a new order into the Orders table
    const orderInsertQuery = `
      INSERT INTO Orders (user_id, total_amount)
      VALUES ($1, $2)
      RETURNING order_id
    `;
    const orderResult = await client.query(orderInsertQuery, [
      userId,
      totalAmount,
    ]);
    const orderId = orderResult.rows[0].order_id;

    // Process each cart item:
    for (const item of cartItems) {
      // Insert the order item into the OrderItems table
      const orderItemInsertQuery = `
        INSERT INTO OrderItems (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(orderItemInsertQuery, [
        orderId,
        item.item_id,
        item.quantity,
        item.price,
      ]);

      // Update the stock in the Products table
      const updateStockQuery = `
        UPDATE Products
        SET stock_quantity = stock_quantity - $1
        WHERE product_id = $2
      `;
      await client.query(updateStockQuery, [item.quantity, item.item_id]);
    }

    // Insert the shipping address into the OrderAddress table
    const addressInsertQuery = `
      INSERT INTO OrderAddress (order_id, street, city, state, pincode)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(addressInsertQuery, [
      orderId,
      address.street,
      address.city,
      address.state,
      address.pincode,
    ]);

    // Clear the user's cart after order placement
    const clearCartQuery = `DELETE FROM Cart WHERE user_id = $1`;
    await client.query(clearCartQuery, [userId]);

    // Commit the transaction
    await client.query("COMMIT");

    return res.status(200).json({ message: "Order placed successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Error placing order" });
  } finally {
    client.release();
  }
});

// API for order confirmation
// TODO: same as lab4
app.get("/order-confirmation", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderQuery = await pool.query(
      "SELECT * FROM Orders WHERE user_id = $1 ORDER BY order_date DESC LIMIT 1",
      [userId]
    );
    if (orderQuery.rows.length === 0) {
      return res.status(400).json({ message: "Order not found" });
    }
    const order = orderQuery.rows[0];
    const orderItemsQuery = await pool.query(
      "SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name AS product_name FROM OrderItems oi JOIN Products p ON oi.product_id = p.product_id WHERE oi.order_id = $1",
      [order.order_id]
    );
    res.status(200).json({
      message: "Order fetch successfully",
      order,
      orderItems: orderItemsQuery.rows,
    });
  } catch (error) {
    console.error("Order Confirmation Error:", error);
    res.status(500).json({ message: "Error fetching order details" });
  }
});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});