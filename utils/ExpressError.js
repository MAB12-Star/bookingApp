class ExpressError extends Error{
    constructor(message,statusCode) {
        super();
        this.message = message;
        this.statuscode = statuscode;
    }
}

module.exports = ExpressError;