require('dotenv').config();
const express = require('express');
const cors = require('cors');

const admin = require("firebase-admin");

const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8');
const serviceAccount = JSON.parse(decoded);

const app = express();
const port = process.env.POST || 3000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "restaurant-management-server-tan-pi.vercel.app",
      "https://restaurant-management-sy-6dee9.web.app",
    ],
    credentials: true,
  })
);


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


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ errorCode: 401, message: "Unauthorized access" });
    }
    else {
        const token = authHeader.split(' ')[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.decodedToken = decodedToken;
            next();
        }
        catch (error) {
            return res.status(401).send({ errorCode: 401, message: "Unauthorized access" });
        }
    }
}

const verifyTokenEmail = async (req, res, next) => {

    if (req.query.email !== req.decodedToken.email) {
        return res.status(403).send({ errorCode: 403, message: "Forbidden access" });
    }
    next();
}

async function run() {
    try {
        const database = client.db("Restaurant_managementDB");
        const foodCollection = database.collection("foodCollection");
        const orderCollection = database.collection("orderCollection");

        app.get('/food-details', async (req, res) => {
            const foodDetails = await foodCollection.find().toArray();
            res.send(foodDetails);
        })

        app.get('/top-food-details', async (req, res) => {
            const topFoodDetails = await foodCollection.find().sort({ totalSold: -1 }).limit(6).toArray();
            res.send(topFoodDetails);
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

        app.get('/my-added-food', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const userEmail = req.query.email;
            const query = { foodAuthorEmail: userEmail }
            const result = await foodCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/add-food', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const foodDetails = req.body;
            const result = await foodCollection.insertOne(foodDetails);
            res.send(result);
        })

        app.put('/edit-my-food', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {

            const newData = req.body;
            const { _id, ...newFoodData } = newData;

            const query = { _id: new ObjectId(_id) };

            const updateDoc = {
                $set: newFoodData
            }

            const result = await foodCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        app.delete('/food/:id', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const foodId = req.params.id;

            // deleting from food collection
            const query = { _id: new ObjectId(foodId) };
            const result = await foodCollection.deleteOne(query);

            //deleting the food from all the orders
            const result2 = await orderCollection.deleteMany({ foodId });

            res.send(result);
        })

        // API for searching
        app.get('/search-food', async (req, res) => {
            const foodName = req.query.foodName;
            const query = {
                foodName: { $regex: foodName, $options: 'i' }
            }
            const result = await foodCollection.find(query).toArray();
            res.send(result);
        })

        // order APIs (order collection)

        app.get('/my-orders', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const email = req.query.email;
            const orderQuery = { buyerEmail: email };
            const orderDetails = await orderCollection.find(orderQuery).toArray();

            const orderedFoodDetails = [];

            for (const order of orderDetails) {
                const foodQuery = { _id: new ObjectId(order.foodId) }
                const result = await foodCollection.findOne(foodQuery);
                result.orderQuantity = order.orderQuantity;
                result.orderDate = order.orderDate;
                result.orderId = order._id;
                orderedFoodDetails.push(result);
            }

            res.send(orderedFoodDetails);
        })

        app.post('/purchase-food', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const foodDetails = req.body;
            const { _id: foodId, orderQuantity, buyerName, buyerEmail, orderDate } = foodDetails;
            const orderDetails = { foodId, orderQuantity, buyerName, buyerEmail, orderDate };

            //adding to order list
            const result1 = await orderCollection.insertOne(orderDetails);

            // updating food quantity and totalsold count
            const query = { _id: new ObjectId(foodId) }
            const updateDoc = {
                $inc: {
                    quantity: -orderQuantity,
                    totalSold: +orderQuantity
                }
            }
            const result2 = await foodCollection.updateOne(query, updateDoc);

            res.send(result1);
        })

        app.delete('/cancel-order/:id', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const orderId = req.params.id;
            const deleteQuery = { _id: new ObjectId(orderId) };

            // adding back the quantity to food collection
            const orderData = await orderCollection.findOne(deleteQuery);
            const foodQuery = { _id: new ObjectId(orderData.foodId) }

            const updateDoc = {
                $inc: {
                    quantity: +orderData.orderQuantity,
                    totalSold: -orderData.orderQuantity
                }
            }
            const updateResult = await foodCollection.updateOne(foodQuery, updateDoc);

            // deleting from order list
            const deleteResult = await orderCollection.deleteOne(deleteQuery);
            res.send(deleteResult);
        })

    } finally {}

}
run().catch(console.dir);


app.listen(port, () => {
    console.log("Restaurant Management website is running on port:", port);
})