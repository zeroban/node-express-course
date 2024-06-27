const { writeFile, readFile } = require("fs").promises;

writeFile('../content/temp1.txt', 'I am the first line \n', { flag: 'a' })
    .then(() => {
        return writeFile('../content/temp1.txt', 'I am the second line \n', { flag: 'a' })
    })
    .then(() => {
        return writeFile('../content/temp1.txt', 'I am the third line \n', { flag: 'a' })
    })

    .then(() => {
        return readFile('../content/temp1.txt', 'utf8')
    })

    .then((data) => {
        console.log(data);
    })


    .catch((error) => {
        console.log('Unexpected error: ', error);
    });