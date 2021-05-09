
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
        const data = []
        const errorData=[]
        const statsData=[]
        const columnTitles=[]
        let rowNumber = 0
        sheetRows.forEach((row) => {
            let rowArr = []
            let colNum = 0
            for (let column in row) {
                if(columnTitles.indexOf(column)===-1) columnTitles.push(column)
                let cellValue = row[column].toString();
                
                let trimmedCellValue = cellValue.trim()
                let parsedNumberVal = Number(trimmedCellValue)
                if (!cellValue || isNaN(parsedNumberVal)) {
                    const cellCode = reader.utils.encode_cell({ c: colNum, r: rowNumber })
                    
                    errorData.push({ column, colNum, rowNumber, cellCode })
                    rowArr.push(0)
                }
                else {
                    rowArr.push(parsedNumberVal)
                }
                
                colNum++
            }
            
            data.push(rowArr)
            rowNumber++
        })

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

     return { errorSummary, statsData  };
}

}

module.exports=new ExcelProcessor()