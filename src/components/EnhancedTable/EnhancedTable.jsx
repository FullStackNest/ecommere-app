import * as React from 'react';
import PropTypes from 'prop-types';

import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';

import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';

import { visuallyHidden } from '@mui/utils';

import {
    collection,
    getDocs,
    query,
    orderBy as firestoreOrderBy,
} from 'firebase/firestore';
import { DB } from '../../firebase.config';




// -----------------------------------------------------
// Helper functions
// -----------------------------------------------------

function descendingComparator(a, b, orderBy) {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (bValue === undefined || bValue === null) return -1;
    if (aValue === undefined || aValue === null) return 1;

    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;

    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}


// -----------------------------------------------------
// Format Firebase values for displaying in table
// -----------------------------------------------------

function formatValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    // Firestore Timestamp
    if (value?.toDate instanceof Function) {
        return value.toDate().toLocaleString('en-IN');
    }

    // Date
    if (value instanceof Date) {
        return value.toLocaleString('en-IN');
    }

    // Array
    if (Array.isArray(value)) {
        return value
            .map((item) => formatValue(item))
            .join(', ');
    }

    // Object
    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([key, val]) => `${key}: ${formatValue(val)}`)
            .join(', ');
    }

    return String(value);
}


// -----------------------------------------------------
// Dynamic Table Header
// -----------------------------------------------------

function ProductsTable(props) {
    const {
        headCells,
        onSelectAllClick,
        order,
        orderBy,
        numSelected,
        rowCount,
        onRequestSort,
    } = props;

    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>

                {/* Select all */}
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={
                            numSelected > 0 &&
                            numSelected < rowCount
                        }
                        checked={
                            rowCount > 0 &&
                            numSelected === rowCount
                        }
                        onChange={onSelectAllClick}
                        slotProps={{
                            input: {
                                'aria-label': 'select all rows',
                            },
                        }}
                    />
                </TableCell>

                {/* Dynamic headers */}
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={
                            orderBy === headCell.id
                                ? order
                                : false
                        }
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={
                                orderBy === headCell.id
                                    ? order
                                    : 'asc'
                            }
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}

                            {orderBy === headCell.id ? (
                                <Box
                                    component="span"
                                    sx={visuallyHidden}
                                >
                                    {order === 'desc'
                                        ? 'sorted descending'
                                        : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}


ProductsTable.propTypes = {
    headCells: PropTypes.array.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};


// -----------------------------------------------------
// Toolbar
// -----------------------------------------------------

function EnhancedTableToolbar(props) {
    const { numSelected } = props;

    return (
        <Toolbar
            sx={[
                {
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                },

                numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(
                            theme.palette.primary.main,
                            theme.palette.action
                                .activatedOpacity
                        ),
                },
            ]}
        >
            {numSelected > 0 ? (
                <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{
                        flex: '1 1 100%',
                    }}
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    variant="h6"
                    component="div"
                >
                    Products Data
                </Typography>
            )}

            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Filter list">
                    <IconButton>
                        <FilterListIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );
}


EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function EnhancedTable() {

    const [rows, setRows] = React.useState([]);

    const [headCells, setHeadCells] = React.useState([]);

    const [loading, setLoading] = React.useState(true);

    const [order, setOrder] = React.useState('desc');

    const [orderBy, setOrderBy] = React.useState('createdAt');

    const [selected, setSelected] = React.useState([]);

    const [page, setPage] = React.useState(0);

    const [dense, setDense] = React.useState(false);

    const [rowsPerPage, setRowsPerPage] =
        React.useState(5);


    // -------------------------------------------------
    // Firebase collection name
    // -------------------------------------------------

    const collectionName = 'products';
    // Change "products" to your Firestore collection name


    // -------------------------------------------------
    // FETCH FIREBASE DATA
    // -------------------------------------------------

    const fetchData = async () => {

        try {

            setLoading(true);

            setSelected([]);

            const collectionRef =
                collection(DB, collectionName);

            /*
             * IMPORTANT:
             *
             * This requires every document to have
             * a createdAt field.
             *
             * Example when adding:
             *
             * createdAt: serverTimestamp()
             */

            const q = query(
                collectionRef,
                firestoreOrderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);

            const firebaseRows = snapshot.docs.map(
                (doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })
            );

            setRows(firebaseRows);


            // -----------------------------------------
            // Dynamically find all fields
            // -----------------------------------------

            const fieldSet = new Set();

            firebaseRows.forEach((row) => {

                Object.keys(row).forEach((key) => {

                    // Don't show Firebase document ID
                    // as a normal column
                    if (key !== 'id') {
                        fieldSet.add(key);
                    }

                });

            });


            // -----------------------------------------
            // Create dynamic headers
            // -----------------------------------------

            const dynamicHeaders =
                Array.from(fieldSet).map((field) => {

                    return {
                        id: field,
                        numeric: false,
                        label: field
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) =>
                                str.toUpperCase()
                            ),
                    };

                });


            setHeadCells(dynamicHeaders);


            // -----------------------------------------
            // Default sorting column
            // -----------------------------------------

            if (
                dynamicHeaders.some(
                    (header) => header.id === 'createdAt'
                )
            ) {

                setOrderBy('createdAt');

            } else if (dynamicHeaders.length > 0) {

                setOrderBy(dynamicHeaders[0].id);

            }

        } catch (error) {

            console.error(
                'Error fetching Firebase data:',
                error
            );

        } finally {

            setLoading(false);

        }

    };


    // -------------------------------------------------
    // Fetch when component loads
    // -------------------------------------------------

    React.useEffect(() => {

        fetchData();

    }, []);


    // -------------------------------------------------
    // SORT
    // -------------------------------------------------

    const handleRequestSort = (event, property) => {

        const isAsc =
            orderBy === property &&
            order === 'asc';

        setOrder(isAsc ? 'desc' : 'asc');

        setOrderBy(property);

    };


    // -------------------------------------------------
    // SELECT ALL
    // -------------------------------------------------

    const handleSelectAllClick = (event) => {

        if (event.target.checked) {

            const newSelected =
                rows.map((row) => row.id);

            setSelected(newSelected);

            return;
        }

        setSelected([]);

    };


    // -------------------------------------------------
    // SELECT SINGLE ROW
    // -------------------------------------------------

    const handleClick = (event, id) => {

        const selectedIndex =
            selected.indexOf(id);

        let newSelected = [];

        if (selectedIndex === -1) {

            newSelected =
                newSelected.concat(
                    selected,
                    id
                );

        } else if (selectedIndex === 0) {

            newSelected =
                newSelected.concat(
                    selected.slice(1)
                );

        } else if (
            selectedIndex === selected.length - 1
        ) {

            newSelected =
                newSelected.concat(
                    selected.slice(0, -1)
                );

        } else if (selectedIndex > 0) {

            newSelected =
                newSelected.concat(
                    selected.slice(0, selectedIndex),
                    selected.slice(selectedIndex + 1)
                );

        }

        setSelected(newSelected);

    };


    // -------------------------------------------------
    // PAGINATION
    // -------------------------------------------------

    const handleChangePage = (
        event,
        newPage
    ) => {

        setPage(newPage);

    };


    const handleChangeRowsPerPage = (
        event
    ) => {

        setRowsPerPage(
            parseInt(
                event.target.value,
                10
            )
        );

        setPage(0);

    };


    // -------------------------------------------------
    // DENSE
    // -------------------------------------------------

    const handleChangeDense = (event) => {

        setDense(
            event.target.checked
        );

    };


    // -------------------------------------------------
    // SORT + PAGINATE
    // -------------------------------------------------

    const visibleRows =
        React.useMemo(() => {

            return [...rows]
                .sort(
                    getComparator(
                        order,
                        orderBy
                    )
                )
                .slice(
                    page * rowsPerPage,
                    page * rowsPerPage +
                    rowsPerPage
                );

        }, [
            rows,
            order,
            orderBy,
            page,
            rowsPerPage,
        ]);


    // -------------------------------------------------
    // EMPTY ROWS
    // -------------------------------------------------

    const emptyRows =
        page > 0
            ? Math.max(
                0,
                (1 + page) *
                rowsPerPage -
                rows.length
            )
            : 0;


    // =================================================
    // UI
    // =================================================

    return (
        <Box sx={{ width: '100%' }}>

            <Paper
                sx={{
                    width: '100%',
                    mb: 2,
                }}
            >

                <EnhancedTableToolbar
                    numSelected={selected.length}
                />

                <TableContainer>

                    <Table
                        sx={{
                            minWidth: 750,
                        }}
                        aria-labelledby="tableTitle"
                        size={
                            dense
                                ? 'small'
                                : 'medium'
                        }
                    >

                        {/* --------------------------------
                            HEADER
                        --------------------------------- */}

                        <ProductsTable
                            headCells={headCells}
                            numSelected={
                                selected.length
                            }
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={
                                handleSelectAllClick
                            }
                            onRequestSort={
                                handleRequestSort
                            }
                            rowCount={
                                rows.length
                            }
                        />


                        {/* --------------------------------
                            BODY
                        --------------------------------- */}

                        <TableBody>

                            {loading ? (

                                <TableRow>

                                    <TableCell
                                        colSpan={
                                            headCells.length + 1
                                        }
                                        align="center"
                                        sx={{
                                            py: 6,
                                        }}
                                    >

                                        <CircularProgress />

                                        <Typography
                                            sx={{
                                                mt: 2,
                                            }}
                                        >
                                            Loading data...
                                        </Typography>

                                    </TableCell>

                                </TableRow>

                            ) : visibleRows.length === 0 ? (

                                <TableRow>

                                    <TableCell
                                        colSpan={
                                            headCells.length + 1
                                        }
                                        align="center"
                                        sx={{
                                            py: 6,
                                        }}
                                    >
                                        No data found
                                    </TableCell>

                                </TableRow>

                            ) : (

                                visibleRows.map(
                                    (row, index) => {

                                        const isItemSelected =
                                            selected.includes(
                                                row.id
                                            );

                                        const labelId =
                                            `enhanced-table-checkbox-${index}`;

                                        return (

                                            <TableRow
                                                hover
                                                onClick={(
                                                    event
                                                ) =>
                                                    handleClick(
                                                        event,
                                                        row.id
                                                    )
                                                }
                                                role="checkbox"
                                                aria-checked={
                                                    isItemSelected
                                                }
                                                tabIndex={-1}
                                                key={row.id}
                                                selected={
                                                    isItemSelected
                                                }
                                                sx={{
                                                    cursor:
                                                        'pointer',
                                                }}
                                            >

                                                {/* Checkbox */}

                                                <TableCell
                                                    padding="checkbox"
                                                >

                                                    <Checkbox
                                                        color="primary"
                                                        checked={
                                                            isItemSelected
                                                        }
                                                        slotProps={{
                                                            input: {
                                                                'aria-labelledby':
                                                                    labelId,
                                                            },
                                                        }}
                                                    />

                                                </TableCell>


                                                {/* Dynamic cells */}

                                                {headCells.map((headCell) => {
                                                    const value = row[headCell.id];

                                                    // Check if this is the image URL column
                                                    const isImageColumn = headCell.id === 'urlLink';




                                                    return (

                                                        <TableCell
                                                            key={
                                                                headCell.id
                                                            }
                                                            component={
                                                                headCell.id ===
                                                                    headCells[0]?.id
                                                                    ? 'th'
                                                                    : 'td'
                                                            }
                                                            id={
                                                                headCell.id ===
                                                                    headCells[0]?.id
                                                                    ? labelId
                                                                    : undefined
                                                            }
                                                            scope={
                                                                headCell.id ===
                                                                    headCells[0]?.id
                                                                    ? 'row'
                                                                    : undefined
                                                            }
                                                            align={
                                                                headCell.numeric
                                                                    ? 'right'
                                                                    : 'left'
                                                            }
                                                        >


                                                            {isImageColumn && value ? (

                                                                <a
                                                                    href={value}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    <img
                                                                        src={value}
                                                                        alt="Product"
                                                                        style={{
                                                                            height: '50px',
                                                                            width: '50px',
                                                                            objectFit: 'cover',
                                                                            borderRadius: '4px',
                                                                            display: 'block',
                                                                        }}
                                                                    />
                                                                </a>

                                                            ) : (

                                                                formatValue(value)

                                                            )}

                                                        </TableCell>

                                                    )
                                                }
                                                )}

                                            </TableRow>

                                        );

                                    }
                                )

                            )}


                            {/* Empty rows */}

                            {!loading &&
                                emptyRows > 0 && (

                                    <TableRow
                                        style={{
                                            height:
                                                (dense
                                                    ? 33
                                                    : 53) *
                                                emptyRows,
                                        }}
                                    >

                                        <TableCell
                                            colSpan={
                                                headCells.length +
                                                1
                                            }
                                        />

                                    </TableRow>

                                )}

                        </TableBody>

                    </Table>

                </TableContainer>


                {/* --------------------------------
                    PAGINATION
                --------------------------------- */}

                <TablePagination
                    rowsPerPageOptions={[
                        5,
                        10,
                        25,
                        50,
                    ]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={
                        rowsPerPage
                    }
                    page={page}
                    onPageChange={
                        handleChangePage
                    }
                    onRowsPerPageChange={
                        handleChangeRowsPerPage
                    }
                />

            </Paper>


            {/* Dense switch */}

            <FormControlLabel
                control={
                    <Switch
                        checked={dense}
                        onChange={
                            handleChangeDense
                        }
                    />
                }
                label="Dense padding"
            />

        </Box>
    );
}