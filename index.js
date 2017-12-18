const axios = require('axios');
const async = require('async');
const qs = require('qs');
const PNG = require('pngjs').PNG;
const fs = require('fs');

const PIXELMIN = 0
const PIXELMAX = 255
const DIMENSIONS = 4

const HEIGHT = 128;
const WIDTH = 128;
const SIZE = HEIGHT*WIDTH*DIMENSIONS

const MAX_CHUNK = 10000

function createRequestChunks(size) {
  chunks = []
  while (size > 0) {
    chunk = Math.min(size, MAX_CHUNK)
    chunks.push(chunk)
    size -= chunk
  }
  return chunks
}

function getRandomNumbers(size, callback) {
  const chunks = createRequestChunks(size)

  async.reduce(chunks, [], (memo, chunk, callback) => {
    query = {
      num: chunk,
      min: PIXELMIN,
      max: PIXELMAX,
      col: 1,
      base: 10,
      format: 'plain',
      rnd: 'new'
    }

    const url = `https://www.random.org/integers/?${qs.stringify(query)}`

    axios.get(url)
      .then(res => {
        const randomNumbers = res.data.split('\n')
          .map(stringNumber => parseInt(stringNumber))
        // remove empty string at the end
        randomNumbers.pop()
        callback(null, memo.concat(randomNumbers));
      })
      .catch(err => {
        callback(err.response.data);
      })
  }, (err, results) => {
    callback(err, results);
  });
}

function generateRandomImage() {
  getRandomNumbers(SIZE, (err, data) => {
    if (err) {
      console.error(err);
    } else {
      var png = new PNG({
          height: HEIGHT,
          width: WIDTH,
          colorType: 2
      });
      png.data = data

      const outputFilename = 'random.png'
      png.pack().pipe(fs.createWriteStream(outputFilename));
      console.info(`Successfully saved image to location: ${outputFilename}`);
    }
  })
}

generateRandomImage()
