const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

/*-----------
    mongodb
------------*/
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ie64yha.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

   

    //add a new toy
    const addToyCollection = client.db('funtopiaToys').collection('toys');

    app.get('/addToy', async(req, res) =>{
        const cursor = addToyCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // app.get('/addToy/:id', async (req,res) =>{
    //     const id =  req.params.id;
    //     const query = {_id: new ObjectId (id)};
    //     const toyDetails = await addToyCollection.findOne(query);
    //     res.send(toyDetails)
    // })

    app.post('/addToy', async(req, res)=>{
        const addNewToy = req.body;
        console.log(addNewToy);
        const result = await addToyCollection.insertOne(addNewToy);
        res.send(result);
    })

    //blogs data fetch
    const blogCollection = client.db('funtopiaToys').collection('blogs');

    app.get('/blogs', async(req, res)=>{
        const cursor = blogCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // category data fetch
    const toyCollection = client.db('funtopiaToys').collection('toys');

    app.get('/toys', async(req, res)=>{
        const cursor = toyCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/toys/:id', async (req,res) =>{
        const id =  req.params.id;
        const query = {_id: new ObjectId (id)};
        const toyDetails = await toyCollection.findOne(query);
        res.send(toyDetails)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

/*-----------
    mongodb
------------*/


app.get('/', (req, res) =>{
    res.send('Have fun with your toys')
})

app.listen(port, () =>{
    console.log(`toys server is running on port ${port}`);
})