const { createReadStream } = require('fs');

const stream = createReadStream('../content/big.txt', { highWaterMark: 200, encoding: 'utf8' });

var counter = 0;
stream.on('data', (result) => {
    counter += result.length;
    console.log(result);
    console.log(counter);
});

stream.on('end', (result) => {
    console.log('Total number of bytes read was: ', counter);
});

stream.on('error', (err) => {
    console.log('Huston we have an error! Error stack: ', err)
});


