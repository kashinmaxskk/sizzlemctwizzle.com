var express = require('express');
var update = require('./update');
var app = express();

app.configure(function(){
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.compress());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.listen(8080);

app.get('/:id(\\d+).js', update.handle);
app.get('/updater.php', update.handle);
app.use(express.static(__dirname + '/static'));
app.use(function(req, res, next){
  res.sendfile(__dirname + '/static/404.html');
});
