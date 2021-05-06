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
        let errorData=[]
        const sheets = readFile.SheetNames
        console.log(sheets[0])
        const temp = reader.utils.sheet_to_json(readFile.Sheets[readFile.SheetNames[0]], {defval:""})

        let rowNumber=0
          temp.forEach((res) => {
            let rowArr=[]
            let errorRow=[]
            let colNum=0
            for (var key in res){
                let value = res[key].toString();
                //console.log(key + ": " + value);
                let trimmed=value.trim()
                let parsedNumberVal=Number(trimmed)
                if(!value || isNaN(parsedNumberVal)){
                    const cell = reader.utils.encode_cell({c:colNum, r:rowNumber})
                    //console.log(`${key} satır ${parsedNumberVal} sütun hatalı`)
                    errorRow.push({column:key, rowNumber, cell })
                    rowArr.push(0)
                }
                else{
                    rowArr.push(parsedNumberVal)
                }
                //console.log(Number(trimmed))
                colNum++
              }
              /*console.log(res['PREOP CA /POSTOP CA'])
              let preop=res['PREOP CA /POSTOP CA'];
              let numbers=preop.split('/').map((n)=>Number(n))
              data.push({ name: res[3], numbers: numbers })*/
              data.push(rowArr)
              errorData.push(errorRow)
              rowNumber++
          })
        //  res.setHeader('Content-Type', 'application/json');
    //res.end(JSON.stringify(data));
    for(let rowNum=0;rowNum<data.length;rowNum++)
    console.log(`${data[rowNum][0]} ${data[rowNum][2]}`)
        //console.log(reader.utils.encode_cell({c:2, r:4}))
        /*
        for(let i = 0; i < sheets.length; i++)
        {
            const temp = reader.utils.sheet_to_json(readFile.Sheets[readFile.SheetNames[i]])
            temp.forEach((res) => {
                console.log(res['PREOP CA /POSTOP CA'])
                /*let preop=res['PREOP CA /POSTOP CA'];
                let numbers=preop.split('/').map((n)=>Number(n))
                data.push({ name: res[3], numbers: numbers })
            })
        }
        */
        // Printing data
        //console.log(data[0]['Hedef'])
        //console.log(errorData)
    }
    });

    
    res.sendFile(__dirname + '/index.html');
});
 
app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...');
});