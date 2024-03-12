You continue with the same jobs-ejs repository from your previous lesson, but create a new branch called lesson 15.

The instructions below are for the Job model. If you are using a different or modified model, so as to prepare for your final project, you will have to adjust the code below.

The first step is to install the packages you will need.  These are development dependencies -- you do not need them in your runtime, if you deploy this application to the internet -- so you install them with the ```--save-dev``` flag.  You need mocha, chai, puppeteer, @faker-js/faker, and factory-bot, as follows:
```
npm install --save-dev mocha
npm install --save-dev chai
npm install --save-dev chai-http
npm install --save-dev factory-bot
npm install --save-dev @faker-js/faker
npm install --save-dev puppeteer
```
A suggestion: You probably should update the connect-mongodb-session package. There have been some serious security bugs in that package, now fixed.

## Setting Up To Test

Create a test directory in your repository. This is where you will put the actual test cases.  Edit your
.env file.  Currently you have a line for MONGO_URI.  Duplicate the line, and then change the copy to MONGO_URI_TEST.  Add "-test" onto the end of the value.  This gives you a separate test database.  Edit your package.json.  In the scripts stanza, the line for "test" should be changed to read:
```
  "test": "NODE_ENV=test mocha tests/*.js --exit",
```
which will cause the tests to run.  It also sets the NODE_ENV environment variable, which we'll use to load the test version of the database.  Edit your app.js.  You'll have a line that reads something like:
```
    await require("./db/connect")(process.env.MONGO_URI);
```
You should change it to look something like the following:
```
let mongoURL = process.env.MONGO_URI
if (process.env.NODE_ENV == "test") {
    mongoURL = process.env.MONGO_URI_TEST
}
await require("./db/connect")(mongoURL);
```
The point of this is so that your testing doesn't interfere with your production database, and also so that your production or development data doesn't interfere with your testing.  Also, you want to have a function that will bring the database to a known state, so that previous tests don't cause subsequent ones to give false results.  Create a file util/seed_db.js.  It should read as follows:
```
const Job = require("../models/Job")
const User = require("../models/User")
const faker = require("@faker-js/faker").fakerEN_US
const FactoryBot = require('factory-bot');
require('dotenv').config()

const testUserPassword = faker.internet.password()
const factory = FactoryBot.factory
const factoryAdapter = new FactoryBot.MongooseAdapter()
factory.setAdapter(factoryAdapter)
factory.define('job',Job, {
    company: () => faker.company.name(),
    position: () => faker.person.jobTitle(),
    status: () => ["interview","declined","pending"][Math.floor(3 * Math.random())], // random one of these
} 
)
factory.define('user', User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password()
})

const seed_db = async () => {
  let testUser=null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST
    await Job.deleteMany({}) // deletes all job records
    await User.deleteMany({}) // and all the users
    testUser = await factory.create('user', { password: testUserPassword })
    await factory.createMany('job', 20, {createdBy: testUser._id}) // put 30 job entries in the database.
  } catch(e) {
    console.log("database error")
    console.log(e.message);
    throw(e);
  }
  return testUser;
}

module.exports = { testUserPassword, factory, seed_db }
```
A couple of new ideas are introduced above.  First, faker is being used to generate somewhat random but plausible data.  Second, we are using factories to automate the creation of data, which is being written to the database.

## Unit Testing a Function

Create a file, utils/multiply.js.  It should export a function, multiply, that takes two arguments and returns the product.  Now we can write a unit test, in tests/test_multipy.rb:
```
const multiply = require('../util/multiply')
const expect = require('chai').expect

describe('testing multiply', () => {
  it('should give 7*6 is 42', (done) => {
    expect(multiply(7,6)).to.equal(42)
    done()
  })
  it('should give 7*6 is 42', (done) => {
    expect(multiply(7,6)).to.equal(97)
    done()
  })
})
```
Then do: ```npm run test``` You will see that the first test passes, but the second one fails, as one would think.  You can delete the second test.  You might want to create tests for other numbers, to make sure the function doesn't always return 42.

## Function Testing for An API

