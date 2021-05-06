const express = require('express');
const exphbs=require('express-handlebars');
const formidable = require('formidable');
const mathjs = require('mathjs');
const reader = require('xlsx')
const app = express();

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine', 'hbs');

app.get('/', function (req, res){
    res.render('uploadform');
});

app.post('/', function (req, res){
    const errorData=[]
    const statsData=[]
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
        
        const data = []
        const sheets = readFile.SheetNames
        console.log(sheets[0])
        const temp = reader.utils.sheet_to_json(readFile.Sheets[readFile.SheetNames[0]], {defval:""})
        // console.log(sheet['My Sheet Name']['B3'].v);
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
                    const cellCode = reader.utils.encode_cell({c:colNum, r:rowNumber})
                    //console.log(`${key} satır ${parsedNumberVal} sütun hatalı`)
                    errorRow.push({column:key, rowNumber, cellCode })
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
    //for(let rowNum=0;rowNum<data.length;rowNum++)
    //console.log(`${data[rowNum][0]} ${data[rowNum][2]}`)

    const transpose = arr => arr.reduce((m, r) => (r.forEach((v, i) => (m[i] ??= [], m[i].push(v))), m), [])

    /*
    
*/
let transpozedData=transpose(data)

for (let columnNumber = 0; columnNumber < transpozedData.length; columnNumber++) {
    const cell = reader.utils.encode_cell({c:columnNumber, r:1})
    console.log(`${cell[0]} sütunu:`)
    
    const min=mathjs.min(transpozedData[columnNumber])
    console.log(`Min: ${min}`)
    const max=mathjs.max(transpozedData[columnNumber])
    console.log(`Max: ${max}`)
    const mean=mathjs.mean(transpozedData[columnNumber])
    console.log(`Mean: ${mean}`)
    const median=mathjs.median(transpozedData[columnNumber])
    console.log(`Median: ${median}`)
    statsData.push({
        cell:cell[0], min, max, mean, median
    })
}

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

        res.render('uploadform', {errorData:errorData.slice, statsData});
    }
    });
    
});
 
app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...');
});