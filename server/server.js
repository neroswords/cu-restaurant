const PROTO_PATH="./restaurant.proto";
require('dotenv').config()
//var grpc = require("grpc");
var grpc = require("@grpc/grpc-js");

var protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

var restaurantProto =grpc.loadPackageDefinition(packageDefinition);

// const {v4: uuidv4}=require("uuid");

const server = new grpc.Server();

const mongoose = require('mongoose');
const Menu = require('./models/menu')


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB using Mongoose'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));


server.addService(restaurantProto.RestaurantService.service,{
    getAllMenu: async (_,callback)=>{
        const menu = await Menu.find();
        callback(null, {menu});
    },
    get: async (call,callback)=>{
        console.log(call.request.id)
        const menuItem = await Menu.findById(call.request.id);

        if(menuItem) {
            callback(null, menuItem);
        }else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
    },
    insert: async (call, callback)=>{
        const menuItem = new Menu(call.request);
        try {
            const result = await menuItem.save();
            callback(null,result);
        } catch (err) {
            console.error(err);
        }
    },
    update: async (call,callback)=>{
        const existingMenuItem = await Menu.findById(call.request.id);

        if(existingMenuItem){
            existingMenuItem.name=call.request.name;
            existingMenuItem.price=call.request.price;
            await existingMenuItem.save();
            callback(null,existingMenuItem);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            });
        }
    },
    remove: async (call, callback) => {
        try {
            const existingMenuItem = await Menu.findByIdAndDelete(call.request.id);
            callback(null,{});
        } catch (err) {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "NOT Found"
            });
        }
    }
});

server.bindAsync("127.0.0.1:30043",grpc.ServerCredentials.createInsecure(), ()=>{server.start();});
console.log("Server running at http://127.0.0.1:30043");
