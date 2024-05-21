import express from 'express'

const app = express()

// Responder a la ruta / con la callback
app.use('/', (req, res) => {
  res.json({"health": "alive (barely)"})
})

app.listen(8080, ()=> {
  console.log(`running on http://localhost:8080`)
})