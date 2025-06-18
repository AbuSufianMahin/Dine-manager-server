require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.POST || 3000;

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send("Restaurant Management website is cooking!")
})


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.RESTURAUNT_USER}:${process.env.RESTURAUNT_PASS}@cluster0.udgfocl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const database = client.db("Restaurant_managementDB");
        const foodCollection = database.collection("foodCollection");
        const orderCollection = database.collection("orderCollection");

        app.get('/food-details', async(req, res)=>{
            const foodDetails = await foodCollection.find().toArray();
            res.send(foodDetails);
        })


        app.post('/add-food', async (req, res) => {
            const foodDetails = req.body;
            const result = await foodCollection.insertOne(foodDetails);
            res.send(result);
        })

    } finally {
        // await client.close();
    }

}
run().catch(console.dir);




app.listen(port, () => {
    console.log("Restaurant Management website is running on port:", port);
})

