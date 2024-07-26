'use client';
import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar, getGridNumericOperators} from '@mui/x-data-grid';
import axios from 'axios';
import { useAppSelector } from '@/redux/store';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Button from '@mui/material/Button';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import DateRangePicker from './CustomDateRangePicker';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from '@mui/material';
import './styles.css';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMediaQuery } from '@mui/material';

const Report = () => {
    const dbName = useAppSelector(state => state.authSlice.companyName);
    const companyName = "Baleen Test";
    // const companyName = useAppSelector(state => state.authSlice.companyName);
    const username = useAppSelector(state => state.authSlice.userName);
    const appRights = useAppSelector(state => state.authSlice.appRights);
    const [value, setValue] = useState(0);
    const [orderDetails, setOrderDetails] = useState([]);
    const [financeDetails, setFinanceDetails] = useState([]);
    const [sumOfFinance, setSumOfFinance] = useState([]);
    const [filter, setFilter] = useState('All');
    // const [orderFilterModel, setOrderFilterModel] = useState({ items: [] });
    // const [financeFilterModel, setFinanceFilterModel] = useState({ items: [] });
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [sumOfOrders, setSumOfOrders] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
     const [successMessage, setSuccessMessage] = useState('');
     const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const currentStartDate = startOfMonth(new Date());
  const currentEndDate = endOfMonth(new Date());
  const [selectedRange, setSelectedRange] = useState({
    startDate: currentStartDate,
    endDate: currentEndDate,
  });
  const [startDate, setStartDate] = useState(format(currentStartDate, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(currentEndDate, 'yyyy-MM-dd'));
  const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [totalIncome, setTotalIncome] = useState('');
    const [totalExpense, setTotalExpense] = useState('');
    const [marginResult, setMarginResult] = useState('');
    const [currentBalance, setCurrentBalance] = useState('');
    const [cashInHand, setCashInHand] = useState('');
    const [ledgerBalance, setLedgerBalance] = useState('');
    const [selectedOrder, setSelectedOrder] = useState('');
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [deletingOrder, setDeletingOrder] = useState('');
    const [restoredialogOpen, setRestoreDialogOpen] = useState(false);
    const [newRateWiseOrderNumber, setNewRateWiseOrderNumber] = useState(null);
    const [orderNum, setOrderNum] = useState(null);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlePasswordSubmit = () => {
      const encodedPassw = encodeURIComponent(password);

      fetch(`https://orders.baleenmedia.com/API/Media/Login.php/get?JsonDBName=${companyName}&JsonUserName=${username}&JsonPassword=${encodedPassw}`)
          .then(response => response.json())
          .then(data => {
              if (data.status === 'Login Successfully') {
                  setOpen(false);
                  setDialogOpen(true);
                  setPassword('');
              } else {
                  setPasswordError(true);
              }
          })
          .catch(error => {
              console.error('Error during password validation:', error);
          });
  };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const onPieEnter = (_, index) => {
      setActiveIndex(index);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    
    useEffect(() => {
        fetchMarginAmount();
        fetchOrderDetails();
        fetchFinanceDetails();
        fetchSumOfFinance();
        fetchSumOfOrders();
        FetchCurrentBalanceAmount();
    }, [startDate, endDate]);

    useEffect(() => {
      FetchCurrentBalanceAmount();
  }, [marginResult]);

    const fetchSumOfOrders = () => {
      axios
          .get(`https://orders.baleenmedia.com/API/Media/FetchSumOfOrders.php?JsonDBName=${companyName}&JsonStartDate=${startDate}&JsonEndDate=${endDate}`)
          .then((response) => {
              const totalOrders = response.data;
              setSumOfOrders(totalOrders);

          })
          .catch((error) => {
              console.error(error);
          });
  };

    const fetchOrderDetails = () => {
        axios
            .get(`https://orders.baleenmedia.com/API/Media/OrdersList.php?JsonDBName=${companyName}&JsonStartDate=${startDate}&JsonEndDate=${endDate}`)
            .then((response) => {
                const data = response.data.map((order, index) => ({
                    ...order,
                    id: order.ID ,
                    Receivable: `₹ ${order.Receivable}`,
                    markInvalidDisabled: order.RateWiseOrderNumber < 0,
                    restoreDisabled: order.RateWiseOrderNumber > 0,
                }));
                setOrderDetails(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };
    
    const fetchFinanceDetails = () => {
        axios
            .get(`https://orders.baleenmedia.com/API/Media/FinanceList.php?JsonDBName=${companyName}&JsonStartDate=${startDate}&JsonEndDate=${endDate}`)
            .then((response) => {
                const financeDetails = response.data.map((transaction, index) => ({
                    ...transaction,
                    id: transaction.ID, // Generate a unique identifier based on the index
                    Amount: `₹ ${transaction.Amount}`,
                }));
                setFinanceDetails(financeDetails);
                
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchSumOfFinance = () => {
        axios
            .get(`https://orders.baleenmedia.com/API/Media/FetchSumOfFinance.php?JsonDBName=${companyName}&JsonStartDate=${startDate}&JsonEndDate=${endDate}`)
            .then((response) => {
                const data = response.data
                setSumOfFinance(data);
                
            })
            .catch((error) => {
                console.error(error);
                
            });
    };

    const handleMarkInvalid = (orderNum) => {
      axios
          .get(`https://orders.baleenmedia.com/API/Media/MakeOrderInvalidOrRestore.php?JsonDBName=${companyName}&OrderNumber=${orderNum}&Action=invalid`)
          .then((response) => {
              setSuccessMessage('Order Cancelled!');
                    setTimeout(() => {
                        setSuccessMessage('');
                    }, 2000);
              fetchOrderDetails();
          })
          .catch((error) => {
              console.error(error);
              setToastMessage('Failed to cancel order. Please try again.');
                    setSeverity('error');
                    setToast(true);
                    setTimeout(() => {
                        setToast(false);
                    }, 2000);
          });
  };

  const handleOrderDelete = (rateWiseOrderNum, OrderNum) => {
    axios
        .get(`https://orders.baleenmedia.com/API/Media/DeleteOrder.php?JsonRateWiseOrderNumber=${rateWiseOrderNum}&JsonOrderNumber=${OrderNum}&JsonDBName=${companyName}`)
        .then((response) => {
            const data = response.data;
            if (data.message === 'There is finance entry on this order.') {
                setOrderDialogOpen(true);
                setDeletingOrder(OrderNum)
            } else {
                setSuccessMessage('Order Cancelled!');
                setTimeout(() => {
                    setSuccessMessage('');
                }, 2000);
                fetchOrderDetails();
            }
        })
        .catch((error) => {
            console.error(error);
            setToastMessage('Failed to delete order. Please try again.');
            setSeverity('error');
            setToast(true);
            setTimeout(() => {
                setToast(false);
            }, 2000);
        });
};

const handleTransactionDelete = (rateWiseOrderNum, orderNum) => {
  axios
      .get(`https://orders.baleenmedia.com/API/Media/DeleteTransaction.php?JsonRateWiseOrderNumber=${rateWiseOrderNum}&JsonOrderNumber=${orderNum}&JsonDBName=${companyName}`)
      .then((response) => {
          const data = response.data;
          if (data.success) {
            setSuccessMessage('Transaction Deleted!');
            setTimeout(() => {
              setSuccessMessage('');
            }, 2000);
            fetchFinanceDetails();
          } else {
            setToastMessage(data.message);
            setSeverity('error');
            setToast(true);
            setTimeout(() => {
              setToast(false);
            }, 2000);
          }
      })
      .catch((error) => {
          console.error(error);
          setToastMessage('Failed to delete order. Please try again.');
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
              setToast(false);
          }, 2000);
      });
};

const handleGoToFinance = () => {
  setSelectedOrder(deletingOrder);
  setValue(1); // Switch to Finance tab
  setOrderDialogOpen(false);
};

const handleCloseOrderDialog = () => {
  setOrderDialogOpen(false);
};

const RestoreOrderDialog = ({ open, onClose, onConfirm, newRateWiseOrderNumber }) => (
  <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Restore</DialogTitle>
      <DialogContent>
          <p>Rate Wise Order Number is already occupied. Do you want to continue with the new number <strong>{newRateWiseOrderNumber}</strong>?</p>
      </DialogContent>
      <DialogActions>
          <Button onClick={onConfirm} color="primary">Yes</Button>
          <Button onClick={onClose} color="primary">No</Button>
      </DialogActions>
  </Dialog>
);

const handleRestoreClose = () => {
  setRestoreDialogOpen(false);
};

const handleRestore = async (rateWiseOrderNum, orderNum, rateName) => {
  try {
      const response = await axios.get(`https://orders.baleenmedia.com/API/Media/RestoreOrder.php?JsonDBName=${companyName}&JsonRateWiseOrderNumber=${rateWiseOrderNum}&OrderNumber=${orderNum}&Action=restore`);
      
      if (response.data.conflict) {
          // Fetch next available RateWiseOrderNumber
          const fetchResponse = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchMaxOrderNumber.php?JsonDBName=${companyName}&JsonRateName=${rateName}`);
          const data = await fetchResponse.json();
          setNewRateWiseOrderNumber(data.nextRateWiseOrderNumber);
          setOrderNum(orderNum);
          setRestoreDialogOpen(true);
      } else {
          // Successful restore
          setSuccessMessage('Order Restored!');
          setTimeout(() => setSuccessMessage(''), 2000);
          fetchOrderDetails();
      }
  } catch (error) {
      console.error('Error during restore operation:', error);
      setToastMessage(`Failed to restore. Error: ${error.message}`);
      setSeverity('error');
      setToast(true);
      setTimeout(() => setToast(false), 2000);
  }
};

const handleConfirm = async () => {
  try {
      await axios.get(`https://orders.baleenmedia.com/API/Media/RestoreOrder.php?JsonDBName=${companyName}&JsonRateWiseOrderNumber=${newRateWiseOrderNumber}&OrderNumber=${orderNum}`);
      setSuccessMessage('Order Restored with new number!');
      setTimeout(() => setSuccessMessage(''), 2000);
      fetchOrderDetails();
  } catch (error) {
      console.error('Restore failed:', error);
      setToastMessage(`Failed to restore with new number. Error: ${error.message}`);
      setSeverity('error');
      setToast(true);
      setTimeout(() => setToast(false), 2000);
  }
  setRestoreDialogOpen(false);
};

// const handleRestore = async (rateWiseOrderNum, orderNum, rateName) => {
//   try {
//       const response = await axios.get(`https://orders.baleenmedia.com/API/Media/RestoreOrder.php?JsonDBName=${companyName}&JsonRateWiseOrderNumber=${rateWiseOrderNum}&OrderNumber=${orderNum}`);

//       if (response.data.conflict) {
//           const fetchResponse = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchMaxOrderNumber.php?JsonDBName=${companyName}&JsonRateName=${rateName}`);
//           if (!fetchResponse.ok) {
//               throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
//           }
//           const data = await fetchResponse.json();
//           const newRateWiseOrderNumber = data.nextRateWiseOrderNumber;

//           if (confirm(`RateWiseOrderNumber is already occupied. Do you want to continue with the new number ${newRateWiseOrderNumber}?`)) {
//               // User agrees to use a new RateWiseOrderNumber
//               const restoreResponse = await axios.get(`https://orders.baleenmedia.com/API/Media/RestoreOrder.php?JsonDBName=${companyName}&JsonRateWiseOrderNumber=${newRateWiseOrderNumber}&OrderNumber=${orderNum}`);
//               setSuccessMessage('Order Restored with new number!');
//               setTimeout(() => {
//                   setSuccessMessage('');
//               }, 2000);
//               fetchOrderDetails();
//           }
//       } else {
//           setSuccessMessage('Order Restored!');
//           setTimeout(() => {
//               setSuccessMessage('');
//           }, 2000);
//           fetchOrderDetails();
//       }
//   } catch (error) {
//       console.error(error);
//       setToastMessage('Failed to restore. Please try again.');
//       setSeverity('error');
//       setToast(true);
//       setTimeout(() => {
//           setToast(false);
//       }, 2000);
//   }
// };

  const fetchMarginAmount = () => {
    axios
        .get(`https://orders.baleenmedia.com/API/Media/FetchMarginAmount.php?JsonDBName=${companyName}&JsonStartDate=${startDate}&JsonEndDate=${endDate}`)
        .then((response) => {
            const data = response.data[0]
            const income = parseFloat(data.total_income);
        const expense = parseFloat(data.total_expense);
        const margin = parseFloat(data.margin_amount);
        setTotalIncome(isNaN(income) ? 0 : Math.round(income));
        setTotalExpense(isNaN(expense) ? 0 : Math.round(expense));
        setMarginResult(isNaN(margin) ? 0 : Math.round(margin));
        })
        .catch((error) => {
            console.error(error);
        });
};
const FetchCurrentBalanceAmount = () => {
  axios
      .get(`https://orders.baleenmedia.com/API/Media/FetchCurrentBalanceAmount.php?JsonDBName=${companyName}`)
      .then((response) => {
          const data = response.data[0]
        setCurrentBalance(data.currentBalance);
      })
      .catch((error) => {
          console.error(error);
      });
};

const isMobile = useMediaQuery('(max-width:640px)');
const [anchorEl, setAnchorEl] = useState(null);

const orderColumns = [
  { field: 'OrderNumber', headerName: 'Order#', width: 80 },
  { field: 'RateWiseOrderNumber', headerName: 'Rate Wise Order#', width: 80 },
  { field: 'OrderDate', headerName: 'Order Date', width: 100 },
  { field: 'ClientName', headerName: 'Client Name', width: 170 },
  { field: 'Receivable', headerName: 'Amount(₹)', width: 100 },
  { field: 'rateName', headerName: 'Rate Name', width: 150 },
  { field: 'adType', headerName: 'Rate Type', width: 150 },
  { field: 'ConsultantName', headerName: 'Consultant Name', width: 150 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 250,
    renderCell: (params) => (
        <div>
            <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          disabled={params.row.markInvalidDisabled}
                          onClick={() => handleOrderDelete(params.row.RateWiseOrderNumber, params.row.OrderNumber)}
                          style={{ marginRight: '12px', backgroundColor: '#ff5252',
                              color: 'white',
                              fontWeight: 'bold', 
                              opacity: params.row.markInvalidDisabled ? 0.2 : 1,
                              pointerEvents: params.row.markInvalidDisabled ? 'none' : 'auto' }}
                      >
                          Cancel Order
                      </Button>
            <Button
                variant="contained"
                color="primary"
                size="small"
                disabled={params.row.restoreDisabled}
                onClick={() => handleRestore(params.row.RateWiseOrderNumber, params.row.OrderNumber, params.row.rateName)}
                style={{ backgroundColor: '#1976d2',
                  color: 'white',
                  fontWeight: 'bold',
                  opacity: params.row.restoreDisabled ? 0.5 : 1,
                  pointerEvents: params.row.restoreDisabled ? 'none' : 'auto' }}
            >
                Restore
            </Button>
        </div>
    ),
},
  // {
  //     field: 'actions',
  //     headerName: 'Actions',
  //     width: isMobile ? 100 : 450,
  //     renderCell: (params) => {
  //         const handleClick = (event) => {
  //             setAnchorEl(event.currentTarget);
  //         };
          
  //         const handleClose = () => {
  //             setAnchorEl(null);
  //         };
          
  //         const handleMenuItemClick = (action) => {
  //             handleClose();
  //             if (action === 'delete') handleOrderDelete(params.row.RateWiseOrderNumber, params.row.OrderNumber);
  //             if (action === 'cancel') handleMarkInvalid(params.row.OrderNumber);
  //             if (action === 'restore') handleRestore(params.row.OrderNumber);
  //         };

  //         // Calculate if the order is within the last 24 hours
  //         const orderDate = new Date(params.row.OrderDate);
  //         const now = new Date();
  //         const isRecent = (now - orderDate) < 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  //             <div className="space-x-3">
  //                     <Button
  //                         variant="contained"
  //                         color="primary"
  //                         size="small"
  //                         disabled={params.row.markInvalidDisabled}
  //                         onClick={() => handleOrderDelete(params.row.RateWiseOrderNumber, params.row.OrderNumber)}
  //                         style={{ marginRight: '12px', backgroundColor: '#ff5252',
  //                             color: 'white',
  //                             fontWeight: 'bold', 
  //                             opacity: params.row.markInvalidDisabled ? 0.2 : 1,
  //                             pointerEvents: params.row.markInvalidDisabled ? 'none' : 'auto' }}
  //                     >
  //                         Cancel Order
  //                     </Button>
  //                 <Button
  //                     variant="contained"
  //                     color="primary"
  //                     size="small"
  //                     disabled={params.row.restoreDisabled}
  //                     onClick={() => handleRestore(params.row.OrderNumber)}
  //                     style={{ backgroundColor: '#1976d2',
  //                         color: 'white',
  //                         fontWeight: 'bold',
  //                         opacity: params.row.restoreDisabled ? 0.2 : 1,
  //                         pointerEvents: params.row.restoreDisabled ? 'none' : 'auto' }}
  //                 >
  //                     Restore
  //                 </Button>
  //             </div>
  //     },
  // },
];


    const financeColumns = [
        { field: 'TransactionType', headerName: 'Transaction Type', width: 150 },
        { field: 'TransactionDate', headerName: 'Transaction Date', width: 150 },
        { field: 'Amount', headerName: 'Amount(₹)', width: 130},
        { field: 'OrderNumber', headerName: 'Order#', width: 100 },
        { field: 'RateWiseOrderNumber', headerName: 'Rate Wise Order#', width: 80},
        { field: 'ClientName', headerName: 'Client Name', width: 200 },
        { field: 'Remarks', headerName: 'Remarks', width: 200 },
        { field: 'ConsultantName', headerName: 'Consultant Name', width: 150 },
        {
          field: 'actions',
          headerName: 'Actions',
          width: isMobile ? 100 : 450,
          renderCell: (params) => (
              <div>
                  <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleTransactionDelete(params.row.RateWiseOrderNumber, params.row.OrderNumber)}
                              style={{ backgroundColor: '#ff5252', color: 'white', fontWeight: 'bold' }}
                          >
                              Delete Transaction
                          </Button>
              </div>
          ),
      },
        
      //   {
      //     field: 'actions',
      //     headerName: 'Actions',
      //     width: isMobile ? 100 : 450,
      //     renderCell: (params) => {
  
      //         const handleClick = (event) => {
      //             setAnchorEl(event.currentTarget);
      //         };
  
      //         const handleClose = () => {
      //             setAnchorEl(null);
      //         };
  
      //         const handleMenuItemClick = (action) => {
      //             handleClose();
      //             if (action === 'delete') handleTransactionDelete(params.row.RateWiseOrderNumber, params.row.OrderNumber);
      //         };
  
      //         // Calculate if the transaction date is today
      //         const transactionDate = new Date(params.row.TransactionDate);
      //         const now = new Date();
      //         const isToday = transactionDate.toDateString() === now.toDateString();
  
            
      //             <div className="space-x-3">
      //                     <Button
      //                         variant="contained"
      //                         color="primary"
      //                         size="small"
      //                         onClick={() => handleTransactionDelete(params.row.RateWiseOrderNumber, params.row.OrderNumber)}
      //                         style={{ backgroundColor: '#ff5252', color: 'white', fontWeight: 'bold' }}
      //                     >
      //                         Delete Transaction
      //                     </Button>
      //             </div>
      //     },
      // },
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
      { name: 'Income', value: parseFloat(sumOfFinance[0].income || 0) },
      { name: 'Expense', value: parseFloat(sumOfFinance[0].expense || 0) },
    ] : [];

    const isPieEmpty = !pieData || pieData.length < 2 || (pieData[0]?.value === 0 && pieData[1]?.value === 0);

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
          boxShadow: '0px 4px 8px rgba(128, 128, 128, 0.4)', // Gray shadow for 3D effect
          marginTop: '20px',
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
  const fontSize = window.innerWidth > 768 ? "20px" : "14px";

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={fontSize}>
      {value}
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

const handleDateChange = (range) => {
  setSelectedRange({
    startDate: range.startDate,
    endDate: range.endDate,
  });
  const formattedStartDate = format(range.startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(range.endDate, 'yyyy-MM-dd');
  setStartDate(formattedStartDate);
  setEndDate(formattedEndDate);
};

 // Utility function to format number as Indian currency (₹)
 const formatIndianCurrency = (number) => {
  if (typeof number === 'number') {
    return number.toLocaleString('en-IN');
  }
  return number;
};

    return (
        <Box sx={{ width: '100%', padding: '0px' }}>
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="primary"
                indicatorColor="primary"
                aria-label="secondary tabs example"
                centered
                variant="fullWidth"
            >
                <Tab label="Orders" />
                {appRights.includes('Administrator') || appRights.includes('Finance') ? <Tab label="Finance" /> : null}
            </Tabs>
            <Dialog
                open={orderDialogOpen}
                onClose={handleCloseOrderDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Finance Entry Detected"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        There is a finance entry on this order.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                {appRights.includes('Administrator') || appRights.includes('Finance') ? (
            <Button onClick={handleGoToFinance} color="primary">
                Go to Finance Report
            </Button>
        ) : null}
                    <Button onClick={handleCloseOrderDialog} color="primary" autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            

            <Box sx={{ padding: 3 }}>
            {value === 0 && (
  <div style={{ width: '100%' }}>
    <div>
    <RestoreOrderDialog
                open={restoredialogOpen}
                onClose={handleRestoreClose}
                onConfirm={handleConfirm}
                newRateWiseOrderNumber={newRateWiseOrderNumber}
            />
            </div>
   <div className="flex justify-between items-start">
  {/* Total Orders box */}
  {/* Total Orders box */}
<div className="w-40 h-36 rounded-lg shadow-md p-3 mb-5 flex flex-col items-start justify-start border border-gray-300">
  <div className="text-4xl text-black mt-5 font-bold">
    {sumOfOrders}
  </div>
  <div className="text-lg text-gray-600">
    Total Orders
  </div>
</div>

  {/* <div style={{
        width: '200px',
        height: '143px',
        borderRadius: '10px',
        boxShadow: '0px 4px 8px rgba(128, 128, 128, 0.4)',
        padding: '12px',
        paddingLeft: '18px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start:',
        justifyContent: 'flex-start:',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{
          fontSize: '36px',
          marginTop: '20px',
          fontWeight: 'bold'
        }}>
          {sumOfOrders}
        </div>
        <div style={{ fontSize: '18px', color: 'dimgray' }}>
          Total Orders
        </div>
      </div> */}

  {/* Spacer to center the DateRangePicker */}
  <div className="flex flex-grow text-black ml-2 mb-4">
  <DateRangePicker startDate={selectedRange.startDate} endDate={selectedRange.endDate} onDateChange={handleDateChange} />

  </div>
</div>


   {/* <div>
      <div style={{
        width: '200px',
        height: '110px',
        borderRadius: '10px',
        boxShadow: '0px 4px 8px rgba(128, 128, 128, 0.4)',
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
      <DateRangePicker dates={dates} setDates={setDates} />
      </div> */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '54px' }}>
        <div style={{ flex: 1, width: '100%',  boxShadow: '0px 4px 8px rgba(128, 128, 128, 0.4)' }}>
          <DataGrid rows={orderDetails} columns={orderColumns}
          pageSize={10}
          initialState={{
            sorting: {
              sortModel: [{ field: 'OrderNumber', sort: 'desc' }],
            },
          }} 
           sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#e3f2fd', // Light blue on hover
            },
          }}
          />
        </div>
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
              <div className="flex flex-grow text-black ml-2 mb-4">
               <DateRangePicker startDate={selectedRange.startDate} endDate={selectedRange.endDate} onDateChange={handleDateChange} />
               <div className="flex flex-grow items-end ml-2 mb-4">
               <button className="custom-button" onClick={handleClickOpen}>
                Show Balance
              </button>
                </div>
             </div>
             <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Enter Password</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter your password to proceed.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={passwordError}
                        helperText={passwordError ? 'Invalid password. Please try again.' : ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handlePasswordSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>Account Balance Information</DialogTitle>
                <hr className="border-gray-300" />
                <DialogContent>
                    <div className="flex items-center space-x-1 sm:space-x-1">
                    <p className="text-lg font-bold whitespace-nowrap">Margin Amount</p>
                    <p className="text-xs  mt-1">({format(startDate, 'dd-MMM-yy')} - {format(endDate, 'dd-MMM-yy')})</p>
                  </div>


                    <div className="w-fit p-4 mt-2 border rounded-lg flex items-center space-x-4">
                <p className="text-xl font-bold">₹{formatIndianCurrency(marginResult)}</p>
            </div>
            
            <div>
                <p className="text-xs text-gray-500 mt-1">Income - Expense = Margin Amount</p></div>
                <div className="flex justify-center my-4">
            <div className="w-full border-t border-gray-300" />
        </div>
        
            <div className="flex items-center mt-5">
                      <p className="text-lg font-bold">Current Bank Balance</p>
                      <p className="text-xs ml-1 mt-1">(Overall)</p>
                  </div>
                    <div className="w-fit p-4 mt-2 border rounded-lg flex items-center space-x-4">
                <p className="text-xl font-bold">₹{formatIndianCurrency(currentBalance)}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 mt-1">Ledger Balance + Income - Expense = Current Bank Balance</p></div>
                </DialogContent>
                <hr className=" border-gray-300 w-full" />
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <div>
             <div style={styles.chartContainer}>
             {isPieEmpty ? (
        <div className="text-center">No records found during this timeline!</div>
      ) : (
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
      )}
      </div>
      </div>
             <div style={{width: '100%', boxShadow: '0px 4px 8px rgba(128, 0, 128, 0.4)', marginBottom: '54px' }}>
                 <DataGrid
                     rows={filteredFinanceDetails}
                     columns={financeColumns}
                     initialState={{
                      sorting: {
                        sortModel: [{ field: 'OrderNumber', sort: 'desc' }],
                      },
                    }} 
                    //  filterModel={financeFilterModel}
                    //  onFilterModelChange={handleFinanceFilterChange}
                    //  components={{
                    //      Toolbar: GridToolbar,
                    //  }}
                    sx={{
                      '& .MuiDataGrid-row:hover': {
                          backgroundColor: '#e3f2fd', // Light blue on hover
                      },
                      '& .highlighted-row': {
                          backgroundColor: '#fff385', // Yellow highlight
                      },
                  }}
                  getRowClassName={(params) =>
                      params.row.OrderNumber === selectedOrder ? 'highlighted-row' : ''
                  }
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
      {successMessage && <SuccessToast message={successMessage} />}
  {toast && <ToastMessage message={toastMessage} type="error"/>}
    </Box>
    
    );
}

export default Report;
