const errorhandler = (err, req, res, next) => {
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    })
}

module.exports = errorhandler;
