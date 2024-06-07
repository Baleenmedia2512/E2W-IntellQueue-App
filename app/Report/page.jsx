'use client';
import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar, getGridNumericOperators} from '@mui/x-data-grid';
import axios from 'axios';
import { useAppSelector } from '@/redux/store';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';


const Report = () => {
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [value, setValue] = useState(0);
    const [orderDetails, setOrderDetails] = useState([]);
    const [financeDetails, setFinanceDetails] = useState([]);
    const [filter, setFilter] = useState('All');
    // const [orderFilterModel, setOrderFilterModel] = useState({ items: [] });
    // const [financeFilterModel, setFinanceFilterModel] = useState({ items: [] });

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        fetchOrderDetails();
        fetchFinanceDetails();
    }, []);

    const fetchOrderDetails = () => {
        axios
            .get(`https://orders.baleenmedia.com/API/Media/OrdersList.php?JsonDBName=${companyName}`)
            .then((response) => {
                const data = response.data.map((order, index) => ({
                    ...order,
                    id: order.ID // Generate a unique identifier based on the index
                }));
                setOrderDetails(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };
    
    const fetchFinanceDetails = () => {
        axios
            .get(`https://orders.baleenmedia.com/API/Media/FinanceList.php?JsonDBName=${companyName}`)
            .then((response) => {
                const data = response.data.map((transaction, index) => ({
                    ...transaction,
                    id: transaction.ID // Generate a unique identifier based on the index
                }));
                setFinanceDetails(data);
                console.log(data)
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const orderColumns = [
        { field: 'OrderNumber', headerName: 'Order Number', width: 150},
        { field: 'OrderDate', headerName: 'Order Date', width: 150},
        { field: 'ClientName', headerName: 'Client Name', width: 200 },
        { field: 'Receivable', headerName: 'Amount', width: 130 },
        { field: 'rateName', headerName: 'Rate Name', width: 150 },
        { field: 'adType', headerName: 'Rate Type', width: 150 },
    ];

    const financeColumns = [
        { field: 'TransactionType', headerName: 'Transaction Type', width: 150 },
        { field: 'TransactionDate', headerName: 'Transaction Date', width: 150 },
        { field: 'OrderNumber', headerName: 'Order Number', width: 150 },
        { field: 'Amount', headerName: 'Amount', width: 130},
        { field: 'TaxType', headerName: 'Tax Type', width: 150 },
        { field: 'Remarks', headerName: 'Remarks', width: 200 },
        { field: 'ClientName', headerName: 'Client Name', width: 200 }, // Assuming ClientName is included after the join
    ];
    
    const filteredFinanceDetails = financeDetails.filter(transaction => 
        filter === 'All' || transaction.TransactionType.toLowerCase().includes(filter.toLowerCase())
    );

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    // useEffect(() => {
    //     const operators = getGridNumericOperators();
    //     const updatedOrderColumns = orderColumns.map((column) => ({
    //         ...column,
    //         filterOperators: operators,
    //     }));
    //     const updatedFinanceColumns = financeColumns.map((column) => ({
    //         ...column,
    //         filterOperators: operators,
    //     }));
    //     setOrderDetails(updatedOrderColumns);
    //     setFinanceDetails(updatedFinanceColumns);
    // }, []);

    // const handleOrderFilterChange = (model) => {
    //     setOrderFilterModel(model);
    // };

    // const handleFinanceFilterChange = (model) => {
    //     setFinanceFilterModel(model);
    // };

    return (
        <Box sx={{ width: '100%', padding: '12px' }}>
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="secondary"
                indicatorColor="secondary"
                aria-label="secondary tabs example"
                centered
                variant="fullWidth"
            >
                <Tab label="Orders" />
                <Tab label="Finances" />
            </Tabs>
            <Box sx={{ padding: 3 }}>
        {value === 0 && (
          <div style={{ width: '100%' }}>
          <div style={{ height: 500 , width: '100%' }}>
            <DataGrid
              rows={orderDetails}
              columns={orderColumns}
            //   filterModel={orderFilterModel}
            //   onFilterModelChange={handleOrderFilterChange}
            //   components={{
            //       Toolbar: GridToolbar,
            //      }}
            />
          </div>
        </div>
        )}
        {value === 1 && (
             <div style={{ width: '100%' }}>
             <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2, width: '40%'}}>
                 <InputLabel id="filter-label">Filter by Transaction Type</InputLabel>
                 <Select
                     labelId="filter-label"
                     id="filter"
                     value={filter}
                     onChange={handleFilterChange}
                     label="Filter by Transaction Type"
                 >
                     <MenuItem value="All">All</MenuItem>
                     <MenuItem value="Income">Income</MenuItem>
                     <MenuItem value="Expense">Expense</MenuItem>
                 </Select>
             </FormControl>
             <div style={{ height: 500, width: '100%' }}>
                 <DataGrid
                     rows={filteredFinanceDetails}
                     columns={financeColumns}
                    //  filterModel={financeFilterModel}
                    //  onFilterModelChange={handleFinanceFilterChange}
                    //  components={{
                    //      Toolbar: GridToolbar,
                    //  }}
                 />
             </div>
         </div>
        //   <div style={{ width: '100%' }}>
        //   <div style={{ height: 500 , width: '100%' }}>
        //     <DataGrid
        //       rows={financeDetails}
        //       columns={financeColumns}
        //     />
        //   </div>
        // </div>
        )}
      </Box>
    </Box>
    );
}

export default Report;
