import express from 'express'

const app = express()

// Responder a la ruta / con la callback
app.use('/', (req, res) => {
  switch (req.method) {
    case 'GET':
      res.json('Create tienda')
      break
    case 'POST':
      res.json('update tienda')
      break
    default:
      res.send('No deberias estar aqui')
  }
  res.json({"health": "alive (barely)"})
})

app.listen(8080, ()=> {
  console.log(`running on http://localhost:8080`)
})