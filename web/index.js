var express = require('express');
var app = express();

app.set('view engine', 'html');
app.set('views', __dirname);
app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.render('index.html');
});

app.listen(process.env.PORT);