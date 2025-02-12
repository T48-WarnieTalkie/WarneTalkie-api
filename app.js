var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cors = require('cors')
var morgan = require('morgan')
require('dotenv').config();

const dangerRouter = require('./routes/danger');
const userRouter = require('./routes/user');
const authenticationRouter = require('./routes/authentication')
const userSensitiveRouter = require('./routes/userSensitive')

const refreshStatuses = require('./middleware/refreshStatuses');

var app = express();

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.DB_URL);
  console.log('should be connected?');
}

app.use(cors());
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'node_modules')));

//refresh danger statuses at the start of every route
app.use(refreshStatuses)

app.use('/api/v1/dangers', dangerRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/userSensitives', userSensitiveRouter)
app.use('/api/v1/authentications', authenticationRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err)
  res.status(err.status || 500);
  res.send();
});

module.exports = app;

