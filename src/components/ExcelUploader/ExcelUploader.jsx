import { useState } from "react";
import Button from '@mui/material/Button';
import ExcelJS from "exceljs";
import { collection, doc, writeBatch, getDocs } from "firebase/firestore";
import { DB } from "../../firebase.config";
// import { getCellValue } from "../../utils/getCellValue";

function ExcelUploader() {
  const [fileName, setFileName] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      setFileName(file.name);

      // Read Excel file
      const buffer = await file.arrayBuffer();

      // Create workbook
      const workbook = new ExcelJS.Workbook();

      // Load workbook
      await workbook.xlsx.load(buffer);

      // For now, use only the first sheet
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        alert("No worksheet found");
        return;
      }

      setSheetName(worksheet.name);

      const data = [];

      worksheet.eachRow((row) => {
        const rowData = [];

        row.eachCell({ includeEmpty: false }, (cell) => {
          rowData.push(cell.value);
        });

        data.push(rowData);
      });

      // First row = headers for now
      const headerRow = data[0] || [];

      // Remaining rows = records
      const dataRows = data.slice(1);

      setHeaders(headerRow);
      setRows(dataRows);

      console.log("Sheet:", worksheet.name);
      console.log("Headers:", headerRow);
      console.log("Rows:", dataRows);

    } catch (error) {
      console.error("Excel upload error:", error);
      alert("Unable to read Excel file");
    }
  };

  // UPLOAD TO FIRESTORE
  const uploadToFirestore = async () => {
    try {
      setUploading(true);

      // Sheet name → lowercase collection name
      const collectionName = sheetName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

      if (!collectionName) {
        alert("Invalid sheet name");
        return;
      }


      // Create Firestore collection reference
      const collectionRef = collection(DB, collectionName);

      // --------------------------------
      // 1. DELETE OLD DOCUMENTS
      // --------------------------------

      const oldSnapshot = await getDocs(collectionRef);

      const oldDocs = oldSnapshot.docs;

      for (let i = 0; i < oldDocs.length; i += 500) {
        const batch = writeBatch(DB);

        const currentDocs = oldDocs.slice(i, i + 500);

        currentDocs.forEach((oldDoc) => {
          batch.delete(oldDoc.ref);
        });

        await batch.commit();
      }

      // --------------------------------
      // 2. UPLOAD NEW DOCUMENTS
      // --------------------------------

      // Maximum 500 writes per batch
      const BATCH_SIZE = 500;

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = writeBatch(DB);

        const currentRows = rows.slice(i, i + BATCH_SIZE);

        currentRows.forEach((row) => {
          const documentRef = doc(collectionRef);

          const documentData = {};

          headers.forEach((header, index) => {
            const fieldName = String(header ?? "").trim();

            if (fieldName) {
              documentData[fieldName] = row[index] ?? "";
            }
          });

          batch.set(documentRef, documentData);
        });

        await batch.commit();
      }

      alert(
        `Uploaded ${rows.length} records to "${collectionName}" collection`
      );

    } catch (error) {
      console.error("Firestore upload error:", error);

      alert(error.message);

    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ margin: "30px" }}>
      <h2>Excel Upload</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
      />

      {fileName && (
        <div>
          <p>
            <strong>File:</strong> {fileName}
          </p>

          <p>
            <strong>Sheet:</strong> {sheetName}
          </p>
        </div>
      )}

      {headers.length > 0 && (
        <>
          <h3>Headers</h3>

          <div>
            {headers.map((header, index) => (
              <span key={index}>
                {String(header)}{" "}
              </span>
            ))}
          </div>
        </>
      )}

      {rows.length > 0 && (
        <>
          <h3>Data</h3>

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>
                    {String(header)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, columnIndex) => (
                    <td key={columnIndex}>
                      {String(row[columnIndex] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {rows.length > 0 && (
        <Button sx={{ marginTop: "30px" }} variant="outlined"
          onClick={uploadToFirestore}
          disabled={uploading}
        >
          {uploading
            ? "Uploading..."
            : "Upload to Firebase"}
        </Button>
      )}
    </div>
  );
}

export default ExcelUploader;