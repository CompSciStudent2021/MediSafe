const express = require('express');
const app = express();
const cors = require('cors');
const prescriptionRouter = require("./routes/prescription");

//middleware
app.use(express.json());
app.use(cors());

//register and login routes
app.use('/auth', require('./routes/jwtAuth'));

//dashboard route
app.use('/dashboard', require('./routes/dashboard'));

// Profile route
app.use('/profile', require('./routes/profile'));

// Records route
app.use("/patientrecords", require("./routes/patientrecords"));

// Appointments route
app.use("/appointments", require("./routes/appointments"));

// Prescriptions route - only use one route
app.use("/prescriptions", prescriptionRouter);

app.listen(5000, () => {
    console.log('server has started on port 5000');
});