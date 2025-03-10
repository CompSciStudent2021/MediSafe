const express = require('express');
const app = express();
const cors = require('cors');
const e = require('express');

//middleware

app.use(express.json());
app.use(cors());

//register and login routes

app.use('/auth', require('./routes/jwtAuth'));

//dashboard route

app.use('/dashboard', require('./routes/dashboard'));

// Profile route (add this!)
app.use('/profile', require('./routes/profile'));

// Records route
app.use("/patientrecords", require("./routes/patientrecords"));

// Appointments route
app.use("/appointments", require("./routes/appointments"));

app.listen(5000, () => {
    console.log('server has started on port 5000');
});