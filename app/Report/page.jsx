'use client';
import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { DataGrid, GridFilterInputValue, getGridStringOperators, getGridNumericOperators } from '@mui/x-data-grid';
import axios from 'axios';
import { useAppSelector } from '@/redux/store';

const Report = () => {
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [value, setValue] = useState(0);
    const [orderDetails, setOrderDetails] = useState([]);
    const [financeDetails, setFinanceDetails] = useState([]);

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
                    id: index + 1 // Generate a unique identifier based on the index
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
                    id: index + 1 // Generate a unique identifier based on the index
                }));
                setFinanceDetails(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const customStringOperators = getGridStringOperators().map(operator => ({
        ...operator,
        InputComponent: GridFilterInputValue,
    }));
    
    const customNumericOperators = getGridNumericOperators().map(operator => ({
        ...operator,
        InputComponent: GridFilterInputValue,
    }));

    const orderColumns = [
        { field: 'OrderNumber', headerName: 'Order Number', width: 150, filterOperators: customNumericOperators},
        { field: 'OrderDate', headerName: 'Order Date', width: 150, filterOperators: customNumericOperators },
        { field: 'ClientName', headerName: 'Client Name', width: 200 },
        { field: 'Receivable', headerName: 'Amount', width: 130 },
        { field: 'rateName', headerName: 'Rate Name', width: 150 },
        { field: 'adType', headerName: 'Rate Type', width: 150 },
    ];

    const financeColumns = [
        { field: 'TransactionType', headerName: 'Transaction Type', width: 150 },
        { field: 'TransactionDate', headerName: 'Transaction Date', width: 150 },
        { field: 'OrderNumber', headerName: 'Order Number', width: 150 },
        { field: 'Amount', headerName: 'Amount', width: 130 },
        { field: 'TaxType', headerName: 'Tax Type', width: 150 },
        { field: 'Remarks', headerName: 'Remarks', width: 200 },
        { field: 'ClientName', headerName: 'Client Name', width: 200 }, // Assuming ClientName is included after the join
    ];
    
   

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
              filterModel={{
                items: [],
            }}
            />
          </div>
        </div>
        )}
        {value === 1 && (
          <div style={{ width: '100%' }}>
          <div style={{ height: 500 , width: '100%' }}>
            <DataGrid
              rows={financeDetails}
              columns={financeColumns}
            />
          </div>
        </div>
        )}
      </Box>
    </Box>
    );
}

export default Report;
