const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

const PORT = 3000;

const app = express();

const client = redis.createClient();

client.on('connect', function () {
    console.log('Connected to redis');
})

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(methodOverride('_method'));

app.get('/', function (req, res, next) {
    res.render('search');
})

app.post('/user/search', function (req, res, next) {
    let id = req.body.id;

    client.hgetall(id, function (err, obj) {
        if (!obj) {
            res.render('search', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
});

app.get('/user/add', function (req, res, next) {
    res.render('addUser');
})

app.post('/user/add', function (req, res, next) {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email
    ], function (error, obj) {
        if (!obj) {
            res.render('addUser', {
                error,
            })
        } else {
            obj.id = id;
            obj.first_name = first_name;
            obj.last_name = last_name;
            obj.email = email;
            res.redirect('/');
        }
    });
})

app.delete('/user/delete/:id', function (req, res, next) {
    client.del(req.params.id);
    res.redirect('/');
})

app.listen(PORT, function () {
    console.log('Server started on port' + PORT);
})