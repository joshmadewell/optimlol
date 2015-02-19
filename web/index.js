var express = require('express');
var compression = require('compression');
var app = express();

app.set('view engine', 'html');
app.set('views', __dirname);
app.use(compression());
app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.render('index.html');
});

app.listen(process.env.PORT || 9001);