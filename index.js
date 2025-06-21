require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.POST || 3000;

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send("Restaurant Management website is cooking!");
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        app.get('/food-details', async (req, res) => {
            const foodDetails = await foodCollection.find().toArray();
            res.send(foodDetails);
        })

        app.get('/sorted-food-data', async (req, res) => {
            const sortByOption = req.query.sortBy;

            let foodDetails;
            let option = {};

            if (sortByOption === 'PriceAsc') {
                option = { price: 1 }
            }
            else if (sortByOption === 'PriceDsc') {
                option = { price: -1 }
            }
            else if (sortByOption === 'Food Origin') {
                option = { foodOrigin: 1 }
            }
            else {
                option = { foodCategory: 1 }

            }
            foodDetails = await foodCollection.find().sort(option).toArray();
            res.send(foodDetails);
        })

        app.get('/food-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const result = await foodCollection.findOne(query);
            res.send(result);

        })

        app.get('/my-added-food', async (req, res) => {
            const userEmail = req.query.email;
            const query = { foodAuthorEmail: userEmail }
            const result = await foodCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/add-food', async (req, res) => {
            const foodDetails = req.body;
            const result = await foodCollection.insertOne(foodDetails);
            res.send(result);
        })

        // API for searching
        app.get('/search-food', async (req, res) => {
            const foodName = req.query.foodName;
            // console.log(foodName);
            const query = {
                foodName: { $regex: foodName, $options: 'i' }
            }
            const result = await foodCollection.find(query).toArray();

            console.log("new");
            res.send(result);
        })


        // order APIs (order collection)

        app.post('/purchase-food', async (req, res) => {
            const foodDetails = req.body;
            const { _id: foodId, orderQuantity, buyerName, buyerEmail, orderDate } = foodDetails;
            const orderDetails = { foodId, orderQuantity, buyerName, buyerEmail, orderDate };

            //adding to order list
            const result1 = await orderCollection.insertOne(orderDetails);

            // updating food quantity
            const query = { _id: new ObjectId(foodId) }
            const updateDoc = {
                $inc: { quantity: -orderQuantity }
            }
            const result2 = await foodCollection.updateOne(query, updateDoc);

            res.send(result1);
        })

        app.delete('/food/:id', async (req, res) => {
            const foodId = req.params.id;
            const query = { _id: new ObjectId(foodId) };

            const result = await foodCollection.deleteOne(query);
            res.send(result);
        })
    } finally { }

}
run().catch(console.dir);


app.listen(port, () => {
    console.log("Restaurant Management website is running on port:", port);
})