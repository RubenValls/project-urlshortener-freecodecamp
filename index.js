require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

const urlShorterMiddleware = (req) =>{
  const pattern = new RegExp(
    '^([a-zA-Z]+:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  );
  const _url = req?.body?.url
  let _urlShorted = 0
  let _response = {}

  if(pattern.test(_url)){
    return _response = {
      original_url: _url,
      short_url: _urlShorted
    };
  }else{
    return _response = {
      error: "Invalid URL",
    };
  }
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res) {
  res.json(urlShorterMiddleware(req));
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
