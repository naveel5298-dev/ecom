
import http from 'http';
import app from './app';
import { sequelize } from './config/db';
import './model/index'
import cluster from "cluster";
import os from "os";
import process from "process";
import { connectRedis } from "./config/redis";

// const numCPUs = os.cpus().length;
// console.log(numCPUs);
// if (cluster.isPrimary) {

//   console.log(`Primary ${process.pid} is running`);
//   console.log(`Forking ${numCPUs} workers...`);

//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker) => {
//     console.log(`Worker ${worker.process.pid} died. Restarting...`);
//     cluster.fork();
//   });

// } 
// else{
// const PORT: any = process.env.PORT;
// const server = http.createServer(app);
// server.listen(PORT, function () {
//   console.log(`Server started at http://localhost:${PORT}`)
// })
// testDB();

// }


const PORT: any = process.env.PORT;
//const server = http.createServer(app);

(async () => {

    const server = http.createServer(app);
    await connectRedis();

    server.listen(PORT, function () {
        console.log(`Server started at http://localhost:${PORT}`)
    })
})();




async function testDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");
    const alter: boolean = process.env.NODE_ENV === 'production' ? false : true;
    // console.log(sequelize.models);
    await sequelize.sync({ alter: false });
    //await sequelize.sync({force:true}); // {force:true} {alter:true} apply only development mode
    console.log("✅ Models synced");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    } 
}
    testDB();



