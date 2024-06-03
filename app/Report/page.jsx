'use client';
import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useAppSelector } from '@/redux/store';

const Report = () => {
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [value, setValue] = useState(0);
    const [orderDetails, setOrderDetails] = useState([]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleSwipeChange = (index) => {
        setValue(index);
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [companyName]);

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
    

    const columns = [
        { field: 'orderNumber', headerName: 'Order Number', width: 150 },
        { field: 'orderDate', headerName: 'Order Date', width: 150 },
        { field: 'clientName', headerName: 'Client Name', width: 200 },
        { field: 'amount', headerName: 'Amount', width: 130 },
        { field: 'rateName', headerName: 'Rate Name', width: 150 },
        { field: 'rateType', headerName: 'Rate Type', width: 150 },
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
                    {/* Content for Orders tab */}
                    <div style={{ width: '100%' }}>
                    <div style={{ height: 350, width: '100%' }}>
                        <DataGrid 
                        rows={orderDetails}
                        columns={columns}
                        />
                    </div>
                    </div>
                </Box>
                <Box sx={{ padding: 3 }}>
                    {/* Content for Finances tab */}
                    <h2>Finances</h2>
                    <p>Finance details go here...</p>
                </Box>
        </Box>
    );
}

export default Report;
