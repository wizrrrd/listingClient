
/********************************************************************************
*  WEB422 – Assignment 1
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: ___Aditi Sharma___ Student ID: __145646238__ Date: ___17 Jan 2025___
*
*  Published URL: ___https://listingsapi-cvf2.onrender.com __
*
********************************************************************************/


const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});

const ListingsDB = require("./listingsDB.js");
const db = new ListingsDB();


db.initialize(process.env.MONGODB_CONN_STRING).then(() => {
  app.listen(HTTP_PORT, () => {
    console.log(`server listening on: ${HTTP_PORT}`);
  });
}).catch((err) => {
  console.log(err);
});

app.post("/api/listings", async (req, res) => {
  try {
    const newListing = await db.addNewListing(req.body);
    res.status(201).json(newListing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/listings", async (req, res) => {
  try {
    const { page, perPage, name } = req.query;
    const listings = await db.getAllListings(page, perPage, name);
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/listings/:id", async (req, res) => {
  try {
    const listing = await db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "ERROR 404: Listing not found" });
    }
    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/listings/:id", async (req, res) => {
  try {
    const updatedListing = await db.updateListingById(req.body, req.params.id);
    res.status(200).json(updatedListing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/listings/:id", async (req, res) => {
  try {
    await db.deleteListingById(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
