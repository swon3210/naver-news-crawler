const { Parser } = require('json2csv');

const converter = {
  convert: (json, file_fields=[]) => {
    const fields = file_fields;
    const opts = { fields };
    
    try {
      const parser = new Parser(opts);
      console.log(json)
      const csv = parser.parse(json, opts);
      console.log(csv);
      return csv;
    } catch (err) {
      console.error(err);
    }
  
  },
  convertAll: (json_list, file_fields) => {
    const csv_list = [];

    for (let json of json_list) {

      const fields = file_fields;
      const opts = { fields };
      
      try {
        const parser = new Parser(opts);
        const csv = parser.parse(json, opts);
        console.log(csv);
        csv_list.push(csv);
      } catch (err) {
        console.error(err);
      }
    }

    return csv_list;
  },
  covertFile: (file_path, file_fields=[]) => {
    const fields = file_fields;
    const opts = { fields };
    
    try {
      const parser = new Parser(opts);
      console.log(file_path)
      const csv = parser.parse(file_path, opts);
      console.log(csv);
      return csv;
    } catch (err) {
      console.error(err);
    }
  
  },
  covertAllFile: (file_path_list, file_fields) => {
    const csv_list = [];

    for (let file_path of file_path_list) {

      const fields = file_fields;
      const opts = { fields };
      
      try {
        const parser = new Parser(opts);
        const csv = parser.parse(file_path, opts);
        console.log(csv);
        csv_list.push(csv);
      } catch (err) {
        console.error(err);
      }
    }

    return csv_list;
  },
}

module.exports = converter;
