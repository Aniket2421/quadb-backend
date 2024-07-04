const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
require("dotenv").config();


mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB is Connected"))
    .catch((err) => console.log(err));


const tickerSchema = new mongoose.Schema({
    name: String,
    last: Number,
    buy: Number,
    sell: Number,
    volume: Number,
    base_unit: String
});

const Ticker = mongoose.model('Ticker', tickerSchema);

// Fetch data from API and store in the database
app.get('/fetch-data', async (req, res) => {
    try {
        const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
        const data = Object.values(response.data).slice(0, 10);

        await Ticker.deleteMany({});
        await Ticker.insertMany(data.map(item => ({
            name: item.name,
            last: item.last,
            buy: item.buy,
            sell: item.sell,
            volume: item.volume,
            base_unit: item.base_unit
        })));

        res.send('Data fetched and stored in the database');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

// Get stored data from the database
app.get('/data', async (req, res) => {
    try {
        const tickers = await Ticker.find({});
        res.json(tickers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data from the database');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
