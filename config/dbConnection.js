const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('MongoDB connection initiated');
    } catch (error) {
        console.log(error);
    }
}

module.exports = dbConnection;