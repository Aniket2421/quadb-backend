const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
require("dotenv").config();
const cors = require('cors');

app.use(
    cors({
        origin: "*",
    })
);




mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB is Connected"))
    .catch((err) => console.log(err));


const TickerSchema = new mongoose.Schema({
    name: String,
    last: Number,
    buy: Number,
    sell: Number,
    volume: Number,
    base_unit: String,
});

const Ticker = mongoose.model('Ticker', TickerSchema);

// Fetch data from API and store in MongoDB
async function fetchAndStoreData() {
    const response = await fetch('https://api.wazirx.com/api/v2/tickers');
    const data = await response.json();
    const tickers = Object.values(data).slice(0, 10); // Get top 10 results

    await Ticker.deleteMany({}); // Clear existing data

    tickers.forEach(async (ticker) => {
        const newTicker = new Ticker({
            name: ticker.name,
            last: ticker.last,
            buy: ticker.buy,
            sell: ticker.sell,
            volume: ticker.volume,
            base_unit: ticker.base_unit,
        });
        await newTicker.save();
    });
}

// Route to get data
app.get('/data', async (req, res) => {
    const tickers = await Ticker.find();
    res.json(tickers);
});

// Start server and fetch data initially
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    fetchAndStoreData(); // Fetch data initially
    setInterval(fetchAndStoreData, 60000); // Fetch data every minute
});