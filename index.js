const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
const corsOptions ={
    origin:'*', 
    credentials:true,
    optionSuccessStatus:200,
 }
 
 app.use(cors(corsOptions))

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
        // await client.connect();

        const toyCollection = client.db('funtopiaToys').collection('toys');

        //add a new toy
        const addToyCollection = client.db('funtopiaToys').collection('toys');

        app.get('/addToy', async (req, res) => {
            const cursor = addToyCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        //add a toy
        app.post('/addToy', async (req, res) => {
            const addNewToy = req.body;
            const result = await addToyCollection.insertOne(addNewToy);
            res.send(result);
        })

        //delete toy 
        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })

        //get single toy
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query);
            res.send(result);
        })

        //update the toy 
        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedToy = req.body;
            const toy = {
                $set: {
                    name: updatedToy.name,
                    photoUrl: updatedToy.photoURL,
                    sellerName: updatedToy.sellerName,
                    sellerEmail: updatedToy.sellerEmail,
                    subcategory: updatedToy.subcategory,
                    price: updatedToy.price,
                    rating: updatedToy.rating,
                    quantity: updatedToy.quantity,
                    description: updatedToy.description
                }
            }
            const result = await toyCollection.updateOne(filter, toy, options);
            res.send(result);
        })

        //my toys
        app.get('/myToy/:email', async (req, res) => {
            const email = req.params?.email
            const query = { sellerEmail: email }
            if (query) {
                console.log(query)
                const result = await toyCollection.find(query).toArray();
                console.log(result);
                res.send(result)
            }
        })

        //search functionality 
        app.get('/toys', async (req, res) => {
            const searchQuery = req.query.search;
            const priceQuery = parseFloat(searchQuery); // Parse the search query as a floating-point number

            let filter;
            if (!isNaN(priceQuery)) {
                // If the search query is a valid number, search for toys with price greater than or equal to the query
                filter = { price: { $gte: priceQuery } };
            } else {
                // If the search query is not a valid number, search for toys based on the name
                const regexQuery = new RegExp(searchQuery, 'i');
                filter = { name: regexQuery };
            }

            const cursor = toyCollection.find(filter).limit(20); // Limit the number of results to 20
            const result = await cursor.toArray();
            res.send(result);
        });

        //ascending and descending 
        app.get('/toys', async (req, res) => {
            const { sort } = req.query;
            let sortOption = {};

            if (sort === 'asc') {
                sortOption = { price: 1 };
            } else if (sort === 'desc') {
                sortOption = { price: -1 };
            }

            const cursor = toyCollection.find().sort(sortOption);
            const result = await cursor.toArray();
            res.send(result);
        });

        //blogs data fetch
        const blogCollection = client.db('funtopiaToys').collection('blogs');

        app.get('/blogs', async (req, res) => {
            const cursor = blogCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // category data fetch
        app.get('/toys', async (req, res) => {
            const cursor = toyCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        //toy details
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const toyDetails = await toyCollection.findOne(query);
            res.send(toyDetails)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

/*-----------
    mongodb
------------*/

app.get('/', (req, res) => {
    res.send('Have fun with your toys')
})

app.listen(port, () => {
    console.log(`toys server is running on port ${port}`);
})