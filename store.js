var express = require('express');
var store = require('./watched');
var settings = require('./settings.json');
var app = express();

app.configure(function(){
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());
  app.use(express.cookieParser(settings.secret));
  app.use(express.session());
  app.use(app.router);
});

app.listen(9090);

app.get('/:path?', store.render);
app.post('/:path?', store.mv);
