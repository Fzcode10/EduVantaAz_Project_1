const mongoose = require('mongoose');

const DataBaseConnection =  () => {

    const DB_URL = process.env.DATABASE_URL;

    mongoose.connect(DB_URL, { 
        // useNewUrlParser: true,
        // useUnifiedTopology: true // both are supported for old version of mongodb
    })
    
    const db = mongoose.connection;
 
    db.on("error", console.error.bind(console, "Connection Error"))
    db.once("open", function(){
        console.log("DB COnnected...");
    })
}

module.exports = DataBaseConnection