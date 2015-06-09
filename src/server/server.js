var path = require("path");
var bodyParser = require('body-parser');
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
            return db.collection('gatherings').findOne({_id: req.params.id}, cb);
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
    var item = req.body;
    item._id = generateId();
    saveOrUpdate(item, req, res);
}

function update(req, res) {
    var item = req.body;
    item._id = req.params.id;
    saveOrUpdate(item, req, res);
}

function saveOrUpdate(item, req, res) {
    //sanitize
    item = {
        _id: item._id,
        eaters: item.eaters,
        servingSize: item.servingSize,
        menu: item.menu
    };

    db.executeWithDb(function (db) {
        return q.denodeify(function (cb) {
            return db.collection('gatherings').save(item, cb);
        })().then(function (result) {
            if (/application\/json/.test(req.headers.accept)) {
                res.json(item);
            } else {
                res.redirect('/' + item._id);
            }
        }, function (err) {
            res.render('index', {err: err});
        });
    });
}

app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "../../dist")));
app.use(express.static(path.join(__dirname, "../../public")));
app.use(bodyParser.json()); // for parsing application/json
app.post('/', create);
app.put('/:id', update);
app.get('/:id', get);
app.get('/', get);
//app.use(cors());

var server = app.listen(process.env.PORT || 3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});

var io = require('socket.io')(server);
io.on('connection', function (socket) {
    console.log('connected');
    socket.on('setRoom', function (room) {
        console.log('setRoom: ' + room);
        socket.join(room);
        socket.on('intent', function (intent) {
            console.log('intent: ');
            console.log(intent);
            socket.to(room).emit('intent', intent);
        })
    });
});
