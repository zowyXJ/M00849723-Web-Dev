// middleware/staticFile.js
const path = require('path');

const staticFile = (req, res, next) => {
    const filePath = path.join(__dirname, 'images', req.url);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
};

module.exports = staticFile;
