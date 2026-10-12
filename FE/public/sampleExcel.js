const XLSX = require('xlsx');

// Create sample data
const sampleData = [
  ['First Name', 'Last Name', 'Gender','Age','Contact','Email','Pincode','State','City','Address','Organization Name','GovernmentId Type','GovernmentId Number'],
  ['John', 'Doe', 'male','34','1234567890','john.doe@example.com','232323','AP','Kurnool','Kukatpally','CDAC','pancard','eeopjhjhj'],
//   ['Jane', 'Smith', 'jane.smith@example.com'],
  // Add more rows as needed
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Add a worksheet with the sample data
const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
XLSX.utils.book_append_sheet(workbook, worksheet, 'SampleSheet');

// Write the workbook to an XLSX file
XLSX.writeFile(workbook, 'sample.xls');

console.log('Sample Excel file generated successfully.');
