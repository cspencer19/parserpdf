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
       pageArr.push({'x' : item.x, 'y' : item.y, 'val': item.text});
        pages[pages.length - 1][item.y] = pageArr;
      }
    });
  });

}

async function mapToCSV(parsedData){
 let jsonData = [];

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
var fpath = path.join(__dirname, './NestingUploadTemplate.xlsx');

await workbook.xlsx.readFile(fpath).then(function() {
      console.log('got here');
        var worksheet = workbook.getWorksheet(1);
        var row = worksheet.getRow(1);
        row.getCell(1).value = 'Job # '+JobNumber;
        row.getCell(2).value = 'Company '+Company;
       // worksheet.commit();

        var rowName = 'row';
        var nameType = ''; 
        var type = '';
        var count = 0;
       OrderRows.forEach((element, index, array) => {
        let rowVar = worksheet.getRow(index+2);
        nameType = element[0].name; // 100, 200, 300
        console.log(nameType)
       


      if (nameType == 'Type')
        type = element[0].val;
  
        let combinedName = ''
      if(element[1].name == 'Size'){
        
        combinedName = type + ' ' +element[1].val
        rowVar.getCell(1).value = combinedName;


      }
      if(nameType == 'Quan'){
        let rows =[];
        for(let i = 0; i < element.length; i++){
          if(element[i].name === 'Quan'){
            rows[7] = element[i].val
          }

          if(element[i].name === 'Item'){
            rows[2] = element[i].val
          }
          if(element[i].name === 'Mark'){
            rows[3] = element[i].val
          }

          if(element[i].name === 'Length'){
             let x = element[i].val;
             let inch = '';
             
             //x = x.replace(/\\`/g,"");
             console.log(x);
             let feet = x.split("' ");
             console.log(feet[0]);
             console.log(feet[1]);
             if(feet[1]){
             inch = feet[1].split('-');
             if(inch[1]){
            inch[1] = inch[1].replace(/"/g, '');
       
              }
             } 

             rows[9] = feet[0];
             rows[10] = inch[0];
             rows[11] = inch[1];


          }
            worksheet.insertRow(index, rows)
        }
         
        }
     

      
      

        //rowVar.commit();
      })

     /*   for(let i = 1; i < OrderRows.length; i++){
          console.log(OrderRows[0])
            let rowName = OrderRows[i][0].name;
            if(rowName == 'Type'){
              console.log(OrderRows[i+1][0].val)
              var rowValues = [];
              //rowValues[1] = OrderRows[i][0].val;
              //worksheet.insertRow(i, {})
            }
          console.log(OrderRows[i][0].name);
          //row.getCell()
*/


    //    }

        return workbook.xlsx.writeFile('new2.xlsx');
        }).catch(error => {
          console.error('Algo salio mal', error);
          });

console.log('here');


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
  let type = '';
  let size = '';
  let inx = {};
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
 //console.log(data);
// console.log(index);

 if(data[0].name == 'TotalLength' || Object.values(data)[0].name == 'Length' || (data[0].name == 'Mark' && data[0].val == 'Mark')){


 } else{
  retJson.push(data);
 }


 })

return retJson;

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
   // console.log(page);
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


module.exports = async function parse (buf, reader) {

  const data = await readPDFPages(buf, reader);
  //console.log({'beforeParse': data});
  const parsedData = await parsePDFData(data); 
  
  const mapTo = await mapToCSV(parsedData);
  //return data;
  return mapTo;

};
