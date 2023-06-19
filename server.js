const express = require("express");
const dotenv =require('dotenv');
dotenv.config();
const app = express();
const path = require('path');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const cors =require("cors")

app.use(cors());
app.use(logger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '/public')));


const users = require('./routes/userRoutes');
const gender = require('./routes/genderRoutes');
const music = require('./routes/music');

app.use('/api', users);
app.use('/api', gender);
app.use('/api', music);

/* app.use('/', require('./routes/roots'));
app.use('/harmony', require('./routes/music')); */

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));