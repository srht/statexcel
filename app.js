const express = require('express');
const exphbs = require('express-handlebars');
const formidable = require('formidable');
const ExcelProcessor=require('./core/excel-process')
const app = express();

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine', 'hbs');

app.get('/', function (req, res) {
    res.render('uploadform');
});

app.post('/', function (req, res) {
    const errorData = []
    const statsData = []
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
        console.log(`maxval:${fields.maxVal}`)
    })

    form.on('fileBegin', function (name, file) {
        if (file.size > 0) file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('file', function (name, file) {
        if (file.size > 0) {
            console.log('Uploaded ' + file.name);

            const returnObj= ExcelProcessor.process(file)

            res.render('uploadform', returnObj);
        }
    });

});

app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000 ...');
});