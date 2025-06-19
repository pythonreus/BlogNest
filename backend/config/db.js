const mongoose = require('mongoose');// load the mongoose library

const connectDB = async () => {
    await  mongoose.connect('mongodb+srv://kgadiselepe:Yehovah100@my-projects.kheii.mongodb.net/BlogNest?retryWrites=true&w=majority&appName=My-Projects', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("connected to the database");
};


module.exports = connectDB;