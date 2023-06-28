require('dotenv').config();
const express = require('express');
const cors = require('cors');
export const app = express();
const { MongoClient } = require('mongodb')

// Basic Configuration
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env.DB_URI)
const db = client.db('urlshortener')
const urls = db.collection('urls')

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

const urlShorterMiddleware = async (req) =>{
  const pattern = new RegExp(
    '^([a-zA-Z]+:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  );
  const urlsNumber = await urls.countDocuments({})
  const _url = req?.body?.url
  let _response = {}

  if(pattern.test(_url)){
    _response = {
      original_url: _url,
      short_url: urlsNumber,
    }
    await urls.insertOne(_response);
    return _response;
  }else{
    return _response = {
      error: "Invalid URL",
    };
  }
}

const redirectUrl = async (req) => {
  let _shorturl = Number(req?.params?.shorturl)
  let _url = await urls.findOne({short_url: _shorturl})
  return _url?.original_url;
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + './views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:shorturl', function(req, res) {
  redirectUrl(req).then((response) => res.redirect(response));
});

app.post('/api/shorturl', function (req, res) {
  urlShorterMiddleware(req).then((response) => {
    response.error 
      ? res.json({ 
        error: 'Invalid url'
        })
      : res.json({ 
      original_url: response.original_url,
      short_url: response.short_url 
    });
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

export default app;