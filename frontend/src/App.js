import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css"; // Ensure you have a styles.css file for UI enhancements

const App = () => {
  const [table, setTable] = useState("users");
  const [filterColumn, setFilterColumn] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [updateColumn, setUpdateColumn] = useState("");
  const [updateValue, setUpdateValue] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAttributes();
  }, [table]);

  const fetchAttributes = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/attributes", {
        params: { table },
      });
      setAttributes(response.data);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFetch = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/fetch", {
        params: { table, filter_column: filterColumn, filter_value: filterValue },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInsert = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/api/insert", { table, data: formData });
      alert("Data inserted successfully");
      handleFetch(); // Fetch updated data
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put("http://127.0.0.1:5000/api/update", {
        table,
        filter_column: filterColumn,
        filter_value: filterValue,
        update_column: updateColumn,
        update_value: updateValue,
      });
      alert("Data updated successfully");
      handleFetch(); // Refresh data after update
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Real Estate Management</h1>

      {/* Select Table */}
      <label>Select Table:</label>
      <select onChange={(e) => setTable(e.target.value)} className="dropdown">
        <option value="users">Users</option>
        <option value="agents">Agents</option>
        <option value="properties">Properties</option>
      </select>

      {/* Fetch Section */}
      <h2 className="subtitle">Fetch Data</h2>
      <label>Filter Column:</label>
      <select onChange={(e) => setFilterColumn(e.target.value)} className="dropdown">
        <option value="">Fetch All</option>
        {attributes.map((attr, index) => (
          <option key={index} value={attr}>{attr}</option>
        ))}
      </select>

      <input type="text" placeholder="Enter filter value" onChange={(e) => setFilterValue(e.target.value)} className="input-box" />
      <button onClick={handleFetch} className="button">FETCH DATA</button>

      {/* Insert Section */}
      <h2 className="subtitle">Insert Data</h2>
      {attributes.map((attr, index) => (
        <input key={index} type="text" name={attr} placeholder={attr} onChange={handleInputChange} className="input-box" />
      ))}
      <button onClick={handleInsert} className="button">INSERT DATA</button>

      {/* Update Section */}
      <h2 className="subtitle">Update Data</h2>
      <label>Column to Update:</label>
      <select onChange={(e) => setUpdateColumn(e.target.value)} className="dropdown">
        <option value="">Select Column</option>
        {attributes.map((attr, index) => (
          <option key={index} value={attr}>{attr}</option>
        ))}
      </select>

      <input type="text" placeholder="Enter new value" onChange={(e) => setUpdateValue(e.target.value)} className="input-box" />
      <button onClick={handleUpdate} className="button">UPDATE DATA</button>

      {/* Display Data */}
      {data.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, idx) => (
                  <td key={idx}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
