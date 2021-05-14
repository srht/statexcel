
const mathjs = require('mathjs');
const {transpose, onlyUnique }=require('../helpers/array-manipulation')
const reader = require('xlsx')

class ExcelProcessor {
     process=(file)=>{
         // Reading our test file
         const readFile = reader.readFile(file.path)
         //const sheets = readFile.SheetNames
         //console.log(sheets[0])
        const sheetRows = reader.utils.sheet_to_json(readFile.Sheets[readFile.SheetNames[0]], { defval: "" })
        const normalizedData = []
        const rawData=[]
        const errorData=[]
        const statsData=[]
        const columnTitles=[]
        let rowNumber = 0
        sheetRows.forEach((row) => {
            let rowArr = []
            let rawRowArr=[]
            let colNum = 0
            for (let column in row) {
                if(columnTitles.indexOf(column)===-1) columnTitles.push(column)
                let cellValue = row[column].toString();
                let trimmedCellValue = cellValue.trim();

                let parsedNumberVal = Number(trimmedCellValue)
                if (!cellValue || isNaN(parsedNumberVal)||parsedNumberVal>100000) { // 100000'den büyükse tc kimlik no gibi sayıları da string olarak tanımlıyor
                    const cellCode = reader.utils.encode_cell({ c: colNum, r: rowNumber })
                    
                    errorData.push({ column, colNum, rowNumber, cellCode })
                    rowArr.push(0)
                    rawRowArr.push(trimmedCellValue)
                }
                else {
                    rowArr.push(parsedNumberVal)
                    rawRowArr.push(parsedNumberVal)
                }
                
                colNum++
            }
            
            rawData.push(rawRowArr)
            normalizedData.push(rowArr)
            rowNumber++
        })

        let transpozedData = transpose(normalizedData)
        let transpozedRawData=transpose(rawData)
        let errorSummary=[]
        for (let columnIndex = 0; columnIndex < transpozedData.length; columnIndex++) {
            const columnCode = reader.utils.encode_col(columnIndex)
            //console.log(`${cell[0]} sütunu:`)

            const min = mathjs.min(transpozedData[columnIndex])
            //console.log(`Min: ${min}`)
            const max = mathjs.max(transpozedData[columnIndex])
            //console.log(`Max: ${max}`)
            const mean = Number.parseFloat(mathjs.mean(transpozedData[columnIndex])).toPrecision(3)
            //console.log(`Mean: ${mean}`)
            const median = mathjs.median(transpozedData[columnIndex])

            const variance = mathjs.variance(transpozedData[columnIndex])
            const stdDevi=Number.parseFloat(mathjs.sqrt(variance)).toPrecision(3)
            //console.log(`Median: ${median}`)

            const statsColumnData={
                columnHeader:columnTitles[columnIndex], columnCode, min, max, mean, median, stdDevi, uniqueValuesRatios:[], errorSummary:null
            }

             // değerlerin yüzdesi
           const uniqueValues= transpozedRawData[columnIndex].filter(onlyUnique)
           uniqueValues.forEach(value => {
               const valueCount=transpozedRawData[columnIndex].filter(f=>f===value).length
               const valuePresenceRatio=Number.parseFloat((valueCount*1.0/transpozedRawData[columnIndex].length)*100).toPrecision(3)
               statsColumnData.uniqueValuesRatios.push({ value, valuePresenceRatio })
           });
           
           

            // error summary bulunuyor 
            let filteredErrorData=errorData.filter(e=>parseInt(e.colNum)===columnIndex)
            let errorRateForColumn=(filteredErrorData.length*1.0/(transpozedData[columnIndex].length+1)) // transpozeda sütun başlıklarını sayıya dahil etmediğinden +1 ekliyoruz
        statsColumnData.errorSummary={
            columnHeader:columnTitles[columnIndex],
            errorRateForColumn: Number.parseFloat(errorRateForColumn).toPrecision(3)*100,
            errorRateIfFull:errorRateForColumn===1,
            filteredErrorData,
            columnCode,
            showDetailed: 0.001<errorRateForColumn && errorRateForColumn<0.9 
        };
        statsData.push(statsColumnData)
            //errorSummary.push()
     }

     return { errorSummary, statsData  };
}

}

module.exports=new ExcelProcessor()