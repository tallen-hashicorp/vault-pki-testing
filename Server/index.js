var winston = require('winston'),
    expressWinston = require('express-winston');
const axios = require('axios');


const express = require('express')
var https = require('https')
var http = require('http')
const app = express()
const port = 3000

setupSSH()

async function loginToVault(){
  const login = await axios.post('http://127.0.0.1:8200/v1/auth/approle/login', {
      "role_id": process.env.ROLEID,
      "secret_id": process.env.SECRETID
    });
  return login.data.auth.client_token
}

async function setupSSH(){
  const token = await loginToVault();
  const certs = await axios.post('http://127.0.0.1:8200/v1/pki_int/issue/example-dot-com',{
    "common_name": "localhost",
    "ttl": "24h"
  },{
    headers: {
      'X-Vault-Token': token
    }
  })
  const certificate = certs.data.data.certificate
  const privateKey = certs.data.data.private_key
  var credentials = {key: privateKey, cert: certificate};

  var httpServer = http.createServer(app);
  var httpsServer = https.createServer(credentials, app);
  
  httpServer.listen(8081);
  httpsServer.listen(8443);
}

app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console()
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli()
    ),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})