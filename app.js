const express=require('express');
const app=express();
const cors = require('cors')

require('./db')

app.use(cors())
app.use(express.json());

// routes
app.use(require('./routes/auth'));
app.use(require('./routes/notes'));

const port=process.env.PORT || 5000;

app.listen(port,()=>{
    console.log(`I-notebook server is listening at https://localhost:${port}`)
})
