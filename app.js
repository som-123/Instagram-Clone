const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const mongoose = require('mongoose');
const { mongoUrl } = require('./keys');
const cors = require('cors');
const path = require('path');

require('./models/model');
require('./models/post');

app.use(cors());
app.use(express.json());
app.use(require('./routes/auth'));
app.use(require('./routes/createPost'));
app.use(require('./routes/user'));

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000
});

mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Failed to connect to MongoDB', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection is disconnected');
});

// Serving the frontend
app.use(express.static(path.join(__dirname, './frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(
        path.join(__dirname, './frontend/build/index.html'),
        function (err) {
            res.status(500).send(err);
        }
    );
});

app.listen(PORT, () => {
    console.log('Server is running on ' + PORT);
});
