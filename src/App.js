import React from "react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import Parent from "./parent component/parentcomp";
import EmployeeTable from "./childcomp/childcomp"; 

function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<Parent />} />
        <Route path="/child" element={<EmployeeTable />} />
      </Routes>
    </Router>
  );
}

export default App;