import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import "./style.css";
import Childcomp from "../childcomp/childcomp"; 
import { FaFileCsv, FaGithub } from 'react-icons/fa';

function Parent() {
  const [dataArray, setDataArray] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: false,
        dynamicTyping: true,
        complete: (results) => {
          setDataArray(results.data);
          navigate("/child", { state: { data: results.data } });
        },
        error: (err) => {
          setError(err.message);
          setDataArray(null);
        },
      });
    }
  };

  return (
    <div className="container">
      <h1 style={{ 
        textAlign: "center", 
        fontSize: "32px", 
        fontWeight: "bold", 
        color: "#333", 
        marginBottom: "20px", 
        fontFamily: "Arial, sans-serif" 
      }}>
        Dynamic Scorecard Tool for Performance Evaluation
      </h1>

      <p>
        Click the link  to download the CSV file:{" "}
        <a
          className="links"
          href="https://res.cloudinary.com/ds1ysygvb/raw/upload/v1739400030/employee_data_bdaeix.csv"
          download="employee_data.csv" // Ensures the file is downloaded with this name
        >
          <FaFileCsv /> Download CSV File
        </a>
      </p>

      <div className="input-section">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <FaFileCsv />
      </div>

      {error && <div className="error">Error: {error}</div>}

      {dataArray && (
        <div className="output">
          <h3>Parsed Data:</h3>
          <pre>{JSON.stringify(dataArray, null, 2)}</pre>
        </div>
      )}

      {/* {nextcomp && <Childcomp data={dataArray} />}  If using Childcomp */}
    </div>
  );
}

export default Parent;