import express from "express";
import routers from "./src/routes/routers.js";


const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

for (const {path,router} of routers) {
  app.use(path,router)
}


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
