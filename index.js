const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ry27zgj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const serviceCollection = client.db("serviceMasterDB").collection("services");
    const bookingCollection = client.db("serviceMasterDB").collection("bookings");

    app.get("/services", async (req, res) => {
      try {
        const result = await serviceCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch services" });
      }
    });

    app.get("/services/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await serviceCollection.findOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Invalid service ID" });
      }
    });

    app.post("/addservices", async (req, res) => {
      try {
        const newService = req.body;
        const result = await serviceCollection.insertOne(newService);
        res.status(201).send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to add service" });
      }
    });

    app.get("/showServices", async (req, res) => {
      try {
        const query = req.query.userEmail ? { userEmail: req.query.userEmail } : {};
        const result = await serviceCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch user services" });
      }
    });

    app.delete("/showAddService/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await serviceCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to delete service" });
      }
    });

    app.get("/showAddService/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await serviceCollection.findOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch service" });
      }
    });

    app.put("/showAddService/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedService = req.body;
        const result = await serviceCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              serviceImage: updatedService.serviceImage,
              serviceName: updatedService.serviceName,
              serviceDescription: updatedService.serviceDescription,
              serviceArea: updatedService.serviceArea,
              servicePrice: updatedService.servicePrice,
            },
          },
          { upsert: true }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to update service" });
      }
    });

    app.get("/bookings", async (req, res) => {
      try {
        const query = req.query.email ? { email: req.query.email } : {};
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch bookings" });
      }
    });

    app.get("/pendingBooking", async (req, res) => {
      try {
        const query = req.query.serviceProviderEmail
          ? { serviceProviderEmail: req.query.serviceProviderEmail }
          : {};
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch pending bookings" });
      }
    });

    app.post("/addbookings", async (req, res) => {
      try {
        const newBooking = req.body;
        const result = await bookingCollection.insertOne(newBooking);
        res.status(201).send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to add booking" });
      }
    });

    app.put("/pendingBooking/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body;
        const result = await bookingCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to update booking" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Connection successful.");
  } catch (error) {
    console.error("DB connection error:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("This is the server of One Service");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
