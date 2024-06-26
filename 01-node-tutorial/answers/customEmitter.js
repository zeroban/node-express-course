const EventEmitter = require('events');

const customEmitter = new EventEmitter();

// must setup the event then emit it at the end. 

// pulls in the name and emits it
customEmitter.on('greeting', (name) => {
    console.log(`Hey their ${name}! I hope your having a wonderful day/night!`);
    customEmitter.emit('response');
});



customEmitter.on('response', () => {
    console.log('This section is being emitted from the first event. How cool is this? ');
});

// pulls in msg from the emit (I will be emitted every 3 seconds)
customEmitter.on('timer', (msg) => {
    console.log(`${msg}`);
});

setInterval(() => {
    customEmitter.emit('timer', 'I will be emitted every 3 seconds');

}, 3000);

customEmitter.emit('greeting', 'john');
