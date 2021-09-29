const express = require('express');

const routes = require('./routes/cats.route')

const app = express();
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use("/cats", routes.router);

const port  = process.env.NODEJS_PORT || 8080

app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
})