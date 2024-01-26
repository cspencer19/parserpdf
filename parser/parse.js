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
  //console.log(jsonData);
 const JobNumber =await obtainJobNumber(jsonData);
 const Company = await obtainCompanyName(jsonData);
 const TypeSize = await obtainTypeSize(jsonData);
 console.log(TypeSize);
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
      if(data[x].x == 4.37){
        retArr.push({'type': data[x].val, 'typeidx': index - 1})
      }
      
  
      if(data[x].x === 6.852){
        console.log('got in here');
        retArr.push({'size': data[x].val, 'sizeidx': index - 1})
      } 
      
    }
    
  })

return retArr;
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
