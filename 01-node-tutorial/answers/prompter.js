const http = require("http");
var StringDecoder = require("string_decoder").StringDecoder;

const getBody = (req, callback) => {
  const decode = new StringDecoder("utf-8");
  let body = "";
  req.on("data", function (data) {
    body += decode.write(data);
  });
  req.on("end", function () {
    body += decode.end();
    const body1 = decodeURI(body);
    const bodyArray = body1.split("&");
    const resultHash = {};
    bodyArray.forEach((part) => {
      const partArray = part.split("=");
      resultHash[partArray[0]] = partArray[1];
    });
    callback(resultHash);
  });
};

// here, you could declare one or more variables to store what comes back from the form.
let item = " ";
let fav_Colors = " ";
let back_color = " ";

// here, you can change the form below to modify the input fields and what is displayed.
// This is just ordinary html with string interpolation.
const form = () => {
  return `
  <body>
  <STYLE>
  body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-weight: bold;
            background-color: ${back_color};
        }

        .form-container { 
        border: 2px solid rgba(255, 255, 255, .2);
        padding: 20px;
        border-radius: 30px;
        background: gray;
        backdrop-filter: blur(20px);

        }
         
            </STYLE>



  <div class="form-container">
        <form method="POST">
            <label for="item">Pick your favorite shape:</label>
            <select id="item" name="item">
                <option value=""></option>
                <option value="Circle">circle</option>
                <option value="Square">square</option>
                <option value="Triangle">triangle</option>
                <option value="Rectangle">rectangle</option>
            </select>
              <p>${item}</p>

            <br>
            <br>
            <label for="fav_Color">Pick your favorite color:</label>
            <select id="fav_Colors" name="fav_Colors">
                <option value=""></option>
                <option value="Red">red</option>
                <option value="Blue">blue</option>
                <option value="Green">green</option>
                <option value="Yellow">yellow</option>
            </select>
              <p>${fav_Colors}</p>

            <br>
            <br>
            <button type="submit">Submit</button>
        </form>
    </div>
  </form>
  </body>
  `;
};

const server = http.createServer((req, res) => {
  console.log("req.method is ", req.method);
  console.log("req.url is ", req.url);
  if (req.method === "POST") {
    getBody(req, (body) => {
      console.log("The body of the post is ", body);
      // here, you can add your own logic

      if (body["item"]) {
        item = body["item"];
      }

      else {
        item = "Nothing was entered.";
      }


      // Your code changes would end here
      if (body["fav_Colors"]) {
        fav_Colors = body["fav_Colors"];
        back_color = body["fav_Colors"];
      }

      else {
        fav_Colors = "You did not pick a color.";
        back_color = "white";
      }

      res.writeHead(303, {
        Location: "/",
      });
      res.end();
    });
  }

  else {
    res.end(form());
  }
});

server.listen(3000);
console.log("The server is listening on port 3000.");
