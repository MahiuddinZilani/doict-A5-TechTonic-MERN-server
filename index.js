const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const Port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dpqxpzb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// database & collections
const database = client.db("techTonicDb");

const usersCollection = database.collection("users");
const productsCollection = database.collection("products");
const categoriesCollection = database.collection("categories");
const cartsCollection = database.collection("carts");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // ----------------------userDb related api-----------------------------------
    // get users
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const users = await cursor.toArray();
      res.json(users);
    });

    // get single user
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      res.json(user);
    });

    // create users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.json(result);
      //   res.send(result);
    });

    //delete users
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);

      res.json(result);

      //   try {
      //     const result = await usersCollection.deleteOne(query);

      //     if (result.deletedCount === 1) {
      //       res.json(result);
      //     } else {
      //       res.status(404).json({ message: "user not found" });
      //     }
      //   } catch {
      //     res.status(500).json({ message: "error deleting user" });
      //   }
    });

    //update users
    app.patch("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };

      const updateUser = {
        $set: {
          displayName: user.displayName,
          photoUrl: user.photoUrl,
          phone: user.phone,
          address: user.address,
          uid: user.uid,
          // email: user.email,
          isAdmin: user?.isAdmin,
          isBlocked: user?.isBlocked,
        },
      };

      const option = { upsert: true };

      const result = usersCollection.updateOne(filter, updateUser, option);

      res.json(result);
    });
    // change users role
    app.patch("/users/:email/role", async (req, res) => {
      const email = req.params.email;
      const { isAdmin } = req.body;

      const filter = { email };
      const update = { $set: { isAdmin } };
      const result = await usersCollection.updateOne(filter, update);

      res.json(result);
    });

    // ----------------------All Products-----------------------------------
    // get products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.json(products);
    });

    // get single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.json(product);
    });

    // create products
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
      //   res.send(result);
    });

    //delete products
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });

    //update products
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const filter = { _id: new ObjectId(id) };

      // const updateProduct = {
      //   $set: {
      //     id: product?.id,
      //     brand: product?.brand,
      //     model: product?.model,
      //     price: product?.price,
      //     releaseDate: product?.releaseDate,
      //     photoUrl: product?.photoUrl,
      //     specifications: {
      //       display: {
      //         type: product?.specifications?.display?.type,
      //         size: product?.specifications?.display?.size,
      //         resolution: product?.specifications?.display?.resolution,
      //       },
      //       processor: product?.specifications?.processor,
      //       ram: product?.specifications?.ram,
      //       storage: product?.specifications?.storage,
      //       camera: {
      //         rear: product?.specifications?.camera?.rear,
      //         front: {
      //           resolution: product?.specifications?.camera?.front?.resolution,
      //           features: product?.specifications?.camera?.front?.features,
      //         },
      //       },
      //       battery: {
      //         capacity: product?.specifications?.battery?.capacity,
      //         type: product?.specifications?.battery?.type,
      //         charging: product?.specifications?.battery?.charging,
      //       },
      //       os: product?.specifications?.os,
      //       connectivity: product?.specifications?.connectivity,
      //       sensors: product?.specifications?.sensors,
      //       colors: product?.specifications?.colors,
      //       dimensions: {
      //         height: product?.specifications?.dimensions?.height,
      //         width: product?.specifications?.dimensions?.width,
      //         depth: product?.specifications?.dimensions?.depth,
      //         weight: product?.specifications?.dimensions?.weight,
      //       },
      //     },
      //     warranty: product?.warranty,
      //     stock: product?.stock,
      //     rating: product?.rating,
      //     reviews: product?.reviews,
      //   },
      // };

      const updateProduct = {
        $set: {
          name: product.name,
          price: product.price,
          description: product.description,
          stock: product.stock,
          photoURL: product.photoURL,
        },
      };
      const option = { upsert: true };

      const result = productsCollection.updateOne(
        filter,
        updateProduct,
        option
      );

      res.json(result);
    });

    // --------------------Categories----------------------

    app.get("/categories", async (req, res) => {
      const categories = await categoriesCollection.find().toArray();
      res.send(categories);
    });

    app.get("/categories/:categoryName", async (req, res) => {
      const categoryName = req.params.categoryName;

      const query = { category: categoryName };
      const categories = await productsCollection.find(query).toArray();
      res.json(categories);
    });

    // ------------------------------- carts collection ---------------------
    app.get("/carts/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cart = await cartsCollection.find(query).toArray();
      res.json(cart);
    });
    app.post("/carts", async (req, res) => {
      const cart = req.body;
      const result = await cartsCollection.insertOne(cart);
      res.json(result);
    });

    // --------------------------------- CRUD Ends -------------------------------------------

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
