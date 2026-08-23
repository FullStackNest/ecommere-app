import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { DB } from "../../firebase.config";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },

    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },

    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));

export default function Insights() {
    const [rows, setRows] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Your Firestore collection name
                const collectionRef = collection(DB, "students_table");

                const snapshot = await getDocs(collectionRef);

                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setRows(data);

                // Get all unique field names
                const fieldSet = new Set();

                data.forEach((row) => {
                    Object.keys(row).forEach((field) => {
                        if (field !== "id") {
                            fieldSet.add(field);
                        }
                    });
                });

                setHeaders([...fieldSet]);

            } catch (error) {
                console.error("Error fetching Firestore data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <p>Loading data...</p>;
    }

    if (rows.length === 0) {
        return <p>No data found.</p>;
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="firebase table">

                {/* HEADER */}
                <TableHead>
                    <TableRow>
                        {headers.map((header) => (
                            <StyledTableCell key={header}>
                                {header}
                            </StyledTableCell>
                        ))}
                    </TableRow>
                </TableHead>

                {/* DATA */}
                <TableBody>
                    {rows.map((row) => (
                        <StyledTableRow key={row.id}>

                            {headers.map((header) => (
                                <StyledTableCell key={header}>
                                    {formatValue(row[header])}
                                </StyledTableCell>
                            ))}

                        </StyledTableRow>
                    ))}
                </TableBody>

            </Table>
        </TableContainer>
    );
}


// Handle different Firebase values
function formatValue(value) {
    if (value === null || value === undefined) {
        return "";
    }

    if (value?.toDate) {
        return value.toDate().toLocaleString();
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
}