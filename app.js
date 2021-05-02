const express = require('express');
const formidable = require('formidable');
const reader = require('xlsx')
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

router.get('/', function (req, res,next){
    res.sendFile(__dirname + '/index.html');
});

router.post('/', jsonParser, function (req, res){
    const form = new formidable.IncomingForm();

    console.log('max:')
    console.log(req.body)
    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);

        // Reading our test file
        const readFile = reader.readFile(file.path)
        
        let data = []
        
        const sheets = readFile.SheetNames
        
        for(let i = 0; i < sheets.length; i++)
        {
        const temp = reader.utils.sheet_to_json(
            readFile.Sheets[readFile.SheetNames[i]])
        temp.forEach((res) => {
            console.log(res['GMT Erişim Tarihi'])
            data.push(res)
        })
        }
        
        // Printing data
        //console.log(data[0]['Hedef'])

    });

    res.sendFile(__dirname + '/index.html');
});
 
app.use('/',router);