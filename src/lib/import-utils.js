import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * Parses a CSV file and returns an array of objects.
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

/**
 * Parses an Excel file and returns an array of objects.
 */
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validates candidate data structure.
 */
export function validateCandidateData(data) {
  const requiredFields = ["firstName", "lastName", "candidateNumber", "level"];
  return data.every(item => requiredFields.every(field => !!item[field]));
}
