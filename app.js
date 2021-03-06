var MONGOHQ_URL="mongodb://huia:aaa123@kahana.mongohq.com:10002/app30051564"

 var  express = require('express')
    , stylus = require('stylus')
    , http = require('http')
    , https = require("https")
    , path = require('path')
    , mongoose = require("mongoose")
    , querystring = require('querystring')
    , _ = require('underscore');
    //, io = require('socket.io')

    mongoose.connect(process.env.MONGOHQ_URL || MONGOHQ_URL);
    Candidato = mongoose.model('Candidato', 
      { 
            nome: String
          , imagem: String
          , numero: String
          , votos: [{timestamp: Date}]
      });

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 8080);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('diogola'));
    app.use(express.session());
    
    app.use(express.static(__dirname + '/public'));
    
    app.use(stylus.middleware({
        src:   __dirname + '/public/'
      , debug: true
      , compile : function(str, path) {
        console.info('compiling');
        return stylus(str)
          .set('filename', path)
          .set('warn', true)
          .set('compress', true);
      }
    }));

    app.use(app.router);
  });


app.get('/', function(req, res) {
  res.render('index');
});

app.get('/resultados', function(req, res) {
  res.render('result');
});

app.post('/vote', function(req, res){
    var num = req.body.numero;
      Candidato.findOne( {numero: num}, function(err, doc){
        if (err) res.send(500);
        doc.votos.push({timestamp: new Date()});
        doc.save(function(err){
          if(err) res.send(500);
          res.send(doc);      
        });
      });
});

var sv = http.createServer(app);
var io = require('socket.io').listen(sv);
io.set('log level', 1); 

var port = process.env.PORT || 7070;
sv.listen(port, function() {
  console.log("Listening on " + port);
});

