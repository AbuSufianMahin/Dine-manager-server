const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.POST || 3000;

app.use(express.json());
app.use(cors());


app.get('/', (req, res)=>{
    res.send("Restaurant Management website is cooking!")
})


app.listen(port, ()=>{
    console.log("Restaurant Management website is running on port:", port);
})

