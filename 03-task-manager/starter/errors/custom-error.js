


class CustomAPIError extends Error {
    constructor(message, statusCode) { // invoke constructor when creating a new instance of a class
        super(message) // invoke the constructor of the parent class
        this.statusCode = statusCode
    }
}

const createCustomError = (msg, statusCode) => {
    return new CustomAPIError(msg, statusCode)
}


module.exports = { createCustomError, CustomAPIError }