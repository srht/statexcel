const express = require('express');
const formidable = require('formidable');
const reader = require('xlsx')
const app = express();
app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html');
});

app.post('/', function (req, res){
    const form = new formidable.IncomingForm();
    
    form.parse(req, (err, fields)=>{
        console.log(`maxval:${fields.maxVal}`)
    })
    
    form.on('fileBegin', function (name, file){
        if(file.size>0) file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('file', function (name, file){
        if(file.size>0){
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
    }
    });

    res.sendFile(__dirname + '/index.html');
});
 
app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...');
});