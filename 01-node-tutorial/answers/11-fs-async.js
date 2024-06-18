const { writeFile } = require('fs');

console.log('start');
//writes the first line
writeFile('../content/result-async.txt', 'This is the first line.\n', (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Finished writing first line. Moving on to second one.');
    //writes and appends the second line
    writeFile('../content/result-async.txt', 'This is second line.\n', { flag: 'a' }, (err) => {
        if (err) {
            console.log(err);
            return;
        }

        console.log('Finished writing the second line. Moving on to the third');
        //writes and appeands the third line
        writeFile('../content/result-async.txt', 'This is the third line.\n', { flag: 'a' }, (err) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('Finished writing the third line. Done with this task');

        });
    });
});

console.log('I am at the end');
