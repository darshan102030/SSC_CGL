require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ssccgl_mock';

const clearDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await mongoose.connection.dropDatabase();
    console.log('Database cleared successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

clearDB();
