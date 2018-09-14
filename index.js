const express = require('express');
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const bodyParser = require('body-parser')

const SERVER_CONFIGS = require('./constants/server');

const configureServer = require('./server');
const configureRoutes = require('./routes');

const app = express();
const path = require('path')

require('dotenv').config()

app.use(express.static(path.join(__dirname, 'camuro/build')))

app.use(require('prerender-node'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/camuro/build/index.html'))
})

if(process.env.NODE_ENV === 'production'){
  auth = process.env
}
else{
  auth = require('./config.json')
}

configureServer(app);
configureRoutes(app);

app.listen(SERVER_CONFIGS.PORT, error => {
  if (error) throw error;
  console.log('Server running on port: ' + SERVER_CONFIGS.PORT);
});


var client = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: auth.SENDGRID_USERNAME,
    pass: auth.SENDGRID_PASSWORD
  }
})


app.post('/sendEmail', (req, res, next) => {
  var name = req.body.name
  var email = req.body.email
  var message = req.body.message
  var content = `name: ${name} \n email: ${email} \n message: ${message}`

  client.sendMail({
    from: 'sender@camuro.co',
    to: 'camuro.co@gmail.com',
    subject: 'New Message from Contact Form',
    text: content
  }, (err, info)=>{
    if(err){
      res.send(err)
    }
    else{
      res.status(200).json({
        success: true,
        message: 'Email Sent',
        name: name,
        text: content
      })
    }
  })
})