Your current application doesn't have an API, so you can add one by adding the following to app.js:
```
app.get("/multiply", (req,res)=> {
  const result = req.query.first * req.query.second
  if (result.isNaN) {
    result = "NaN"
  } else if (result == null) {
    result = "null"
  }
  res.json({result: result})
})
```
You also have to change app.js to make your app available to the test.  The bottom of the file should look like:
```
const port = process.env.PORT || 3000;
const start = () => {
  try {
    require("./db/connect")(url);
    return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

const server = start();

module.exports = { app, server };
```
You can try it out if you like, by doing the following in your browser:
```
http://localhost:3000/multiply?first=5&second=27
```
Then create a test, a file tests/test_multiply_api.js, as follows:
```
const chai = require("chai");
chai.use(require("chai-http"));
const { app, server } = require("../app");
const expect = chai.expect

describe("test multiply api", function () {
    after(() => {
      server.close();
    });
    it("should multiply two numbers", (done) => {
          chai.request(app).get("/multiply")
          .query({first: 7, second: 6})
          .send()
          .end((err,res)=> {
          expect(err).to.equal(null)          
          expect(res).to.have.status(200)
          expect(res).to.have.property("body")
          expect(res.body).to.have.property("result")
          expect(res.body.result).to.equal(42)
          done()
        })
    })
})
```
Note first of all that this file actually requires your app, which causes your app to run.  Chai is going to send data to that running app.  The chai-http package adds HTTP functions to Chai, so it now has the get() method (as well as post, patch, etc.), and these return a request object with methods query, send, and end. The end method has a callback that returns either an error or a result.  One can then check the result status and body.  Finally, each test must call done().  The server.close() ends the server.  Do ```npm run test``` to try it out.

## Function Testing for Rendered HTML

Of course, the application you are writing is not intended to provide an API.  Instead it provides rendered HTML pages.  You can test these as well.

There are two annoying problems to deal with, one in Chai and one in the Express rendering engine.  In Express, when a page is rendered, it should set the Content-Type response header to be text/html.  But it doesn't.  The second problem is that if Chai recieves a response without the Content-Type header, it tries to parse it as JSON, and throws an error if that fails. It should catch the error and call the callback, but it doesn't, which is crude.  You can fix the issue by setting the Content-Type header appropriately, with this middleware, which should be added before your routes:
```
app.use((req,res,next)=> {
  if (req.path == "/multiply") {
    res.set("Content-Type","application/json")
  } else {
    res.set("Content-Type","text/html")
  }
  next()
})
```
Now create a simple UI test case, in tests/test_ui.js:
```
const chai = require("chai");
chai.use(require("chai-http"));
const { app, server } = require("../app");
const expect = chai.expect;

describe("test getting a page", function () {
  after(() => {
    server.close();
  });
  it("should get the index page", (done) => {
    chai
      .request(app)
      .get("/")
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Click this link");
        done();
      });
  });
});

```
In this case, you get a res.text, instead of a res.body.  The text is the actual HTML sent back in response to the request, as a string.  Checking the string to see if the response was correct can be a little clumsy, as compared with checking the results of an API.  Anyway, verify that your tests still pass, by doing ```npm run test```.  If you used slightly different wording in your page, you'll have to change the test above.

## Testing Registration 

