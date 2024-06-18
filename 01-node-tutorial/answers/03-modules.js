// modules
const names = require(`./04-names`) // pulls in the module 04-names
const sayHi = require('./05-utils') // pulls in the module 05-utils
const data = require('./06-alternative-flavor') // pulls in the module 05-alternative-flavor
require("./07-mind-grenade") // pull in the function from 07-mind-grenade. Will execute if no other action is take


console.log(names.john, ":", names.peter, ":", names.sam); // console loges the names from the 04-names module
sayHi(names.john) // calls function from 05-utils and passes it the name john from the 04-names module
console.log(data); // calls data from the 06-alternative-flavor module
