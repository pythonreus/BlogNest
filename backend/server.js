const app = require("./app.js");
const connectDB = require("./config/db.js");

//connect to mongoose
const startServer = async () =>{
    try{
        await connectDB(); // basically wait until the database has connected
        // now we have to listen to requests from the client side
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log("Server is running and waiting for requests");
        });
        
    }catch(error){
        console.log("failed to connect to the database");
    }
};

startServer();


