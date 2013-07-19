var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {
//  "/" : requestHandlers.updater,
  "/updater/" : requestHandlers.updater,
  "/updater.php" : requestHandlers.updater
};

server.start(router.route, handle);