Here is a test for registration:
```const chai = require("chai");
chai.use(require("chai-http"));
const { app, server } = require("../app");
const expect = chai.expect;

const { factory, seed_db } = require("../util/seed_db");
const faker = require("@faker-js/faker").fakerEN_US;

const User = require("../models/User");

describe("tests for registration and logon", function () {
  after(() => {
    server.close();
  });
  it("should get the registration page", (done) => {
    chai
      .request(app)
      .get("/session/register")
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Enter your name");
        const textNoLineEnd = res.text.replaceAll("\n", "");
        const csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
        expect(csrfToken).to.not.be.null;
        this.csrfToken = csrfToken[1];
        expect(res).to.have.property("headers");
        expect(res.headers).to.have.property("set-cookie");
        const cookies = res.headers["set-cookie"];
        const csrfCookie = cookies.find((element) =>
          element.startsWith("csrfToken"),
        );
        expect(csrfCookie).to.not.be.undefined;
        const cookieValue = /csrfToken=(.*?);\s/.exec(csrfCookie);
        this.csrfCookie = cookieValue[1];
        done();
      });
  });

  it("should register the user", async () => {
    this.password = faker.internet.password();
    this.user = await factory.build("user", { password: this.password });
    const dataToPost = {
      name: this.user.name,
      email: this.user.email,
      password: this.password,
      password1: this.password,
      _csrf: this.csrfToken,
    };
    try {
      const request = chai
        .request(app)
        .post("/session/register")
        .set("Cookie", `csrfToken=${this.csrfCookie}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(dataToPost);
      res = await request;
      console.log("got here");
      expect(res).to.have.status(200);
      expect(res).to.have.property("text");
      expect(res.text).to.include("Jobs List");
      newUser = await User.findOne({ email: this.user.email });
      expect(newUser).to.not.be.null;
      console.log(newUser);
    } catch (err) {
      console.log(err);
      expect.fail("Register request failed");
    }
  });
});
```
Ok, there's a lot going on here. The test first gets the registration form.  So far so good. Then, the task is to post values for the form so that the user is actually registered.  But, to post a form, we have to get past the protection against cross site request forgery that you implemented in the last lesson.  To do that, we need the CSRF token, which appears in the form itself, but we have to find it. We can do that using a regular expression. First we take the line ends out of the form, as they mess up regular expression parsing. Then we execute a regular expression to find the token itself.  If you don't know regular expressions, they are good to learn, but otherwise just use the one herein provided. When we post the values for the form, we need to include the value for the csrf token. We store it in this.csrfToken, so that we can reuse the value.  The other half of the CSRF protection is that we also need to send the cookie.  Chai does not keep cookie values between tests. We have to preserve the ones we want, and include them on subsequent requests.  Chai doesn't even store the cookies in a very friendly way. We have to parse them out of the response headers, so there is more logic to do that. For each of these steps, we do a Chai assertion (expect) so that we know all is working.

If one of the expect() assertions fails, the rest of the code in that it() stanza does not run, but execution will continue with the next stanza.

### A Reminder About Arrow Functions and Non-Arrow Functions

You will notice that we declare anonymous functions two different ways:
```
describe("tests for registration and logon", function () {
```
and
```
  it("should get the registration page", (done) => {
```
The difference is that arrow functions do not have their own "this"!  They inherit the this of the context in which they were defined. So, when we save to the variable this.csrfToken, we do it in the context of the describe().  On that call to describe, we pass ```function ()```, and so the this is associated with that context. As a result this.csrfToken is available on our next it() call within that same describe, so long as that call to it() passes an arrow function.  The best practice is to use arrow functions with it() and not to use them with describe().

## Posting the Form Values

Ok, so what do we post, and where do we post it? The post for register is /sessions/register.  If we look at the register view, we see what is expected, from the names of the entry fields.  These are name, email, password, and password1 (for password confirmation).  To get values for these, we can use the user factory created in util/seed_db.js.  But (a) we need to save the password, so that we can use it to test logon; (b) we need to save other values for the user, again for logon, and (c) we use factory.build, not factory.create, because we don't want the factory to store values in the database. That's what the actual register operation is supposed to do.

When we post, we have to set the cookie for CSRF protection.  We also have to set the content-type, which would otherwise be JSON. We also have to include the csrfToken in the data that is posted, with the name _csrf.  Now, we have a couple of asynchronous calls here. Therefore, on the call to the 'it' function, we do not include a callback with ```(done) =>```.  Instead we pass an async function, so that we can use await on the factory call.  Also, we need to be able to do assertion tests in an the same async function, because we need to check the database, which is an async call. The chai.request call returns a "thenable" which works like a promise, except we can further qualify it before resolving the promise.m So we set up the call, save the thenable in the request variable, and then resolve it to get the res object back, all within a try/catch.
We can then search the database to verify that the user object was actually created.

Just to restate, we have two kinds of it() statements;
```
  it("should get the registration page", (done) => {
```
and
```
  it("should register the user", async () => {
```
In the first way, we pass a callback, the done() function, and that must be called at the completion of the test.  In the second way, we just declare an async function.

If the user is actually created, our controller sends a redirect.  By default, Chai traverses the redirect automatically, so that the res object coming back should have a status of 200.  It should redirect to the index page, and on that page one should see "Click this link to logon".

### An Aside on Status Codes

When the controller gets an error from a post, it can render the page again
```
      req.flash("error", "That email address is already registered.");
      return res.status(400).render("register", { errors: req.flash("error") });
```
Be careful to include the status(400).  If the status is 200, the request is expected to have succeeded.  Check your render statements to make sure that if there is an error condition, the 400 status code is set.  I think I provided some code in earlier lessons that did not do that.

## Testing Logon

We saved this.user and this.password, so we should be able to log in.  We'll skip actually loading the logon form -- you could add that test if you like -- and we'll do the post for logon.  When you logon, you are redirected.  By default, Chai then follows the redirection, but what it doesn't do is keep the cookies.  When you do the .send for the test, the cookies are already gone.  This is completely useless for logon. We need the session cookie for subsequent requests.  It is pretty poor in another way.  If you redirect, the session contains the flash information for user messages, but if the cookies are gone, so are the flash messages.  So, a better policy is to disable redirects by doing .redirects(0) on the request. If a redirect occurs, the status is 302, and the req.headers.location is the target for the redirect.  (Editorial aside: Chai really ought to save those cookies.) So, here is the logon test:
```
  it("should log the user on", async () => {
    const dataToPost = {
      email: this.user.email,
      password: this.password,
      _csrf: this.csrfToken,
    };
    try {
      const request = chai
        .request(app)
        .post("/session/logon")
        .set("Cookie",this.csrfCookie)
        .set("content-type", "application/x-www-form-urlencoded")
        .redirects(0)
        .send(dataToPost);
      res = await request;
      expect(res).to.have.status(302);
      expect(res.headers.location).to.equal('/')
      const cookies = res.headers["set-cookie"];
      this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid"),
    );
    expect(this.sessionCookie).to.not.be.undefined;
    } catch (err) {
      console.log(err);
      expect.fail("Logon request failed");
    }
  });
  it("should get the index page", (done)=>{
    chai.request(app).get("/")
    .set('Cookie',this.sessionCookie)
    .send()
    .end((err,res)=>{
        expect(err).to.equal(null)
        expect(res).to.have.status(200)
        expect(res).to.have.property("text")
        expect(res.text).to.include(this.user.name)
        done()
    }) 
  });
```
There are two parts to the test.  The first does the logon.  You get a redirect ... but it will redirect to the same place whether the logon succeeds or fails.  And you will have a session cookie even before you log in.  So how do you know whether the logon succeeded?  The only way is to get the index page again.  If the logon is successful, it will show the user's name, but if not, it will show the error message.  To do this, we have to include the session cookie in the request, as we do above.

**Now: Some code for you to write.**  Create a test for logoff.  Logoff won't work unless there has been a logon, and unless you send the _csrf value and set cookies for both the csrfToken and the sessionCookie.  The latter code is:
```
.set("Cookie", csrfToken + ";" + sessionCookie)
```
The only way to know if it succeeded is to send a get request for the index page, passing the session cookie you already had.  It will have the message about clicking the link to logon, and it will not have the user name, because that session has been invalidated on the server side.

## Testing Job CRUD Operations

Create a new file, tests/crud_operations.js.  The flow for testing CRUD operations is as follows.

1. Seed the database! You have a utility routine for that in util/seed_db.js
2. Logon! You will have to get the logon page to get the CSRF token and cookie. The seed_db.js module has a function to seed the database with a user entry, and it also exports the user's password, so you can use those. You'll need to save the session cookie.
3. Get the job list! You have to include the session cookie with your get request. The seed operation stores 20 entries. Your test should verify that a status 200 is returned, and that exactly 20 entries are returned.  That's a little complicated for an html page, but in this case, you can just check how many times "<li>" appears on the page.  Here's how you might do that part:
    ```
    const pageParts = res.text.split("<li>")
    expect(pageParts).to.equal(21)
    ```
    As you can see, scanning the page to see if the result is correct is kind of messy.
4. Add a job entry! This is a post for the job form. You will have to include _csrf in the post, and you will need to set the CSRF and session cookies.  You could use the factory to create values for the job, via a factory.build('job').  It doesn't really matter if you disable redirect or not. The only test you need to do is a Job.findOne to find an entry with the same attributes as the one you built.  But that is an asynchronous call, so you need to handle it just as was done for the register operation.

## Puppeteer

In actual practice, chai-http is mostly used for testing APIs. To test a user interface, whether it be server side rendered or full stack, one would use an actual browser testing engine such as puppeteer.  Create a file, tests/puppeteer.js, with the following contents:
```
const puppeteer = require("puppeteer");
const { server } = require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");

let testUser = null;

const runTests = async () => {
  let page = null;
  let browser = null;
  // Launch the browser and open a new blank page
  describe("index page test", function () {
    before(async function () {
      this.timeout(10000);
      browser = await puppeteer.launch();
      page = await browser.newPage();
      await page.goto("http://localhost:3000");
    });
    after(async function () {
      this.timeout(5000);
      await browser.close();
      server.close();
      return;
    });
    describe("got to site", function () {
      it("should have completed a connection", function (done) {
        done();
      });
    });
    describe("index page test", function () {
      this.timeout(10000);
      it("finds the index page logon link", async () => {
        this.logonLink = await page.waitForSelector(
          "a ::-p-text(Click this link to logon)",
        );
      });
      it("gets to the logon page", async () => {
        await this.logonLink.click();
        await page.waitForNavigation();
        const email = await page.waitForSelector("input[name=email]");
      });
    });
    describe("logon page test", function () {
      console.log("at line 48", this.outerd, this.innerd, this.secondIt)
      this.timeout(20000);
      it("resolves all the fields", async () => {
        this.email = await page.waitForSelector("input[name=email]");
        this.password = await page.waitForSelector("input[name=password]");
        this.submit = await page.waitForSelector("button ::-p-text(Logon)");
      });
      it("sends the logon", async () => {
        testUser = await seed_db();
        await this.email.type(testUser.email);
        await this.password.type(testUserPassword);
        await this.submit.click();
        await page.waitForNavigation();
        await page.waitForSelector(
          `p ::-p-text(${testUser.name} is logged on.)`,
        );
        await page.waitForSelector("a ::-p-text(change the secret");
        await page.waitForSelector('a[href="/secretWord"]');
        const copyr = await page.waitForSelector("p ::-p-text(copyright)");
        const copyrText = await copyr.evaluate((el) => el.textContent);
        console.log("copyright text: ", copyrText);
      });
    });
  });
};
```
In each of the describe() stanzas, as well as in before() and after(), we call this.timeout() to set a reasonable number of milliseconds after which the operation should be abandoned.  The puppeteer.launch() call actually launches the browser, which by default is a version of Chrome.  The browser.newPage() call opens up a browser page.  The page.goto() call opens the root page of the application being tested.  Then, we have the following calls:

- page.waitForSelector(): Waits for DOM entry matching the selector to appear on the page.
- page.waitForNavigation(): Waits for the next page to display.
- entry.type(): Types a value into an entry field.
- entry.click(): Clicks on a button or other control.

You can see that these allow you to traverse the application, and there are other operations as well, which you can find in the online documentation for puppeteer [here](https://pptr.dev/).  The waitForSelector() function takes one argument, which is the selector.  These come in two flavors:

- CSS style selectors: ```await page.waitForSelector('a[href="/secretWord"]');```.  This finds a link to the /secretWord page.
- P selectors, a puppeteer add on: ```await page.waitForSelector("p ::-p-text(copyright)");``` This one finds a paragraph element with the text "copyright" in it.

The test uses these to click on the link for the logon page, to fill out the page, and to verify that the right page came back and the logon completed.  The seed_db utility is used to create a user that is used for the logon, and to create some job entries belonging to that user.  Run ```npm run test``` to verify that all still works.

Now, if you like, you can watch the process.  If you change the puppeteer.launch() statement to read
```
puppeteer.launch({headless: false, slowMo: 100})
```
and then rerun the test, you'll see the test in progress.  However, an aside for Windows users: If you are in the habit of doing your development in the  Windows Linux Subsystem, the headless:false may or may not work.

## More Code to Write

The test you are to add is to verify that the job operations work correctly.  Add to the test scenario as follows:

1. Add the expect function from Chai to the test, as you will need it.
2. Add a new describe() stanza for this series of tests.
2. (test1) Make the test do a click on the link for the jobs list.  
3. Verify that the job listings page comes up, and that there are 20 entries in that list.
      A hint here: page.content() can be used to get the entire HTML page, and you can use the split() function on that to could the ```<li>```entries.
4. (test2) Have the test click on the "Add A Job" button and to wait for the form to come up.  Verify that it is the expected form.  
5. (test3) Use factory.build('job') to create values for a new entry, have them typed into the form.  Then have it click on the add button.
6. Wait for the jobs list to come back up, and verify that the message says that the job listing has been added.
7. Check the database to see that the latest jobs entry has the data entered. (This is where you use Chai expect.)

## Submit Your Code

As usual.