const MongoClient = require('mongodb').MongoClient

var db

MongoClient.connect('mongodb://@localhost:27017/', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
})