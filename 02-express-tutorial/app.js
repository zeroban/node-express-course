// app.use
// app.all
// app.listen

const express = require('express');
const app = express();
const { products } = require("./data");

// app.use to pull in static index.html page
app.use(express.static('./public'));


app.get('/api/v1/test', (req, res) => {
    res.json({ message: "It worked!" });

})


// app.get to pull in all products in json format
app.get('/api/v1/products', (req, res) => {
    res.json(products);
})

// app.get to locate product by ID
app.get('/api/v1/products/:productID', (req, res) => {
    const idToFind = parseInt(req.params.productID);
    const product = products.find((p) => p.id === idToFind);

    // if statement to locate if the product is appart of the data.js
    if (product) {
        res.json(product);
        console.log('You searched for a product based off the ID');
    }

    if (!product) {
        res.status(404).json({ error: 'Product not found' });
        console.log('The product you are looking for is not present');
    }

})


// adding in the query search and limit 
app.get('/api/v1/query', (req, res) => {
    const { search, limit, maxPrice, minPrice } = req.query
    let sortedProducts = [...products];

    if (search) {
        sortedProducts = sortedProducts.filter((product) => {
            return product.name.startsWith(search)
        })
    }
    if (limit) {
        sortedProducts = sortedProducts.slice(0, Number(limit))
    }

    if (maxPrice) {
        sortedProducts = sortedProducts.filter((product) => product.price <= Number(maxPrice));
    }

    if (minPrice) {
        sortedProducts = sortedProducts.filter((product) => product.price >= Number(minPrice));
    }


    if (sortedProducts.length < 1) {
        console.log("You landed here!")
        return res.status(200).json({ success: true, data: [] })
    }
    res.status(200).json(sortedProducts)
})


// app.all
app.all('*', (req, res) => {
    res.status(400).send('<h1>Page not found try again</h1>');
})

// app.listen
app.listen(3000, () => {
    console.log('Servier is listening on port 3000');
})