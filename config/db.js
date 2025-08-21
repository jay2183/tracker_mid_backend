const mongoose = require('mongoose');

const connectDB = async () => {
  console.log("connecting to database...")
  try {
    console.log(`Mongo URL: ${process.env.MONGO_URI}`);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error on connect to the database: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;
