var amqp = require('amqplib/callback_api');
var args = process.argv.slice(2);

var station = args[0];
var topic_prefix = args[1];

console.log('start station : %s on topic : %s', station, topic_prefix);
amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'order_queue';
    var exchange = 'orders_topic_exchange';
    var routingPattern = 'order.#.'+topic_prefix+'.#'; // Listen for all order-related messages
    if (!topic_prefix) {
        routingPattern = 'order.#'
    }


    // channel.assertQueue(queue, {
    //   durable: true
    // });
    channel.assertExchange(exchange, 'topic', {
        durable: true
    });
    // channel.prefetch(1);
    // console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    // channel.consume(queue, function(msg) {
    //     var secs = msg.content.toString().split('.').length - 1;
    //     console.log(" [x] Received");
    //     console.log(JSON.parse(msg.content));

    //     setTimeout(function() {
    //     console.log(" [x] Done");
    //     channel.ack(msg);
    //     }, secs * 1000);
    // }, {
    // noAck: false
    // });

    channel.assertQueue('', { exclusive: true }, function(error2, q) {
        if (error2) {
            throw error2;
        }

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);

        // Bind the queue to the topic exchange with a routing pattern
        channel.bindQueue(q.queue, exchange, routingPattern);

        // Consume the messages
        channel.consume(q.queue, function(msg) {
            if (msg.content) {
                console.log(" [x] %s Received '%s'", station, msg.content.toString());
            }
        }, {
            noAck: true
        });
    });
  });
});  