const http = require('http');
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.end(`
            <title>Home Page</title>
            <h1> Welcome </h1>
            <p> You seem to have been coding for a while. Why dont you stop and take a break </p>
            <section><iframe src="https://giphy.com/embed/qESFbPpn6qPNo5yCQs" width="480" height="432" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></section>
            <STYLE type="text/css">
            * {background-color: rgb(247, 233, 244)}
  h1 { text-align: center; font-size: 48px}
  p { text-align: center; font-size: 32px}
  section {text-align: center}

 </STYLE>
        `)

    }
    else if (req.url === '/about') {
        res.end(`
            <h1> Shhhh </h1>
            <p> Nothing to see here </p>
            <section> <iframe src="https://giphy.com/embed/3o6MbgfQ9r8l5VuSc0" width="480" height="362" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe> </section>
            <STYLE>
            * {text-align: center;}
            h1 {  font-size: 48px}
  p { font-size: 32px}
  section {text-align: center}
            </STYLE>`)

    }
    else {
        res.end(`
        <h1> Oops! Page not found</h1>
        <p>We can't seem to find the page you are looking for</p>
        <section> <iframe src="https://giphy.com/embed/UoeaPqYrimha6rdTFV" width="480" height="271" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></section>
        <p><a href="/">Back to Home Page</a></p>
        <STYLE type="text/css">
            * {background-color: rgb(65, 156, 124); text-align: center;}
  h1 {  font-size: 48px}
  p { font-size: 32px}
  section {text-align: center}

 </STYLE>`)
    }
})

server.listen(3000)