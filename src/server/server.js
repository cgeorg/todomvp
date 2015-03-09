var path = require("path");
var express = require('express');
var q = require('q');
var db = require('./db');

var app = express();

// length of 8 gives us 218 trillion options plus it's easy to copy these chars
var idString = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateId() {
  var base = idString.length,
      id = Math.floor(Math.random() * Math.pow(base, 8)),
      idStr = '';
  while (idStr.length < 8) {
    idStr = idString[id % base] + idStr;
    id = Math.floor(id / base);
  }
  return idStr;
}

//Yl6KMcqE
function get(req, res, next) {
  var id = req.params.id;

  if (id && !/^[0-9a-zA-Z]{8}$/.test(id)) {
    return next();
  }

  db.executeWithDb(function (db) {

    var gathering = q.denodeify(function (cb) {
      return db.collection('gatherings').findOne({id: req.params.id}, cb);
    })();
    var menus = q.denodeify(function (cb) {
      return db.collection('menus').find({}).toArray(cb);
    })();

    return q.all([gathering, menus])
      .then(function (values) {
        res.render('index', {gathering: values[0], menus: values[1]});
      }, function (err) {
        res.render('index', {err: err});
      });
  });
}

function create(req, res) {
  db.executeWithDb(function (db) {
    var id = generateId();
    var collection = db.collection('gatherings');
    collection.insert({
      id: id
    }, function (err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      assert.equal(1, result.ops.length);

      res.redirect('/' + id);
    });
  });
}

function update(req, res) {
  console.log(arguments);
  res.render('index');
}

app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "../../dist")));
app.use(express.static(path.join(__dirname, "../../public")));
app.post('/', create);
app.put('/:id', update);
app.get('/:id', get);
app.get('/', get);
//app.use(express.urlencoded());
//app.use(express.json());
//app.use(cors());

var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});