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
      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE;
      const query = {
        price_per_night: { $gte: minPrice, $lte: maxPrice }
      };

      const result = await roomsCollection.find(query).toArray();
      res.send(result);

    });


    app.put('/rooms/:bookingId', async (req, res) => {
      const id = req.params.bookingId;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      console.log(filter);
      const updateData = {
        $set: {
          availability: 'unAvailable',

        }
      };
      const result = await roomsCollection.updateOne(filter, updateData);
      console.log(result);
      res.send(result)

    });




    app.get('/rooms/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await roomsCollection.findOne(query)
      // console.log(result)
      res.send(result)

    })

    app.put('/rooms/:id', async (req, res) => {
      const id = req.params.id
      const BookData = req.body
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          ...BookData,
        },
      }
      const result = await bookingCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })

    app.post('/booking', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await bookingCollection.insertOne(newProduct)

      res.send(result)
    })

    app.post('/booking', async (req, res) => {
      const newProduct = req.body;

      try {
        // Insert into roomsBooking collection
        const bookingResult = await bookingCollection.insertOne(newProduct);

        // Update another collection
        const query = {
          _id: {
            $in: newProduct.bookingId.map(id => new ObjectId(id))
          }
        };
        console.log(query);
        // const updateResult = await roomsCollection.updateMany(query, { $set: { availability: 'unAvailable' } });

        res.send({ bookingResult, updateResult });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // 
    // app.get('/myBooking/:email', async (req, res) => {
    //   console.log(req.params.email);
    //   const result = await bookingCollection.find({ email: req.params.email }).toArray();
    //   res.send(result)
    // })

    app.get('/myBooking/:email', async (req, res) => {
      try {
        const email = req.params.email;
        console.log('Fetching bookings for email:', email);

        const result = await bookingCollection.find({ email }).toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send({ message: 'Error fetching bookings' });
      }
    });
    app.get('/myBooking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.find(query).toArray()
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
      const alter = { upsert: true }
      const updateData = {
        $set: {
          ...BookData,
        },
      }
      const result = await roomsCollection.updateOne(query, updateData, alter)
      res.send(result)
    });

    app.post('/review', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await reviewCollection.insertOne(newProduct)

      res.send(result)
    });

    app.get('/review', async (req, res) => {
      // const result = await reviewCollection.find().toArray()
      const result = await reviewCollection.find().sort({ timestamp: -1 }).toArray();

      res.send(result)
    })

    // app.put('/updateData/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const BookData = req.body
    //   const query = { _id: new ObjectId(id) }
    //   const options = { upsert: true }
    //   const updateDoc = {
    //     $set: {
    //       ...BookData,
    //     },
    //   }
    //   const result = await bookingCollection.updateOne(query, updateDoc, options)
    //   res.send(result)
    // });

    app.put('/updateData/:id', async (req, res) => {
      const id = req.params.id;
      const BookData = req.body;
  
      console.log('Updating booking with ID:', id);
      console.log('Received data for update:', BookData);
  
      // Ensure deadline is a valid date format
      // if (BookData.deadline) {
      //     BookData.deadline = new Date(BookData.deadline);
      // }
  
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...BookData,
        },
      }
      const result = await bookingCollection.updateOne(query, updateDoc, options)
      res.send(result)
      // const updateDoc = {
      //     $set: { ...BookData },
      // };
  
      // try {
      //     const result = await bookingCollection.updateOne(query, updateDoc, options);
      //     console.log('Update result:', result);
  
      //     // Send structured response to the client for easy debugging
      //     res.send({
      //         success: result.modifiedCount > 0,
      //         modifiedCount: result.modifiedCount,
      //         message: result.modifiedCount > 0 ? 'Booking updated successfully' : 'No booking was updated',
      //         result,
      //     });
      // } catch (error) {
      //     console.error('Error updating booking:', error);
      //     res.status(500).send({ success: false, message: 'Error updating booking', error });
      // }
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