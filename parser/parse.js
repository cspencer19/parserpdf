'use strict';

const { PdfReader } = require('pdfreader');

function readPDFPages (buffer, reader=(new PdfReader())) {
  let pageArr = [];
  return new Promise((resolve, reject) => {
    let pages = [];

    reader.parseBuffer(buffer, (err, item) => {
      if (err)
        reject(err)

      else if (!item)
        resolve(pages);

      else if (item.page)
        pages.push({}); 

      else if (item.text) {
      //  console.log(item.text);
       pageArr.push({'x' : item.x, 'y' : item.y, 'val': item.text});
        pages[pages.length - 1][item.y] = pageArr;
       // console.log(pageArr);
      }
    });
  
  });

}

async function mapToCSV(parsedData){
 let jsonData = [];
 const jmath = require('mathjs');

//console.log(parsedData);
  for (let value of Object.values(parsedData)) {
    jsonData.push(value);

  }
 // console.log(jsonData)
 const JobNumber =await obtainJobNumber(jsonData);
 const Company = await obtainCompanyName(jsonData);
 const TypeSize = await obtainTypeSize(jsonData);
 const OrderRows = await returncleanedRows(jsonData);

    OrderRows.forEach(function(data, index){

      //console.log(data, index)
    

    })

    var fs = require('fs');
  var Excel = require('exceljs');
const workbook = new Excel.Workbook();



var path = require('path');
var fpath = path.join(__dirname, './NestingUploadTemplateTrial.xlsx');
console.log(fpath);
await workbook.xlsx.readFile(fpath).then(function() {
        var worksheet = workbook.getWorksheet(1);
        var row = worksheet.getRow(1);
        row.getCell(1).value = 'Job # '+JobNumber;
        row.getCell(2).value = 'Company '+Company;
       // worksheet.commit();

        var rowName = 'row';
        var nameType = ''; 
        var nameVal = '';
        var type = '';
        var count = 0;
        var sumTotal = 0;
       OrderRows.forEach((element, index, array) => {
        let rowIndex = index+1;

        nameType = element[0].name; // 100, 200, 300
        nameVal = element[0].val;

      if (nameType == 'Type'){
        let rows = [];
        type = element[0].val;
  
        let combinedName = ''
      if(element[1].name == 'Size'){
        
        combinedName = type + ' ' +element[1].val
        rows[1] = combinedName
       worksheet.insertRow(rowIndex, rows);

      }
    }
     else if(nameType == 'Quan'){
        let rows =[];
          if(element[0].name === 'Quan'){
            rows[7] = element[0].val
          }

          if(element[1].name === 'Item'){
            rows[2] = element[1].val
          }
          if(element[2].name === 'Mark'){
            rows[3] = element[2].val
          }

          if(element[3].name === 'Length'){
             let x = element[3].val;
             let inch = '';
             
             x = x.replace(/\\`/g,"");
             let feet = x.split("'");
             if(feet[1]){
             inch = feet[1].split('-');
             }
             
             inch[0] = inch[0].replace(/"/g, '');
             if(inch[1]){
            inch[1] = inch[1].replace(/"/g, '');
       
            }
             

             rows[9] = feet[0];
             rows[10] = inch[0];
             rows[11] = inch[1];
              let i = 0;
              let j = 0;
              let h = 0;
              if(feet[0]){
                j = feet[0];
              }
              h = inch[0];
               h = h/12;
              
             if(inch[1]){
               i = eval(inch[1]);
               i = eval(i/12);
             }

             let sum = jmath.sum(j,h,i);
             let rounded_sum = round(sum, 3)
             sumTotal += rounded_sum;

             rows[12] = {formula: 'ROUND(SUM(J'+rowIndex+'/12,K'+rowIndex+'/12, I'+rowIndex+'),3)', result: rounded_sum};
             rows[6] = {formula: '=L'+rowIndex, result: rounded_sum};
             rows[14] = {formula: 'SUM(L'+rowIndex+' * G'+rowIndex+')', result : element[0].val * rounded_sum }

        }
        worksheet.insertRow(rowIndex, rows)
        }
     
      })

            sumTotal = round(sumTotal, 3);
            worksheet.getCell('P2').value = sumTotal;
        return workbook.xlsx.writeFile('new2.xlsx');
        }).catch(error => {
          console.error('Algo salio mal', error);
          });



}

async function obtainJobNumber(jsonData){
  let jobNum = '';
  jsonData.forEach(function(data){

    if(data[0].x == 5.593){
      jobNum = data[0].val;
    }

  })

return jobNum;
}

async function obtainCompanyName(jsonData){
  let companyName = '';
  jsonData.forEach(function(data){

    if(data[0].x == 10.28){
      companyName = data[0].val;
    }
  })

return companyName;
}

async function obtainTypeSize(jsonData){
  let retArr = [];

  jsonData.forEach(function(data, index){

    for(let x in data){
      var type;
      if(data[x].x == 4.37){
        type = data[x].val;
      }
      
      if(data[x].x === 6.852){
        retArr.push({'type': type, 'size': data[x].val, 'sizeidx': index - 1})
      }

    }
  })

return retArr;
}

async function returncleanedRows(jsonData){

 let retJson = [];
  jsonData.forEach(function(data,index){

  if(data[0].name == 'TotalLength' || Object.values(data)[0].name == 'Length' || (data[0].name == 'Mark' && data[0].val == 'Mark')){
  } else { 
    retJson.push(data);
  }

 })

return retJson;

}

function round (number, decimal_places){
    const h = +('1'.padEnd(decimal_places + 1, '0')) // 10 or 100 or 1000 or etc
    return Math.round(number * h) / h
  }


async function parsePDFData (pages) {
let pageArr = [];
  pages.forEach(function callback(value, index) {
    
    Object.keys(value).forEach(key => {
      pageArr.push(value[key]);
    }); 

  });


  // Declarative map of PDF data that we expect, based on Todd's structure
  const fields = {
    Job :{row:'5.593', name:'Job', index: 0},
    Type: {row:'4.37', name:'Type', index: 0},       
    Size: {row:'6.852', name:'Size', index: 0},                             
    Item: { row:'9.132', name:'Item', index: 0},
    mLength: { row: '17.563', name:'Length', index: 0 },
    Length: { row: '17.39', name:'Length', index: 0 },
    TotalLength: { row: '17.218', name:'TotalLength', index: 0 },
    Mark: { row: '11.263', name:'Mark', index: 0},
    Quan: { row: '16.258', name:'Quan',index: 0 },
  };

  const allArr = [];

  // Assign the page data to an object we can return, as per
  // our field specification
  pageArr[0].forEach(function(page){ 
    Object.keys(fields)
      .forEach((key) => {
        const field = fields[key];
        var val = '';
       // console.log('page '+page.x);
      //  console.log('fieldrow '+field.row);
      
          
      if(Number(page.x) == Number(field.row)){
          val = {'name': field.name, 'val': page.val, 'x': page.x, 'y': page.y}
          allArr.push(val);
        } 
      })
    });


    var groupBy = function(xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };

   const groupedByRow = groupBy(allArr, 'y');

   return groupedByRow;

}

async function identifyPage(data){
  let pageCall = '';
  let pageArr = [];
  let finalArr = [];
  data.forEach(function callback(value, index) {
    
    Object.keys(value).forEach(key => {
      pageArr.push(value[key]);
    }); 
  });


  pageArr[0].forEach(function(page){ 
   // console.log(page.x);
    finalArr.push({'x': page.x, 'y': page.y, 'val': page.val});
  
})

    finalArr.forEach(function(arr){
      console.log(arr.val);
      if(arr.val.includes('FabTrol')){
        pageCall = 'FabTrol';
      }
      if(arr.val.includes('Area(in.2)')){
        console.log('got in hereererer');
        pageCall = 'EGBD';
      }

})
 
}
module.exports = async function parse (buf, reader) {

  const data = await readPDFPages(buf, reader);
  
  const identify = await identifyPage(data);

  const parsedData = await parsePDFData(data); 
  
  const mapTo = await mapToCSV(parsedData);
  //return data;
  return mapTo;

};
