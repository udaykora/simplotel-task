import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { saveAs } from "file-saver"; // For exporting data
import "./childcomp.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState({});
  const [departmentPerformers, setDepartmentPerformers] = useState({});
  const [departmentQuality, setDepartmentQuality] = useState({});
  const [departmentAverageScore, setDepartmentAverageScore] = useState({});
  const [overallAverageScore, setOverallAverageScore] = useState(0);
  const location = useLocation();
  const { state } = location;

  useEffect(() => {
    if (state && state.data) {
      const filteredData = state.data.filter((emp) => emp[0] !== null);
      setEmployees(filteredData);

      const counts = {};
      const performers = {};
      const qualityScores = {};
      const totalScores = {};
      const departmentScoresCount = {};
      let totalScoreSum = 0;
      let totalEmployees = 0;

      filteredData.forEach((emp) => {
        const dept = emp[9];
        const score = calculateScore(emp).overallScore;
        const quality = calculateScore(emp).quality;

        // Department counts
        counts[dept] = (counts[dept] || 0) + 1;

        // Department performers
        if (!performers[dept]) {
          performers[dept] = { highest: emp, lowest: emp, highestScore: score, lowestScore: score };
        } else {
          if (score > performers[dept].highestScore) {
            performers[dept].highest = emp;
            performers[dept].highestScore = score;
          }
          if (score < performers[dept].lowestScore) {
            performers[dept].lowest = emp;
            performers[dept].lowestScore = score;
          }
        }

        // Department quality
        if (!qualityScores[dept]) {
          qualityScores[dept] = { totalQuality: quality, count: 1 };
        } else {
          qualityScores[dept].totalQuality += quality;
          qualityScores[dept].count += 1;
        }

        // Department average scores
        if (!totalScores[dept]) {
          totalScores[dept] = score;
          departmentScoresCount[dept] = 1;
        } else {
          totalScores[dept] += score;
          departmentScoresCount[dept] += 1;
        }

        totalScoreSum += score;
        totalEmployees += 1;
      });

      setDepartmentCounts(counts);
      setDepartmentPerformers(performers);

      const qualityPercentages = {};
      Object.entries(qualityScores).forEach(([dept, data]) => {
        qualityPercentages[dept] = (data.totalQuality / data.count).toFixed(2);
      });
      setDepartmentQuality(qualityPercentages);

      const averageScores = {};
      Object.keys(totalScores).forEach((dept) => {
        averageScores[dept] = (totalScores[dept] / departmentScoresCount[dept]).toFixed(2);
      });
      setDepartmentAverageScore(averageScores);
      setOverallAverageScore((totalScoreSum / totalEmployees).toFixed(2));
    }
  }, [state]);

  const calculateScore = (emp) => {
    const productivityScore = (emp[4] / emp[3]) * 100 || 0;
    const errorRate = (emp[5] / emp[4]) * 100 || 0;
    const qualityScore = 100 - errorRate;
    const timelinessScore = (emp[6] / emp[4]) * 100 || 0;

    const overallScore =
      0.33 * productivityScore + 0.33 * qualityScore + 0.33 * timelinessScore;

    return {
      ...emp,
      productivity: productivityScore,
      quality: qualityScore,
      timeliness: timelinessScore,
      overallScore: overallScore,
    };
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "score-high";
    if (score >= 50) return "score-medium";
    return "score-low";
  };

  // Reusable function to export table data as CSV
  const exportTableToCSV = (data, headers, filename) => {
    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, filename);
  };

  const renderTaskCompletionPieChart = () => {
    const completedTasks = employees.reduce((total, emp) => total + emp[4], 0);
    const totalTasks = employees.reduce((total, emp) => total + emp[3], 0);
    const pendingTasks = totalTasks - completedTasks;

    const pieChartData = {
      labels: ["Completed Tasks", "Pending Tasks"],
      datasets: [
        {
          data: [completedTasks, pendingTasks],
          backgroundColor: ["#28a745", "#dc3545"],
        },
      ],
    };

    return (
      <div className="pie-chart-container">
        <h2>Task Completion vs. Timeliness</h2>
        <Pie data={pieChartData} />
      </div>
    );
  };

  const renderDepartmentComparisonBarChart = () => {
    const departments = Object.keys(departmentCounts);
    const averageScores = departments.map((dept) => departmentAverageScore[dept] || 0);
    const qualityPercentages = departments.map((dept) => departmentQuality[dept] || 0);
    const headcounts = departments.map((dept) => departmentCounts[dept] || 0);

    const barChartData = {
      labels: departments,
      datasets: [
        {
          label: "Average Total Score (%)",
          data: averageScores,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Average Quality (%)",
          data: qualityPercentages,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
        },
        {
          label: "Total Headcount",
          data: headcounts,
          backgroundColor: "rgba(255, 159, 64, 0.6)",
        },
      ],
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    return (
      <div className="bar-chart-container">
        <h2>Department Comparison</h2>
        <Bar data={barChartData} options={options} />
      </div>
    );
  };

  return (
    <div className="container-wrapper">
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
      <div className="performance-dashboard">
        <h2>Employee Performance Dashboard</h2>
        <button
          onClick={() =>
            exportTableToCSV(
              employees.map((emp) => {
                const scoredEmp = calculateScore(emp);
                return [
                  emp[0],
                  emp[1],
                  emp[2],
                  emp[9],
                  emp[3],
                  emp[4],
                  emp[5],
                  emp[6],
                  scoredEmp.productivity.toFixed(2),
                  scoredEmp.quality.toFixed(2),
                  scoredEmp.timeliness.toFixed(2),
                  scoredEmp.overallScore.toFixed(2),
                ];
              }),
              [
                "ID",
                "First Name",
                "Last Name",
                "Department",
                "Tasks Assigned",
                "Completed",
                "Errors",
                "On Time",
                "Productivity",
                "Quality",
                "Timeliness",
                "Overall Score",
              ],
              "employee_performance.csv"
            )
          }
          className="export-button"
        >
          Export Employee Data as CSV
        </button>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>First</th>
                <th>Last</th>
                <th>Department</th>
                <th>Tasks Assigned</th>
                <th>Completed</th>
                <th>Errors</th>
                <th>On Time</th>
                <th>Productivity</th>
                <th>Quality</th>
                <th>Timeliness</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, index) => {
                const scoredEmp = calculateScore(emp);
                return (
                  <tr key={index}>
                    <td>{emp[0]}</td>
                    <td>{emp[1]}</td>
                    <td>{emp[2]}</td>
                    <td>{emp[9]}</td>
                    <td>{emp[3]}</td>
                    <td>{emp[4]}</td>
                    <td>{emp[5]}</td>
                    <td>{emp[6]}</td>
                    <td>{scoredEmp.productivity.toFixed(2)}%</td>
                    <td>{scoredEmp.quality.toFixed(2)}%</td>
                    <td>{scoredEmp.timeliness.toFixed(2)}%</td>
                    <td className={`score ${getScoreClass(scoredEmp.overallScore)}`}>
                      {scoredEmp.overallScore.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="department-section">
        <div className="department-counts">
          <h2>Department Metrics</h2>
          <button
            onClick={() =>
              exportTableToCSV(
                Object.entries(departmentCounts).map(([dept, count]) => [
                  dept,
                  departmentAverageScore[dept] || 0,
                  count,
                  departmentQuality[dept] || 0,
                ]),
                ["Department", "Average Total Score (%)", "Total Headcount", "Average Quality (%)"],
                "department_metrics.csv"
              )
            }
            className="export-button"
          >
            Export Department Metrics as CSV
          </button>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Average Total Score (%)</th>
                <th>Total Headcount</th>
                <th>Average Quality (%)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(departmentCounts).map(([dept, count]) => (
                <tr key={dept}>
                  <td>{dept}</td>
                  <td>{departmentAverageScore[dept] || 0}%</td>
                  <td>{count}</td>
                  <td>{departmentQuality[dept] || 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="department-performance">
        <h2>Top & Bottom Performers</h2>
        <button
          onClick={() =>
            exportTableToCSV(
              Object.entries(departmentPerformers).map(([dept, performers]) => [
                dept,
                `${performers.highest[1]} ${performers.highest[2]}`,
                performers.highestScore.toFixed(2),
                `${performers.lowest[1]} ${performers.lowest[2]}`,
                performers.lowestScore.toFixed(2),
              ]),
              ["Department", "Best Performer", "Best Score (%)", "Worst Performer", "Worst Score (%)"],
              "top_bottom_performers.csv"
            )
          }
          className="export-button"
        >
          Export Top & Bottom Performers as CSV
        </button>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Best Performer</th>
              <th>Worst Performer</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(departmentPerformers).map(([dept, performers]) => (
              <tr key={dept}>
                <td>{dept}</td>
                <td>{performers.highest[1]} {performers.highest[2]} ({performers.highestScore.toFixed(2)}%)</td>
                <td>{performers.lowest[1]} {performers.lowest[2]} ({performers.lowestScore.toFixed(2)}%)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderTaskCompletionPieChart()}
      {renderDepartmentComparisonBarChart()}
    </div>
  );
}

export default EmployeeTable;