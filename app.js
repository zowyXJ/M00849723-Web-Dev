const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const lessonsRouter = require("./routes/lessons");
const ordersRouter = require("./routes/orders");

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:8080", 
  })
);

const uri = "mongodb://localhost:27017/HZ-DB";
const client = new MongoClient(uri);

async function connectDB() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("HZ-DB");
    app.locals.db = db; // Attach db to app.locals

    // Debugging: Ensure database connection
    console.log("Database object:", app.locals.db);

    // Start server only after database connection
    app.listen(3000, () => console.log("Server running on port 3000"));

    // Routes
    app.use("/lessons", lessonsRouter);
    app.use("/orders", ordersRouter);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// Static file handling
const staticFile = require("./middleware/staticFile");
app.use("/images", staticFile);

// Logger middleware
const logger = require("./middleware/logger");
app.use(logger);

// Initialize the database connection
connectDB();

module.exports = app;
