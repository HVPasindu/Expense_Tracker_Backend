require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/user-routes');
const expenseRoutes = require('./routes/expense-routes');


app.use(express.json());


app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})