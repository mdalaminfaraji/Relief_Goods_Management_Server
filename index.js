const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("assignment");
    const collection = db.collection("users");
    const ReliefGoods = db.collection("ReliefGoods");
    const ReliefGoodsTestimonial = db.collection("ReliefGoodsTestimonial");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 8);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ==============================================================
    // WRITE YOUR CODE HERE
    app.post("/api/v1/create-supply", async (req, res) => {
      const body = req.body;

      const result = await ReliefGoods.insertOne(body);
      res.json({
        success: true,
        message: "Your Supply Create successfully done",
        data: result,
      });
    });

    app.get("/api/v1/getAllSupply", async (req, res) => {
      const result = await ReliefGoods.find().toArray();
      res.json({
        success: true,
        message: "Data retrieve successfully done",
        data: result,
      });
    });

    app.get("/api/v1/getSingleSupply/:id", async (req, res) => {
      const supplyId = req.params.id;

      try {
        if (!ObjectId.isValid(supplyId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid supply ID format",
            data: null,
          });
        }

        const result = await ReliefGoods.findOne({
          _id: new ObjectId(supplyId),
        });

        if (!result) {
          return res.status(404).json({
            success: false,
            message: "Supply not found",
            data: null,
          });
        }

        res.json({
          success: true,
          message: "Get single Supply successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error getting single supply:", error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
          data: null,
        });
      }
    });

    app.put("/api/v1/edit-supply/:id", async (req, res) => {
      const supplyId = req.params.id;
      const updatedData = req.body;

      try {
        const result = await ReliefGoods.findOneAndUpdate(
          { _id: new ObjectId(supplyId) },
          { $set: updatedData },
          { new: true }
        );

        if (!result) {
          return res.status(404).json({
            success: false,
            message: "Supply not found",
            data: null,
          });
        }

        res.json({
          success: true,
          message: "Supply updated successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error updating supply:", error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
          data: null,
        });
      }
    });
    app.delete("/api/v1/delete-supply/:id", async (req, res) => {
      const supplyId = req.params.id;

      try {
        const result = await ReliefGoods.findOneAndDelete({
          _id: new ObjectId(supplyId),
        });

        if (!result) {
          return res.status(404).json({
            success: false,
            message: "Supply not found",
            data: null,
          });
        }

        res.json({
          success: true,
          message: "Supply deleted successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error deleting supply:", error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
          data: null,
        });
      }
    });

    // Testimonial
    app.post("/api/v1/create-testimonial", async (req, res) => {
      const body = req.body;

      const result = await ReliefGoodsTestimonial.insertOne(body);
      res.json({
        success: true,
        message: "Your Testimonial Created successfully",
        data: result,
      });
    });

    app.get("/api/v1/getAllTestimonial", async (req, res) => {
      const result = await ReliefGoodsTestimonial.find().toArray();
      res.json({
        success: true,
        message: "Data retrieve successfully done",
        data: result,
      });
    });

    // ==============================================================

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});

// https://i.ibb.co/LPgSXT7/rice.png
// https://i.ibb.co/stTF3Md/first.png
// https://i.ibb.co/dm2p8Dz/cloths.png
// https://i.ibb.co/LYC0V4w/waterdiaster.png
// https://i.ibb.co/DGYhZvN/sylhet.png
// https://i.ibb.co/NT5G6XK/disaster-1.png
// https://i.ibb.co/Dr7w5L1/relief.png
// https://i.ibb.co/7jsBWN4/ataMoida.png
// https://i.ibb.co/tQzPnWd/food.png
// https://i.ibb.co/mzVpx4r/naturaldiastare.png
