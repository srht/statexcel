const express = require('express');
const exphbs = require('express-handlebars');
const formidable = require('formidable');
const mathjs = require('mathjs');
const reader = require('xlsx')
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

            // Reading our test file
            const readFile = reader.readFile(file.path)

            const data = []
            const columnTitles=[]
            const sheets = readFile.SheetNames
            console.log(sheets[0])
            const sheetRows = reader.utils.sheet_to_json(readFile.Sheets[readFile.SheetNames[0]], { defval: "" })
             
            let rowNumber = 0
            sheetRows.forEach((row) => {
                let rowArr = []
                let colNum = 0
                for (let column in row) {
                    if(columnTitles.indexOf(column)===-1) columnTitles.push(column)
                    let cellValue = row[column].toString();
                    //console.log(key + ": " + value);
                    let trimmedCellValue = cellValue.trim()
                    let parsedNumberVal = Number(trimmedCellValue)
                    if (!cellValue || isNaN(parsedNumberVal)) {
                        const cellCode = reader.utils.encode_cell({ c: colNum, r: rowNumber })
                        //console.log(`${key} satır ${parsedNumberVal} sütun hatalı`)
                        errorData.push({ column, colNum, rowNumber, cellCode })
                        rowArr.push(0)
                    }
                    else {
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
                rowNumber++
            })
            //  res.setHeader('Content-Type', 'application/json');
            //res.end(JSON.stringify(data));
            //for(let rowNum=0;rowNum<data.length;rowNum++)
            //console.log(`${data[rowNum][0]} ${data[rowNum][2]}`)

            const transpose = arr => arr.reduce((m, r) => (r.forEach((v, i) => {
                if (!m[i]) m[i] = []; else m[i].push(v);
            }), m), [])

            const onlyUnique=(value, index, self)=>self.indexOf(value)===index;

            /*
            
        */
            let transpozedData = transpose(data)
            let errorSummary=[]
            for (let columnIndex = 0; columnIndex < transpozedData.length; columnIndex++) {
                const columnCode = reader.utils.encode_col(columnIndex)
                //console.log(`${cell[0]} sütunu:`)

                const min = mathjs.min(transpozedData[columnIndex])
                //console.log(`Min: ${min}`)
                const max = mathjs.max(transpozedData[columnIndex])
                //console.log(`Max: ${max}`)
                const mean = mathjs.mean(transpozedData[columnIndex])
                //console.log(`Mean: ${mean}`)
                const median = mathjs.median(transpozedData[columnIndex])

                const variance = mathjs.variance(transpozedData[columnIndex])
                const stdDevi=mathjs.sqrt(variance)
                //console.log(`Median: ${median}`)

                const statsColumnData={
                    columnHeader:columnTitles[columnIndex], columnCode, min, max, mean, median, stdDevi, uniqueValuesRatios:[]
                }

                 // değerlerin yüzdesi
               const uniqueValues= transpozedData[columnIndex].filter(onlyUnique)
               uniqueValues.forEach(value => {
                   const valueCount=transpozedData[columnIndex].filter(f=>f===value).length
                   const valuePresenceRatio=(valueCount*1.0/transpozedData[columnIndex].length)*100
                   statsColumnData.uniqueValuesRatios.push({ value, valuePresenceRatio })
               });
               
               statsData.push(statsColumnData)

                // error summary bulunuyor 
                let filteredErrorData=errorData.filter(e=>parseInt(e.colNum)===columnIndex)
                let errorRateForColumn=(filteredErrorData.length*1.0/(transpozedData[columnIndex].length+1)) // transpozeda sütun başlıklarını sayıya dahil etmediğinden +1 ekliyoruz

                errorSummary.push({
                    columnHeader:columnTitles[columnIndex],
                    errorRateForColumn: errorRateForColumn*100,
                    filteredErrorData,
                    columnCode,
                    showDetailed: errorRateForColumn>0.2
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

            res.render('uploadform', { errorSummary, statsData });
        }
    });

});

app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000 ...');
});