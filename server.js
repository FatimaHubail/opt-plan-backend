require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dbConnection = require('./config/dbConnection');
const app = express();

// Connect to MongoDB
dbConnection();
app.use(cors());
app.use(express.json());

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
});

main().catch((err) => {
    console.error(err)
    process.exit(1)
  })