const pool = require('../config/db');

exports.executeQuery = async (req, res) => {
    const { queryId } = req.params;
    let sql = "";

    switch(queryId) {
        // --- EXISTING ANALYTICAL QUERIES (1-10) ---
        case '1': 
            sql = `SELECT d.Donor_id, u.First_Name, u.Last_Name, d.Last_Donation_Date, DATE_ADD(d.Last_Donation_Date, INTERVAL 56 DAY) AS Next_Eligible_Date FROM Donor d JOIN UserTable u ON d.Donor_id = u.User_id`;
            break;
        case '2': 
            sql = `SELECT Blood_Group, COUNT(*) AS Frequency FROM Request GROUP BY Blood_Group ORDER BY Frequency DESC LIMIT 1`;
            break;
        case '3': 
            sql = `SELECT Donor_id, Last_Donation_Date FROM Donor WHERE Last_Donation_Date < '2025-03-01'`;
            break;
        case '4': 
            sql = `SELECT Blood_Group, COUNT(Unit_Number) AS Total_Units FROM Blood_Unit GROUP BY Blood_Group`;
            break;
        case '5': 
            sql = `SELECT Unit_Number, Expiry_Date FROM Blood_Unit WHERE Expiry_Date < DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)`;
            break;
        case '6': 
            sql = `SELECT c.Camp_id, COUNT(ca.Unit_Number) AS Units_Collected FROM Donation_Camp c JOIN Collected_At ca ON c.Camp_id = ca.Camp_id GROUP BY c.Camp_id`;
            break;
        case '7': 
            sql = `SELECT * FROM Request WHERE Status = 'Pending'`;
            break;
        case '8': 
            sql = `SELECT Donor_id, Blood_Group, Last_Donation_Date FROM Donor`;
            break;
        case '9': 
            sql = `SELECT b.Unit_Number, b.Status, b.Blood_Group, h.Hospital_id, h.Name, h.Address, h.Contact_Number FROM Blood_Unit b JOIN Hospital h ON b.Hospital_id = h.Hospital_id WHERE b.Status = 'Available'`;
            break;
        case '10': 
            sql = `SELECT Blood_Group, COUNT(Unit_Number) AS Total_Units FROM Blood_Unit GROUP BY Blood_Group HAVING COUNT(Unit_Number) > (SELECT AVG(Unit_Count) FROM (SELECT COUNT(Unit_Number) AS Unit_Count FROM Blood_Unit GROUP BY Blood_Group) AS temp)`;
            break;

        // --- NEW RAW TABLE QUERIES (11-20) ---
        case '11': sql = `SELECT * FROM Blood_Bank`; break;
        case '12': sql = `SELECT * FROM Blood_Bank_Contact`; break;
        case '13': sql = `SELECT * FROM Hospital`; break;
        case '14': sql = `SELECT * FROM UserTable`; break;
        case '15': sql = `SELECT * FROM Donor`; break;
        case '16': sql = `SELECT * FROM Staff`; break;
        case '17': sql = `SELECT * FROM Request`; break;
        case '18': sql = `SELECT * FROM Blood_Unit`; break;
        case '19': sql = `SELECT * FROM Donation_Camp`; break;
        case '20': sql = `SELECT * FROM Collected_At`; break;

        default:
            return res.status(400).json({ error: "Invalid Query ID" });
    }

    try {
        const [results] = await pool.query(sql);
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};