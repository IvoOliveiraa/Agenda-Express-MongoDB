require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect(process.env.CONNECTIONSTRING)
    .then(() =>{
        app.emit('pronto');
    })
    .catch(e => console.log(e));

const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash'); 
const routes = require('./routes');
const path = require('path');
const helmet = require('helmet');
const csurf = require('csurf');
const {middlewareGlobal, checkCsurfError, csurfMiddleware} = require('./src/middlewares/middleware');

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

const sessionOptions = session({
    secret: 'ahsuahushahs()',
    store: MongoStore.create({
        mongoUrl: process.env.CONNECTIONSTRING,
        mongooseConnection: mongoose.connection
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
});

app.use(sessionOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csurf());

//Nossos próprios middlewares
app.use(middlewareGlobal);
app.use(checkCsurfError);
app.use(csurfMiddleware);
app.use(routes);

app.on('pronto', () => {
    app.listen(3000, ()=>{
        console.log('Acessar http://localhost:3000');
        console.log('Servidor execultando na porta 3000');
    });
});
