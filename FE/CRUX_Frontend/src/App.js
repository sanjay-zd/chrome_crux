import React, { useEffect, useState } from "react";
import { BiSolidTrashAlt } from 'react-icons/bi';
import "./DataTable.css";

const App = () => {
  const [url, setUrl] = useState("");
  const [enteredUrls, setEnteredUrls] = useState("");
  const [resultUrls, setResultUrls] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [filter, setFilter] = useState("");
  const [searchData, setSearchData] = useState("");
  const [filterOptions, setFilterOptions] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAddUrl = () => {
    if(!resultUrls.includes(url)){
      setResultUrls([...resultUrls, url]);
      setEnteredUrls((prevUrls) => (prevUrls ? `${prevUrls}, ${url}` : url));
      setTableData([]);
      setOriginalData([]);
      setSearchResults([])
    }
    setUrl(""); // Clear the input field after adding the URL
  };
  const handleSearch = () => {
    const dummyUrl = `http://127.0.0.1:8000/api/chrome-ux-report/?url=${enteredUrls}`;
    setSearchResults(resultUrls)
    setResultUrls([])
    fetch(dummyUrl)
      .then((response) => response.json())
      .then((newData) => {
        let data = [];
        for (let i = 0; i < newData.length; i++) {
          const options = Object.keys(newData[i].record.metrics);
          setFilterOptions(options);
          for (const metricName in newData[i].record.metrics) {
            if (newData[i].record.metrics.hasOwnProperty(metricName)) {
              const metric = newData[i].record.metrics[metricName];
              const histogramRanges =
                metric.histogram.histogram_ranges.join(", ");
              const densities = metric.histogram.densities.join(", ");
              const averageDensity = metric.histogram.average_density;
              const sumValues = metric.histogram.sum_values;
              const percentiles = metric.percentiles.p75;
              const originUrl = newData[i].record.key.origin
              data.push({
                metricName,
                histogramRanges,
                densities,
                percentiles,
                averageDensity,
                sumValues,
                url:originUrl,
              });
            }
          }
        }
        setTableData([...tableData, ...data]);
        setOriginalData([...originalData, ...data]);
        setEnteredUrls('')
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  const handleSort = (columnName) => {
    let sortedData = [...tableData];

    if (sortColumn === columnName) {
      sortedData.reverse();
    } else {
      sortedData.sort((a, b) => (a[columnName] > b[columnName] ? 1 : -1));
    }

    setTableData(sortedData);
    setSortColumn(columnName);
  };

  const handleFilter = (value) => {
    setFilter(value)
    const filteredData = originalData.filter((row) =>
    row.metricName?.includes(value)
  );
  setTableData(filteredData);
  };

  const handleSearchData = (value) => {
    setSearchData(value);
    const filteredData = originalData.filter((row) =>
      row.metricName?.includes(value)
    );
    setTableData(filteredData);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteAddedUlr = (e) =>{
    const delUrlArr = [...resultUrls]
    delUrlArr.splice(e, 1)
    setResultUrls(delUrlArr)
    setEnteredUrls(delUrlArr.join(','));
  }

  useEffect(() => {
    // Adjust displayed data based on current page and items per page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedData = originalData.slice(startIndex, endIndex);
    setTableData(displayedData);
  }, [currentPage, originalData]);

  return (
    <div>
      <div className="search-section">
        <h3>URL :</h3>
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAddUrl} className="search-button">
          Add URL
        </button>
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      <div className="entered-result-url">
      <h5>
        Entered URLs:<br/>
        {resultUrls.map((i, e) => {
          return (
            <span key={e}>
              <a href={i} target="_blank" rel="noreferrer">
                {i}
              </a>  
              <BiSolidTrashAlt size={18} onClick={()=>handleDeleteAddedUlr(e)}/>
              <br/>
            </span>
          );
        })}
      </h5>
      <h5>
      Searched Results for: <br/>
        {searchResults.map((i, e) => {
          return (
            <span key={e}>
              <a href={i} target="_blank" rel="noreferrer">
                {i}
              </a>
              <br/>
            </span>
          );
        })}
      </h5>
      </div>
      <div className="filter-section">
        <label>Entries: 10</label>&nbsp;&nbsp;
        <label>Filter by Metrics: </label>
        <select
          value={filter}
          onChange={(e) => handleFilter(e.target.value)}
          className="input-field"
        >
          <option value="">All Metrics</option>
          {filterOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search Data"
          value={searchData}
          onChange={(e) => handleSearchData(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="table-heading">
        <h2>CRUX Data</h2>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("metricName")}>
              Metrics{" "}
              {sortColumn === "metricName"
                ? sortColumn === "metricName"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => handleSort("histogramRanges")}>
              Histogram Ranges{" "}
              {sortColumn === "histogramRanges"
                ? sortColumn === "histogramRanges"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => handleSort("densities")}>
              Densities{" "}
              {sortColumn === "densities"
                ? sortColumn === "densities"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => handleSort("percentiles")}>
              Percentiles(p75){" "}
              {sortColumn === "percentiles"
                ? sortColumn === "percentiles"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => handleSort("average_density")}>
              Average Density{" "}
              {sortColumn === "averageDensity"
                ? sortColumn === "averageDensity"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => handleSort("sum_values")}>
              Sum Values{" "}
              {sortColumn === "sumValues"
                ? sortColumn === "sumValues"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => handleSort("sum_values")}>
              URL{" "}
              {sortColumn === "sumValues"
                ? sortColumn === "sumValues"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td>{row.metricName}</td>
              <td>{row.histogramRanges}</td>
              <td>{row.densities}</td>
              <td>{row.percentiles}</td>
              <td>{row.averageDensity}</td>
              <td>{row.sumValues}</td>
              <td>{row.url}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {tableData.length ? (
          <>
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              disabled={
                tableData.length < itemsPerPage || tableData.length === 0
              }
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </>
        ) : (
          <div className="no-records">
            <h5>No Records</h5>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
