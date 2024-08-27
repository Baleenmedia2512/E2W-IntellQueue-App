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
import { useRouter } from 'next/navigation';
import { setOrderData , setIsOrderUpdate} from '@/redux/features/order-slice';
import { useDispatch } from 'react-redux';
import { Select } from '@mui/material';






const Report = () => {
    const dbName = useAppSelector(state => state.authSlice.companyName);
    // const companyName = "Baleen Test";
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const username = useAppSelector(state => state.authSlice.userName);
    const appRights = useAppSelector(state => state.authSlice.appRights);
    const [value, setValue] = useState(0);
    const [orderDetails, setOrderDetails] = useState([]);
    const [financeDetails, setFinanceDetails] = useState([]);
    const [sumOfFinance, setSumOfFinance] = useState([]);
    const [rateBaseIncome, setRateBaseIncome] = useState([]);
    const [filter, setFilter] = useState('All');
    // const [orderFilterModel, setOrderFilterModel] = useState({ items: [] });
    // const [financeFilterModel, setFinanceFilterModel] = useState({ items: [] });
    const [activeIndex, setActiveIndex] = useState(0);
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
    const [selectedOrder, setSelectedOrder] = useState('');
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [deletingOrder, setDeletingOrder] = useState('');
    const [restoredialogOpen, setRestoreDialogOpen] = useState(false);
    const [newRateWiseOrderNumber, setNewRateWiseOrderNumber] = useState(null);
    const [orderNum, setOrderNum] = useState(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [totalOrderAmount, setTotalOrderAmount] = useState('');
  const [totalFinanceAmount, setTotalFinanceAmount] = useState('');
  const [selectedChart, setSelectedChart] = useState('income'); // Dropdown state

  const handleDropdownChange = (event) => {
    setSelectedChart(event.target.value);
  };

  
  const handleConsultantReportOpen = () => {
    router.push('/Report/ConsultantReport');
};


    const router = useRouter();
    const dispatch = useDispatch();

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

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    
    useEffect(() => {
        fetchMarginAmount();
        fetchOrderDetails();
        fetchFinanceDetails();
        fetchSumOfFinance();
        fetchRateBaseIncome();
        fetchSumOfOrders();
        FetchCurrentBalanceAmount();
        fetchAmounts();
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
                    AdjustedOrderAmount: `₹ ${order.AdjustedOrderAmount}`,
                    TotalAmountReceived: (order.TotalAmountReceived !== undefined && order.TotalAmountReceived !== null) ? `₹ ${order.TotalAmountReceived}` : '',
                    AmountDifference: order.RateWiseOrderNumber < 0 ? `₹ 0` : `₹ ${order.AmountDifference}`,
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
                    OrderValue: `₹ ${transaction.OrderValue}`,
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

    const fetchRateBaseIncome = () => {
      axios
          .get(`https://orders.baleenmedia.com/API/Media/FetchRateBaseIncome.php?JsonDBName=${companyName}&JsonStartDate=${startDate}&JsonEndDate=${endDate}`)
          .then((response) => {
              const data = response.data
              setRateBaseIncome(data);
              
          })
          .catch((error) => {
              console.error(error);
              
          });
  };

    const fetchAmounts = async () => {
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchTotalOrderAndFinanceAmount.php?JsonDBName=${companyName}&JsonStartDate=${startDate}&JsonEndDate=${endDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
    
        // Ensure the fetched data is formatted correctly
        const TotalOrderAmt = data.order_amount !== null ? formatIndianNumber(data.order_amount) : '0';
        const TotalFinanceAmt = data.finance_amount !== null ? formatIndianNumber(data.finance_amount) : '0';
    
        // Update state with formatted values
        setTotalOrderAmount(TotalOrderAmt);
        setTotalFinanceAmount(TotalFinanceAmt);
      } catch (error) {
        console.error(error);
      }
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
                fetchAmounts();
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
            fetchAmounts();
            fetchSumOfFinance();
            fetchRateBaseIncome();
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
          fetchAmounts();
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



const [orderReportDialogOpen, setOrderReportDialogOpen] = useState(false);
const [selectedRow, setSelectedRow] = useState(null);

const handleEditIconClick = (row) => {
  setSelectedRow(row);
  setOrderReportDialogOpen(true);
};

const handleCloseOrderReportDialog = () => {
  setOrderReportDialogOpen(false);
  setSelectedRow(null);
};



const handleEditConfirm = () => {
  if (selectedRow) {
    const OrderNumber = selectedRow.OrderNumber;
    const formattedReceivable = selectedRow.Receivable.replace(/₹\s*/g, '');
    
    // Dispatch the order data and set `isOrderUpdate` to true
    dispatch(setOrderData({ orderNumber: OrderNumber }));
    dispatch(setOrderData({ receivable: formattedReceivable }));
    dispatch(setIsOrderUpdate(true)); // Assuming you have an action to set `isOrderUpdate`
    
    // Navigate to the Create Order page
    router.push('/Create-Order');
  }

  handleCloseOrderReportDialog();
};




const orderColumns = [
  { field: 'OrderNumber', headerName: 'Order#', width: 80 },
  { field: 'RateWiseOrderNumber', headerName: 'R.Order#', width: 80 },
  { field: 'OrderDate', headerName: 'Order Date', width: 100 },
  { field: 'ClientName', headerName: 'Client Name', width: 170 },
  { 
    field: 'Receivable', 
    headerName: 'Value(₹)', 
    width: 100,
    renderCell: (params) => (
      <div>{params.value}</div>
    )
  },
  { field: 'AdjustedOrderAmount', headerName: 'Adjustment/Discount(₹)', width: 100 },
  { field: 'TotalAmountReceived', headerName: 'Income(₹)', width: 100 },
  { field: 'AmountDifference', headerName: 'Difference(₹)', width: 100 },
  { field: 'PaymentMode', headerName: 'Payment Mode', width: 100},
  { field: 'CombinedRemarks', headerName: 'Finance Remarks', width: 130 },
  { field: 'Remarks', headerName: 'Order Remarks', width: 160},
  { 
    field: 'Card', 
    headerName: 'Rate Name', 
    width: 150,
    renderCell: (params) => (
      <div>{params.value}</div>
    )
  },
  { 
    field: 'AdType', 
    headerName: 'Rate Type', 
    width: 150,
    renderCell: (params) => (
      <div>{params.value}</div>
    )
  },
  { 
    field: 'ConsultantName', 
    headerName: 'Consultant Name', 
    width: 150 
  },

  {
    field: 'actions',
    headerName: 'Actions',
    width: 270,
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
                Cancel 
            </Button>
            <Button
                variant="contained"
                color="primary"
                size="small"
                disabled={params.row.restoreDisabled}
                onClick={() => handleRestore(params.row.RateWiseOrderNumber, params.row.OrderNumber, params.row.Card)}
                style={{ backgroundColor: '#1976d2',
                  color: 'white',
                  fontWeight: 'bold',
                  opacity: params.row.restoreDisabled ? 0.5 : 1,
                  pointerEvents: params.row.restoreDisabled ? 'none' : 'auto' }}
            >
                Restore
            </Button>
            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleEditIconClick(params.row)}
                style={{ marginLeft: '12px',
                  backgroundColor: '#499b25',
                  color: 'white',
                  fontWeight: 'bold',
                 }}  
            >  
               Edit
            </Button>
        </div>
    ),
},
];





const financeColumns = [
  { field: 'TransactionType', headerName: 'Transaction Type', width: 150 },
  { field: 'TransactionDate', headerName: 'Transaction Date', width: 150 },
  { field: 'Amount', headerName: 'Amount(₹)', width: 100},
  { field: 'OrderValue', headerName: 'Order Value(₹)', width: 100},
  { field: 'PaymentMode', headerName: 'Payment Mode', width: 100},
  { field: 'OrderNumber', headerName: 'Order#', width: 100 },
  { field: 'RateWiseOrderNumber', headerName: 'R.Order#', width: 80},
  { field: 'ClientName', headerName: 'Client Name', width: 200 },
  { field: 'Remarks', headerName: 'Remarks', width: 200 },
  { field: 'ConsultantName', headerName: 'Consultant Name', width: 150 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 100,
    renderCell: (params) => (
      <div>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleOpenConfirmDialog(params.row.RateWiseOrderNumber, params.row.OrderNumber)}
          style={{ backgroundColor: '#ff5252', color: 'white', fontWeight: 'bold' }}
        >
          Delete
        </Button>
      </div>
    ),
  },
//   {
//     field: 'actions',
//     headerName: 'Actions',
//     width: 100,
//     renderCell: (params) => (
//         <div>
//             <Button
//                         variant="contained"
//                         color="primary"
//                         size="small"
//                         onClick={() => handleTransactionDelete(params.row.RateWiseOrderNumber, params.row.OrderNumber)}
//                         style={{ backgroundColor: '#ff5252', color: 'white', fontWeight: 'bold' }}
//                     >
//                         Delete
//                     </Button>
//         </div>
//     ),
// },
];

    const handleOpenConfirmDialog = (rateWiseOrderNum, orderNum) => {
      setSelectedTransaction({ rateWiseOrderNum, orderNum });
      setOpenConfirmDialog(true);
    };
    

    const handleConfirmDelete = () => {
      const { rateWiseOrderNum, orderNum } = selectedTransaction;
      handleTransactionDelete(rateWiseOrderNum, orderNum);
      setOpenConfirmDialog(false);
    };
    
    
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
    
    // const pieData = sumOfFinance.length > 0 ? [
    //   { name: 'Online', value: parseFloat(sumOfFinance[0].income_online || 0) },
    //   { name: 'Cash', value: parseFloat(sumOfFinance[0].income_cash || 0) },
    //   { name: 'Expense', value: parseFloat(sumOfFinance[0].expense || 0) },
    // ] : [];

    const incomeData = sumOfFinance.length > 0 ? [
      { name: 'Online', value: parseFloat(sumOfFinance[0].income_online || 0) },
      { name: 'Cash', value: parseFloat(sumOfFinance[0].income_cash || 0) },
      { name: 'Cheque', value: parseFloat(sumOfFinance[0].income_cheque || 0) },
    ] : [];

    
    const rateBaseData = rateBaseIncome.length > 0 ? 
    rateBaseIncome.map((item) => ({
        name: item.Card,
        value: parseFloat(item.total_amount || 0)
    })) : [];

  
    const expenseData = sumOfFinance.length > 0 ? [
      { name: 'Bank', value: parseFloat(sumOfFinance[0].expense_bank || 0) },
      { name: 'Communication', value: parseFloat(sumOfFinance[0].expense_communication || 0) },
      { name: 'Commission', value: parseFloat(sumOfFinance[0].expense_commission || 0) },
      { name: 'Consumables', value: parseFloat(sumOfFinance[0].expense_consumables || 0) },
      { name: 'Conveyance', value: parseFloat(sumOfFinance[0].expense_conveyance || 0) },
      { name: 'EB', value: parseFloat(sumOfFinance[0].expense_eb || 0) },
      { name: 'Maintainance', value: parseFloat(sumOfFinance[0].expense_maintainance || 0) },
      { name: 'Offering', value: parseFloat(sumOfFinance[0].expense_offering || 0) },
      { name: 'PC', value: parseFloat(sumOfFinance[0].expense_pc || 0) },
      { name: 'Promotion', value: parseFloat(sumOfFinance[0].expense_promotion || 0) },
      { name: 'Rent', value: parseFloat(sumOfFinance[0].expense_rent || 0) },
      { name: 'Labor Cost', value: parseFloat(sumOfFinance[0].expense_laborcost || 0) },
      { name: 'Stationary', value: parseFloat(sumOfFinance[0].expense_stationary || 0) },
      { name: 'Refund', value: parseFloat(sumOfFinance[0].expense_refund || 0) },
    ] : [];
    
    const isIncomePieEmpty = !incomeData || incomeData.every(data => data.value === 0);
    const isExpensePieEmpty = !expenseData || expenseData.every(data => data.value === 0);
    
    // const isPieEmpty = !pieData || pieData.length < 2 || (pieData[0]?.value === 0 && pieData[1]?.value === 0);

    const rateBaseColors = [
      '#FFA726', '#66BB6A', '#29B6F6', '#AB47BC', '#FF7043',  // Original Colors
      '#FFCA28',  // Light Yellow Orange
      '#8D6E63',  // Brownish Gray
      '#4FC3F7',  // Light Sky Blue
      '#D4E157',  // Lime Green
      '#BA68C8',  // Soft Purple
      '#FF5722',  // Deep Orange
      '#9575CD',  // Lavender Purple
      '#4DB6AC',  // Aquamarine
      '#F06292',  // Soft Pink
      '#AED581',  // Light Green
      '#FFEB3B',  // Bright Yellow
      '#F44336',  // Red
      '#26A69A',  // Teal
      '#EF5350',  // Soft Red
      '#81C784',  // Mint Green
      '#7E57C2',  // Indigo Purple
      '#FFB74D',  // Soft Orange
    ];
    const incomeColors = ['#00BFAE', '#FF6F00', '#007BFF'];

    const expenseColors = [
      '#FF5722', '#FF9800', '#FFC107', '#F9A825', '#FF6F61', 
      '#4CAF50', '#2196F3', '#9C27B0', '#E91E63', '#3F51B5', 
      '#00BCD4', '#8BC34A', '#CDDC39', '#607D8B'
    ];

 

      // Styles
      const isPhone = useMediaQuery('(max-width:768px)');
const [selectedIncomeView, setSelectedIncomeView] = useState('Income Breakdown');
//const title = selectedIncomeView === 'Income Breakdown' ? 'Income Breakdown' : 'Rate Base Income Breakdown';
const handleIncomeViewChange = (event) => {
  setSelectedIncomeView(event.target.value);
};

const incomeOptions = [
  { label: 'By Payment mode', value: 'Income Breakdown' },
  { label: 'By Rate Card', value: 'Rate Base Income Breakdown' },
];
      const styles = {
        chartContainer: {
          width: '100%',
          height: '440px', // Adjust height as needed
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0px 4px 8px rgba(128, 128, 128, 0.4)', // Gray shadow for 3D effect
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'center', // Center horizontally
          alignItems: 'center', // Center vertically
          flexDirection: 'column', // Column direction for title and chart
        },
        slideContainer: {
          display: 'flex',
          width: '100%',
          height: '440px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          '-webkit-overflow-scrolling': 'touch', // Enable smooth scrolling on iOS
        },
        slide: {
          minWidth: '100%',
          scrollSnapAlign: 'center',
          display: 'flex',
          justifyContent: 'center', // Center the chart horizontally
          alignItems: 'center', // Center the chart vertically
          flexDirection: 'column', // Ensures the title is above the chart
          padding: '10px 0', // Adjust padding to reduce gaps
        },
        title: {
          fontWeight: 'bold',
          textAlign: 'center', // Center align text horizontally
          fontSize: '20px',
          marginBottom: '0px',
        },
        incomeTitle: {
          color: '#4CAF50', // Green color for income
        },
        expenseTitle: {
          color: '#FF5722', // Red color for expense
        },
        totalIncomeText: {
          marginTop: '0px', // Increase margin to add gap between chart and total text
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#4CAF50', // Green color for total income text
        },
        totalExpenseText: {
          marginTop: '0px', // Increase margin to add gap between chart and total text
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#FF5722', // Red color for total expense text
        },
        dropdownContainer: {
          display: 'flex',
          justifyContent: 'space-between', // Ensures the title and dropdown are on the same line
          alignItems: 'center', 
          marginBottom: '1px',
          padding: '0 20px', // Adjust the padding to your preference
          width: '100%',
        },
        dropdown: {
          marginTop: '10px',
          marginLeft: 'auto', // Ensures the dropdown is pushed to the right
          padding: isPhone ? '1px' : '2px',  // Adjust padding for phone
          fontSize: isPhone ? '12px' : '14px',  // Smaller font size on phone
          borderRadius: '5px',
          zIndex: 0,
          width: isPhone ? '45%' : 'auto',  // Full width on phone

        },
      };

      
      

// Function to render the active shape with proper adjustments for negative values
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 13) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const sign = value < 0 ? '-' : '';
  

  // Adjust text position for smaller screens
  const textOffset = 0; 

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
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
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      {/* <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" /> */}
      <text x={ex + (cos >= 0 ? 1 : -1) * textOffset} y={ey} textAnchor={textAnchor} fill={fill}>{`${sign}₹${formatIndianNumber(Math.abs(value))}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * textOffset} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};



const onPieEnter = (_, index) => {
  setActiveIndex(index);
};


const CustomLegend = ({ payload }) => {
  if (!payload || !payload.length) return null;

  return (
    <div style={{ padding: '10px' }}>
      {payload.map((entry, index) => {
        const { value, color, payload: item } = entry;
        const formattedValue = formatIndianNumber(value);

        return (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: color, marginRight: '10px' }}></div>
            <span>{`₹ ${formattedValue} (${item.name})`}</span>
          </div>
        );
      })}
    </div>
  );
};

// Utility function to format numbers with commas in Indian format
const formatIndianNumber = (number) => {
  const parts = number.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';

  // Adding commas to the integer part
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherDigits = integerPart.substring(0, integerPart.length - 3);
  if (otherDigits !== '') {
    integerPart = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  } else {
    integerPart = lastThree;
  }

  return integerPart + decimalPart;
};

const handleDateChange = (range) => {
  setSelectedRange({
    startDate: range.startDate,
    endDate: range.endDate,
  });
  const formattedStartDate = format(range.startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(range.endDate, 'yyyy-MM-dd');
  setStartDate(formattedStartDate);
  setEndDate(formattedEndDate); //
};

 // Utility function to format number as Indian currency (₹)
 const formatIndianCurrency = (number) => {
  if (typeof number === 'number') {
    return number.toLocaleString('en-IN');
  }
  return number;
};


    return (
      
        <Box sx={{ width: '100%'}}>
          
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="primary"
                indicatorColor="primary"
                aria-label="secondary tabs example"
                centered
                variant="fullWidth"
            >
                <Tab label="Order Report" />
                {appRights.includes('Administrator') || appRights.includes('Finance') || appRights.includes('Leadership') ? <Tab label="Finance Report" /> : null}
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
                {appRights.includes('Administrator') || appRights.includes('Finance') || appRights.includes('Leadership')? (
            <Button onClick={handleGoToFinance} color="primary">
                Go to Finance Report
            </Button>
        ) : null}
                    <Button onClick={handleCloseOrderDialog} color="primary" autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

<Dialog
  open={orderReportDialogOpen}
  onClose={handleCloseOrderReportDialog}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  <DialogTitle id="alert-dialog-title">{"DO YOU WANT TO EDIT?"}</DialogTitle>
  <DialogContent>
    <DialogContentText id="alert-dialog-description">
      You have selected the order with Rate Wise Order# <strong>{selectedRow && selectedRow.RateWiseOrderNumber}</strong> and Client Name <strong>{selectedRow && selectedRow.ClientName}</strong>. Do you want to edit this order?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleEditConfirm} color="primary">
      Yes
    </Button>
    <Button onClick={handleCloseOrderReportDialog} color="primary" autoFocus>
      No
    </Button>
  </DialogActions>
</Dialog>

            <Box className="px-3">
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
            <h1 className='md:text-xl lg:text-2xl sm:text-base font-bold my-2 ml-2 text-start text-blue-500'>Reports</h1>
            <div className="flex flex-nowrap overflow-x-auto ">
  {/* Combined Total Orders and Amounts box */}
  <div className="w-fit h-auto rounded-lg shadow-md p-4 mb-5 flex flex-col border border-gray-300 mr-2 flex-shrink-0">
    {/* Sum of Orders */}
    <div className="text-2xl sm:text-3xl lg:text-4xl text-black font-bold">
      {sumOfOrders}
    </div>
    <div className="text-sm sm:text-base lg:text-lg text-gray-600 text-opacity-80">
      Total Orders
    </div>
    
    {/* Amounts Section */}
    <div className="flex mt-4 w-fit">
      {/* Order Amount */}
      <div className="flex-1 text-base sm:text-xl lg:text-xl mr-5 text-black font-bold">
        ₹{totalOrderAmount}
        <div className="text-xs sm:text-sm lg:text-base text-green-600 text-opacity-80 font-normal w-fit text-nowrap">Order Value</div>
      </div>
      {/* Finance Amount */}
      <div className="flex-1 text-base sm:text-xl lg:text-xl text-black font-bold ">
        ₹{totalFinanceAmount}
        <div className="text-xs sm:text-sm lg:text-base text-sky-500  text-opacity-80 font-normal text-nowrap">Income</div>
      </div>
    </div>
  </div>

  {/* Spacer to center the DateRangePicker */}
  <div className="flex flex-grow text-black ml-2 mb-4 flex-shrink-0">
    <DateRangePicker 
      startDate={selectedRange.startDate} 
      endDate={selectedRange.endDate} 
      onDateChange={handleDateChange} 
    />
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
            '& .grey-row': {
              backgroundColor: '#ededed', // Grey highlight for negative RateWiseOrderNumber
            },
          }}
          getRowClassName={(params) => {
            const rateWiseOrderNumber = params.row.RateWiseOrderNumber;
        
            if (rateWiseOrderNumber < 0) {
              return 'grey-row';
            }
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
              <h1 className='text-2xl font-bold ml-2 text-start text-blue-500'>Reports</h1>
             <div className="flex flex-grow text-black mb-4">
    <DateRangePicker startDate={selectedRange.startDate} endDate={selectedRange.endDate} onDateChange={handleDateChange} />
    <div className="flex flex-grow items-end ml-2 mb-4">
      <div className="flex flex-col sm:flex-row">
        <button className="custom-button mb-2 sm:mb-0 sm:mr-2" onClick={handleClickOpen}>
          Show Balance
        </button>
        {(appRights.includes('Administrator') || appRights.includes('Finance') || appRights.includes('Leadership')) && (
        <button className="consultant-button" onClick={handleConsultantReportOpen}>
          Consultant Report
        </button>
      )}


      </div>
    </div>
  </div>
           
           
             {/* Delete Transaction Confirmation */}
             <Dialog
  open={openConfirmDialog}
  onClose={() => setOpenConfirmDialog(false)}
  aria-labelledby="confirm-dialog-title"
  aria-describedby="confirm-dialog-description"
>
  <DialogTitle id="confirm-dialog-title">Confirm Deletion</DialogTitle>
  <DialogContent>
    <DialogContentText id="confirm-dialog-description">
      Are you sure you want to delete this transaction?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
      Cancel
    </Button>
    <Button 
      onClick={handleConfirmDelete} 
      style={{ color: '#ff5252', borderColor: '#ff5252' }}
      autoFocus
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>
{/* Delete Transaction Confirmation */}

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
            
            <div style={styles.chartContainer}>
      <div style={styles.slideContainer}>
        {/* Income Breakdown Chart */}
        <div style={styles.slide}>
          
          <div style={{ ...styles.title, ...styles.incomeTitle }}>Income Breakdown</div>
          <div style={styles.dropdownContainer}>
            <Select
              value={selectedIncomeView}
              onChange={handleIncomeViewChange}
              style={styles.dropdown}
              variant="outlined"
              fullWidth
            >
              {incomeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </div>

          {selectedIncomeView === 'Income Breakdown' ? (
            isIncomePieEmpty ? (
              <div className="text-center">No income records found during this timeline!</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={window.innerWidth > 768 ? 70 : 55}
                    outerRadius={window.innerWidth > 768 ? 100 : 75}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    labelLine={false}
                    stroke="none"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={incomeColors[index % incomeColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={rateBaseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={window.innerWidth > 768 ? 70 : 55}
                  outerRadius={window.innerWidth > 768 ? 100 : 75}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  labelLine={false}
                  stroke="none"
                >
                  {rateBaseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={rateBaseColors[index % rateBaseColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}

          <div style={{ ...styles.totalIncomeText, color: '#4CAF50' }}>
            Total Income: ₹{formatIndianNumber(totalIncome)}
          </div>
        </div>

        {/* Expense Breakdown Chart */}
        <div style={styles.slide}>
          <div style={{ ...styles.title, ...styles.expenseTitle }}>Expense Breakdown</div>
          {isExpensePieEmpty ? (
            <div className="text-center">No expense records found during this timeline!</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={window.innerWidth > 768 ? 70 : 70}
                  outerRadius={window.innerWidth > 768 ? 100 : 90}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  labelLine={false}
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={expenseColors[index % expenseColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ ...styles.totalExpenseText, color: '#FF5722' }}>
            Total Expense: ₹{formatIndianNumber(totalExpense)}
          </div>
        </div>
      </div>
    </div>
            {/* <div>
             <div style={styles.chartContainer}>
             {isPieEmpty ? (
        <div className="text-center">No records found during this timeline!</div>
      ) : (
        <div className=" chartContainer">
<ResponsiveContainer width="100%" height="100%">
  <PieChart width={pieChartWidth} height={pieChartHeight}>
    <Pie
      activeIndex={activeIndex}
      activeShape={renderActiveShape}
      data={pieData}
      cx="50%"
      cy="50%"
      innerRadius={window.innerWidth > 768 ? 60 : 50} // Adjust for mobile
      outerRadius={window.innerWidth > 768 ? 80 : 70} // Adjust for mobile
      fill="#8884d8"
      dataKey="value"
      onMouseEnter={onPieEnter}
      labelLine={false}
      stroke="none"
    >
      {pieData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie> */}
    {/* <Legend 
      layout="vertical" 
      align="right" 
      verticalAlign="middle" 
      wrapperStyle={{ paddingLeft: "20px" }} 
    /> */}
  {/* </PieChart>
</ResponsiveContainer>
</div>
      )} */}
      {/* </div>
      </div> */}
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