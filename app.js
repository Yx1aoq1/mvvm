const Express = require('express')

app = new Express()
app.use('/', Express.static(__dirname + '/public'))

app.listen(3000)