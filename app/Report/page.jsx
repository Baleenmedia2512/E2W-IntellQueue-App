'use client';
import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar, getGridNumericOperators} from '@mui/x-data-grid';
import axios from 'axios';
import { useAppSelector } from '@/redux/store';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Report = () => {
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [value, setValue] = useState(0);
    const [orderDetails, setOrderDetails] = useState([]);
    const [financeDetails, setFinanceDetails] = useState([]);
    const [sumOfFinance, setSumOfFinance] = useState([]);
    const [filter, setFilter] = useState('All');
    // const [orderFilterModel, setOrderFilterModel] = useState({ items: [] });
    // const [financeFilterModel, setFinanceFilterModel] = useState({ items: [] });
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [sumOfOrders, setSumOfOrders] = useState([]);

    const onPieEnter = (_, index) => {
      setActiveIndex(index);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        fetchOrderDetails();
        fetchFinanceDetails();
        fetchSumOfFinance();
        fetchSumOfOrders();
    }, []);

    const fetchSumOfOrders = () => {
      axios
          .get(`https://orders.baleenmedia.com/API/Media/FetchSumOfOrders.php?JsonDBName=${companyName}`)
          .then((response) => {
              const sumOfOrders = response.data;
              setSumOfOrders(sumOfOrders);
          })
          .catch((error) => {
              console.error(error);
          });
  };


    const fetchOrderDetails = () => {
        axios
            .get(`https://orders.baleenmedia.com/API/Media/OrdersList.php?JsonDBName=${companyName}`)
            .then((response) => {
                const data = response.data.map((order, index) => ({
                    ...order,
                    id: order.ID ,
                    Receivable: `₹ ${order.Receivable}`
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
                    id: transaction.ID, // Generate a unique identifier based on the index
                    Amount: `₹ ${transaction.Amount}`,
                }));
                setFinanceDetails(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchSumOfFinance = () => {
        axios
            .get(`https://orders.baleenmedia.com/API/Media/FetchSumOfFinance.php?JsonDBName=${companyName}`)
            .then((response) => {
                const data = response.data
                setSumOfFinance(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const orderColumns = [
        { field: 'OrderNumber', headerName: 'Order#', width: 150},
        { field: 'OrderDate', headerName: 'Order Date', width: 150},
        { field: 'ClientName', headerName: 'Client Name', width: 200 },
        { field: 'Receivable', headerName: 'Amount(₹)', width: 130 },
        { field: 'rateName', headerName: 'Rate Name', width: 150 },
        { field: 'adType', headerName: 'Rate Type', width: 150 },
        { field: 'ConsultantName', headerName: 'Consultant Name', width: 150 },
    ];

    const financeColumns = [
        { field: 'TransactionType', headerName: 'Transaction Type', width: 150 },
        { field: 'TransactionDate', headerName: 'Transaction Date', width: 150 },
        { field: 'Amount', headerName: 'Amount(₹)', width: 130},
        { field: 'OrderNumber', headerName: 'Order Number', width: 150 },
        { field: 'ClientName', headerName: 'Client Name', width: 200 },
        { field: 'Remarks', headerName: 'Remarks', width: 200 },
        { field: 'ConsultantName', headerName: 'Consultant Name', width: 150 },
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

    // Data for the pie chart
    // const pieData = [
    //     { name: 'Income', value: 'income' },
    //     { name: 'Expense', value: 'income' },
    // ];

    // const pieData = sumOfFinance.length > 0 ? [
    //     { name: 'Income', value: parseFloat(sumOfFinance[0].income.replace(/,/g, '')) },
    //     { name: 'Expense', value: parseFloat(sumOfFinance[0].expense.replace(/,/g, '')) },
    // ] : [];
    const pieData = sumOfFinance.length > 0 ? [
      { name: 'Income', value: parseFloat(sumOfFinance[0].income.replace(/,/g, '')) },
      { name: 'Expense', value: parseFloat(sumOfFinance[0].expense.replace(/,/g, '')) },
    ] : [];

    const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722'];

    const renderActiveShape = (props) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
        
        return (
          <g>
            <text x={cx} y={cy} textAnchor="middle" fill="#333"
            dominantBaseline="central">
                <tspan style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: 'Roboto, sans-serif' }}>{`${(percent * 100).toFixed(0)}`}</tspan>
                <tspan dx="0" dy="4" style={{ fontSize: '16px' }}>%</tspan>
                </text>
            <Sector
              cx={cx}
              cy={cy}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              startAngle={startAngle}
              endAngle={endAngle}
              fill={fill}
            />
          </g>
        );
      };

      // Styles
const styles = {
    chartContainer: {
      width: '100%',
      height: '250px',
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0px 4px 8px rgba(128, 0, 128, 0.4)', // Add box shadow for 3D effect
      marginTop: '20px', // Add margin to the top
    marginBottom: '30px',
    },
  };

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
 // Calculate new coordinates based on angle and radius
 const x = cx + (radius + 10) * Math.cos(-midAngle * RADIAN); // Adjusted x position
 const y = cy + (radius + 10) * Math.sin(-midAngle * RADIAN); // Adjusted y position

  // Convert the value to Indian format (10K, 10L, 10Cr)
  const formattedValue = formatIndianNumber(value);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="20px">
      {formattedValue}
    </text>
  );
};

// Function to format numbers in Indian format
const formatIndianNumber = (num) => {
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)}Cr`;
  } else if (num >= 100000) {
    return `${(num / 100000).toFixed(1)}L`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  } else {
    return `${num}`;
  }
};



    return (
        <Box sx={{ width: '100%', padding: '0px' }}>
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
                <Tab label="Finance" />
            </Tabs>
            <Box sx={{ padding: 3 }}>
            {value === 0 && (
  <div style={{ width: '100%' }}>
   
      <div style={{
        width: '200px',
        height: '110px',
        borderRadius: '10px',
        boxShadow: '0px 4px 8px rgba(128, 0, 128, 0.4)',
        padding: '12px',
        paddingLeft: '18px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start:',
        justifyContent: 'flex-start:'
      }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '5px'
        }}>
          {sumOfOrders}
        </div>
        <div style={{ fontSize: '18px', color: 'dimgray' }}>
          Total Orders
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {orderDetails.length > 0 && (
        <div style={{ flex: 1, width: '100%',  boxShadow: '0px 4px 8px rgba(128, 0, 128, 0.4)' }}>
          {/* Assuming DataGrid is properly defined */}
          <DataGrid rows={orderDetails} columns={orderColumns} />
        </div>
      )}
    </div>
    {/* <div style={{ height: '500px', width: '100%' }}>
      <DataGrid
        rows={orderDetails}
        columns={orderColumns}
        // filterModel={orderFilterModel}
        // onFilterModelChange={handleOrderFilterChange}
        // components={{
        //   Toolbar: GridToolbar,
        // }}
      />
    </div> */}
  </div>
)}

        {value === 1 && (
             <div style={{ width: '100%' }}>
             {/* <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2, width: '40%'}}>
                 <InputLabel id="filter-label">Transaction Type</InputLabel>
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
             </FormControl> */}

             {/* <div style={styles.chartContainer}>
             <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          onMouseEnter={onPieEnter}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend 
          layout="vertical" 
          align="right" 
          verticalAlign="middle" 
          wrapperStyle={{ paddingLeft: "20px" }} 
        />
      </PieChart>
    </ResponsiveContainer>
             </div> */}
             <div style={styles.chartContainer}>
<ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            stroke='none'
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        <Legend 
          layout="vertical" 
          align="right" 
          verticalAlign="middle" 
          wrapperStyle={{ paddingLeft: "20px" }} 
        />
        </PieChart>
      </ResponsiveContainer>
      </div>
             <div style={{width: '100%', boxShadow: '0px 4px 8px rgba(128, 0, 128, 0.4)' }}>
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
