import React, { useState } from 'react';
import { executeQuery } from '../services/api';

const AdminDashboard = () => {
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [currentTitle, setCurrentTitle] = useState('');

    // IDs 1 to 10
    const queryList = [
        "1. Donors with Last & Next Eligible Date",
        "2. Most frequently requested blood group",
        "3. Donors who have not donated recently",
        "4. Total units per blood group",
        "5. Blood units expiring within 30 days",
        "6. Donation camps & units collected",
        "7. Pending requests",
        "8. All Donors list",
        "9. Available blood units with hospital details",
        "10. Average units per blood group"
    ];

    // IDs 11 to 20
    const tableList = [
        "Blood_Bank", 
        "Blood_Bank_Contact", 
        "Hospital", 
        "UserTable", 
        "Donor", 
        "Staff", 
        "Request", 
        "Blood_Unit", 
        "Donation_Camp", 
        "Collected_At"
    ];

    const runQuery = async (queryId, title) => {
        try {
            setError('');
            setCurrentTitle(title);
            const response = await executeQuery(queryId);
            setResults(response.data.data);
        } catch (err) {
            setError('Error: ' + (err.response?.data?.error || err.message));
            setResults([]);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Admin Dashboard</h2>
            
            {/* --- Table Views Section --- */}
            <h3>View Raw Database Tables</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                {tableList.map((q, index) => (
                    // Index starts at 0, so 0 + 11 = Query ID 11
                    <button 
                        key={q} 
                        onClick={() => runQuery(index + 11, q)} 
                        style={{ padding: '8px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {q}
                    </button>
                ))}
            </div>

            <hr style={{ marginBottom: '20px' }}/>

            {/* --- Custom Queries Section --- */}
            <h3>Execute Analytical Queries</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {queryList.map((q, index) => (
                    // Index starts at 0, so 0 + 1 = Query ID 1
                    <button 
                        key={index} 
                        onClick={() => runQuery(index + 1, q)} 
                        style={{ padding: '8px 12px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* --- Results Section --- */}
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

            {currentTitle && <h4 style={{ marginTop: '30px', color: '#333' }}>Viewing: {currentTitle}</h4>}

            {results.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead style={{ backgroundColor: '#f4f4f4' }}>
                            <tr>
                                {Object.keys(results[0]).map((key) => (
                                    <th key={key} style={{ textAlign: 'left' }}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((row, i) => (
                                <tr key={i}>
                                    {Object.values(row).map((val, j) => {
                                        // Handle Date formatting cleanly so it doesn't look like a giant timestamp string
                                        let displayVal = val;
                                        if (val !== null) {
                                            displayVal = typeof val === 'object' && val instanceof Date 
                                                ? val.toISOString().split('T')[0] 
                                                : val.toString();
                                        }
                                        return <td key={j}>{displayVal !== null ? displayVal : 'NULL'}</td>;
                                    })}
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