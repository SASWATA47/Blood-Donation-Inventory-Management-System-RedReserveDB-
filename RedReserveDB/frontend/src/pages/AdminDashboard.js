import React, { useState } from 'react';
// Make sure deleteRecord is imported!
import { executeQuery, insertRecord, updateRecord, deleteRecord } from '../services/api';

// Hardcoding schemas so forms generate even if tables are empty
const tableSchemas = {
    "Blood_Bank": ["Bank_id", "Name", "Location"],
    "Blood_Bank_Contact": ["Bank_id", "Contact"],
    "Hospital": ["Hospital_id", "Name", "Address", "Contact_Number"],
    "UserTable": ["User_id", "First_Name", "Last_Name", "Email", "Phone_Number", "Gender"],
    "Donor": ["Donor_id", "DOB", "Blood_Group", "Last_Donation_Date"],
    "Staff": ["Staff_id", "Certification", "Job_Title"],
    "Request": ["Request_id", "Blood_Group", "Quantity", "Request_Date", "Status", "Bank_id", "Hospital_id", "Patient_id"],
    "Blood_Unit": ["Unit_Number", "Blood_Group", "Expiry_Date", "Status", "Hospital_id"],
    "Donation_Camp": ["Camp_id", "Location", "Date_of_Camp", "Organizer"],
    "Collected_At": ["Unit_Number", "Camp_id"]
};

// Required to safely identify rows for updating/deleting (handles composite keys)
const primaryKeys = {
    "Blood_Bank": ["Bank_id"],
    "Blood_Bank_Contact": ["Bank_id", "Contact"],
    "Hospital": ["Hospital_id"],
    "UserTable": ["User_id"],
    "Donor": ["Donor_id"],
    "Staff": ["Staff_id"],
    "Request": ["Request_id"],
    "Blood_Unit": ["Unit_Number"],
    "Donation_Camp": ["Camp_id"],
    "Collected_At": ["Unit_Number", "Camp_id"]
};

const AdminDashboard = () => {
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [currentTitle, setCurrentTitle] = useState('');
    
    // State for Data Manipulation
    const [activeTable, setActiveTable] = useState(null); 
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editPkData, setEditPkData] = useState({});

    const queryList = [
        "1. Donors with Last & Next Eligible Date", "2. Most frequently requested blood group",
        "3. Donors who have not donated recently", "4. Total units per blood group",
        "5. Blood units expiring within 30 days", "6. Donation camps & units collected",
        "7. Pending requests", "8. All Donors list",
        "9. Available blood units with hospital details", "10. Average units per blood group"
    ];

    const tableList = Object.keys(tableSchemas);

    const runQuery = async (queryId, title, tableName = null) => {
        try {
            setError('');
            setCurrentTitle(title);
            setActiveTable(tableName);
            setFormData({});
            setIsEditing(false);

            const response = await executeQuery(queryId);
            setResults(response.data.data);
        } catch (err) {
            setError('Error: ' + (err.response?.data?.error || err.message));
            setResults([]);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (row) => {
        setIsEditing(true);
        const formattedRow = { ...row };
        for (let key in formattedRow) {
            if (formattedRow[key] && typeof formattedRow[key] === 'string' && formattedRow[key].includes('T00:00:00.000Z')) {
                formattedRow[key] = formattedRow[key].split('T')[0];
            }
        }
        setFormData(formattedRow);

        const pkData = {};
        primaryKeys[activeTable].forEach(pk => {
            pkData[pk] = row[pk];
        });
        setEditPkData(pkData);
    };

    // --- NEW DELETE FUNCTION ---
    const handleDeleteClick = async (row) => {
        // Confirmation dialog to prevent accidental clicks
        if (!window.confirm(`Are you sure you want to delete this record from ${activeTable}? This action cannot be undone.`)) {
            return;
        }

        // Grab the primary key(s) of the row to delete
        const pkData = {};
        primaryKeys[activeTable].forEach(pk => {
            pkData[pk] = row[pk];
        });

        try {
            await deleteRecord(activeTable, pkData);
            alert('Record Deleted Successfully!');
            
            // Refresh table data
            const tableIndex = tableList.indexOf(activeTable);
            runQuery(tableIndex + 11, `Table: ${activeTable}`, activeTable);
        } catch (err) {
            alert('Failed to delete: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateRecord(activeTable, formData, editPkData);
                alert('Record Updated Successfully!');
            } else {
                await insertRecord(activeTable, formData);
                alert('Record Added Successfully!');
            }
            const tableIndex = tableList.indexOf(activeTable);
            runQuery(tableIndex + 11, `Table: ${activeTable}`, activeTable);
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Admin Dashboard</h2>

            <h3>View & Manage Raw Database Tables</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {tableList.map((tableName, index) => (
                    <button 
                        key={tableName} 
                        onClick={() => runQuery(index + 11, `Table: ${tableName}`, tableName)} 
                        style={{ padding: '8px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {tableName}
                    </button>
                ))}
            </div>

            <hr />

            <h3>Execute Analytical Queries</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {queryList.map((q, index) => (
                    <button 
                        key={index} 
                        onClick={() => runQuery(index + 1, q, null)} 
                        style={{ padding: '8px 12px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {q}
                    </button>
                ))}
            </div>

            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
            {currentTitle && <h4 style={{ marginTop: '30px' }}>Viewing: {currentTitle}</h4>}

            {/* --- INSERT / UPDATE FORM --- */}
            {activeTable && (
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                    <h4>{isEditing ? `Edit Record in ${activeTable}` : `Add New Record to ${activeTable}`}</h4>
                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                        {tableSchemas[activeTable].map(field => (
                            <input 
                                key={field} 
                                name={field} 
                                placeholder={field} 
                                value={formData[field] || ''} 
                                onChange={handleFormChange} 
                                required 
                                type={field.toLowerCase().includes('date') || field === 'DOB' ? 'date' : 'text'}
                                disabled={isEditing && primaryKeys[activeTable].includes(field)}
                                style={{ padding: '8px' }}
                            />
                        ))}
                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: isEditing ? '#ff9800' : '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
                            {isEditing ? 'Save Changes' : 'Insert Record'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={() => { setIsEditing(false); setFormData({}); }} style={{ padding: '8px 15px', cursor: 'pointer' }}>Cancel</button>
                        )}
                    </form>
                </div>
            )}

            {/* --- RESULTS TABLE --- */}
            {results.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead style={{ backgroundColor: '#f4f4f4' }}>
                            <tr>
                                {Object.keys(results[0]).map((key) => <th key={key}>{key}</th>)}
                                {activeTable && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((row, i) => (
                                <tr key={i}>
                                    {Object.values(row).map((val, j) => {
                                        let displayVal = val;
                                        if (val !== null) {
                                            displayVal = typeof val === 'object' && val instanceof Date 
                                                ? val.toISOString().split('T')[0] 
                                                : val.toString();
                                        }
                                        return <td key={j}>{displayVal !== null ? displayVal : 'NULL'}</td>;
                                    })}
                                    
                                    {/* Action Buttons Rendered Here */}
                                    {activeTable && (
                                        <td>
                                            <button onClick={() => handleEditClick(row)} style={{ padding: '5px 10px', cursor: 'pointer', marginRight: '5px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '3px' }}>Edit</button>
                                            
                                            {/* --- NEW DELETE BUTTON --- */}
                                            <button onClick={() => handleDeleteClick(row)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px' }}>Delete</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                    {currentTitle ? 'No records found.' : 'Select a table or query to view results.'}
                </p>
            )}
        </div>
    );
};

export default AdminDashboard;