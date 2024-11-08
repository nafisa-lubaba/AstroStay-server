// const express = require('express');
// const cors = require('cors');
// const { MongoClient, ServerApiVersion } = require('mongodb');
// require('dotenv').config();

// const port = process.env.PORT || 5000;

// const app = express();
// app.use(cors());
// app.use(express.json());
// console.log(process.env.DB_PASS)


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrsyrpr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);


// app.get('/', (req, res) => {
//     res.send('website is running')
//   })
//   app.listen(port, () => {
//     console.log(`website server is running on port:${port}`)
//   })



const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken')
// const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',

  ],
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());

 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrsyrpr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const roomsCollection = client.db('roomDB').collection('rooms')
    const reviewCollection = client.db('roomDB').collection('review')
    const bookingCollection = client.db('roomDB').collection('booking')
    //jwt
    
    // Clear token on logout
    app.get('/rooms', async (req, res) => {
      const cursor = roomsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.put('/rooms/:bookingId', async (req, res) => {
      const id = req.params.bookingId;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateData = {
        $set: {
          availability: 'unAvailable', 
        }
      };
      const result = await roomsCollection.updateOne(filter, updateData);
      console.log(result);
      res.send(result)
      // try {
      //   const result = await roomsCollection.updateOne(filter, updateData);
      //   console.log(result);
      //   if (result.modifiedCount === 1) {
      //     res.status(200).json({ message: "Update successful" });
      //   } else {
      //     res.status(404).json({ message: "Document not found or no modifications made" });
      //   }
      // } catch (error) {
      //   console.error("Error updating document:", error);
      //   res.status(500).json({ error: "Internal server error" });
      // }
    });


    app.get('/rooms/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await roomsCollection.findOne(query)
      // console.log(result)
      res.send(result)

    })
   
    app.post('/booking', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await bookingCollection.insertOne(newProduct)

      res.send(result)
    })
    app.get('/myBooking/:email', async (req, res) => {
      console.log(req.params.email);
      const result = await bookingCollection.find({ email: req.params.email }).toArray();
      res.send(result)
    })

    app.delete('/mybooking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

    app.put('/roomsDlt/:id', async (req, res) => {
      const id = req.params.id;
      const BookData = req.body
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          ...BookData,
        },
      }
      const result = await roomsCollection.updateOne(query, updateDoc, options)
      res.send(result)
    });

    

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('website is running')
})
app.listen(port, () => {
  console.log(`website server is running on port:${port}`)
})