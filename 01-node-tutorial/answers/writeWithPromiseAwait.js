const { writeFile, readFile } = require("fs").promises;

const writer = async () => {
    try {
        await writeFile('../content/temp.txt', 'I am writing something to my temp.txt file \n', { flag: 'a' });
        await writeFile('../content/temp.txt', 'I am writing something to my temp.txt file \n', { flag: 'a' });
        await writeFile('../content/temp.txt', 'I am writing something to my temp.txt file \n', { flag: 'a' });
    }

    catch (err) {
        console.log(err);
    }
}

const reader = async () => {
    try {
        const data = await readFile('../content/temp.txt', 'utf8');
        console.log('File contents:', data);
    }

    catch (error) {
        console.log(error);
    }
}

const readWrite = async () => {
    await writer();
    await reader();
}

readWrite();