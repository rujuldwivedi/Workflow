import Server from "./Server.mjs";

import mongoose from "mongoose";

let user = "rujuldwivedi";
let password = "OUtUKTR3g0zMsOji";
let dbName = "products";

//Also specify database here
const uri = `mongodb+srv://${user}:${password}@cluster0.u4qnnse.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;


async function DBConnect()
{
    await mongoose.connect(uri).then( ()=>{console.log('Database Connection Successful')}).catch((err) => {console.log("Database Connection Failed")});
    const db = mongoose.connection;
    Server(db);

}

DBConnect();

process.on('SIGINT', () => {
        mongoose.connection.close();
});
