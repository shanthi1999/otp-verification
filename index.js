const express = require('express');
const app = express();
const routes = require('./routes')


app.use(express.json());

app.listen(9000,()=>{
    console.log("port connected")
})

app.use('/api',routes);