const client = require("./client");

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("views",path.join(__dirname,"views"));
app.set("view engine","hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/",(req,res)=>{
    client.getAllMenu(null,(err,data)=>{
        if(!err){
            res.render("menu",{
                results: data.menu
            });
        }
    });
});

var amqp = require('amqplib/callback_api');

app.post("/placeorder", (req, res) => {
	//const updateMenuItem = {
    var orderItem = {
		id: req.body.id,
		name: req.body.name,
		quantity: req.body.quantity,
	};

    // Send the order msg to RabbitMQ 
    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            var queue = 'order_queue';
            //var msg = process.argv.slice(2).join(' ') || "Hello World!";
            var exchange = 'orders_topic_exchange';
            var routingKey = 'order.#';  // Wildcard to receive all 'order' related messages
            

            // channel.assertQueue(queue, {
            //     durable: true
            // });
            channel.assertExchange(exchange, 'topic', {
                durable: true
            });
            channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(orderItem)), {
                persistent: true
            });
            // channel.sendToQueue(queue, Buffer.from(JSON.stringify(orderItem)), {
            //     persistent: true
            // });
                console.log(" [x] Sent '%s'", orderItem);
            });
        });
    });
    //console.log("update Item %s %s %d",updateMenuItem.id, req.body.name, req.body.quantity);


const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log("Server running at port %d",PORT);
});