'use client';
import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { DataGrid, useGridApiRef} from '@mui/x-data-grid';
import axios from 'axios';
import { useAppSelector } from '@/redux/store';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Button from '@mui/material/Button';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import DateRangePicker from './CustomDateRangePicker';
import { startOfMonth, endOfMonth, format, parseISO  } from 'date-fns';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from '@mui/material';
import './styles.css';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import { setOrderData , setIsOrderUpdate} from '@/redux/features/order-slice';
import { useDispatch } from 'react-redux';
import { Select } from '@mui/material';
import { setDateRange, resetDateRange } from "@/redux/features/report-slice";
import { Margin } from '@mui/icons-material';


const Report = () => {
    const dbName = useAppSelector(state => state.authSlice.dbName);
    // const companyName = "Baleen Test";
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const username = useAppSelector(state => state.authSlice.userName);
    const appRights = useAppSelector(state => state.authSlice.appRights);
    const [value, setValue] = useState(0);
    const [orderDetails, setOrderDetails] = useState([]);
    const [financeDetails, setFinanceDetails] = useState([]);
    const [sumOfFinance, setSumOfFinance] = useState([]);
    const [rateBaseIncome, setRateBaseIncome] = useState([]);
    const [elementsToHide, setElementsToHide] = useState([])
    const [filter, setFilter] = useState('All');
    // const [orderFilterModel, setOrderFilterModel] = useState({ items: [] });
    // const [financeFilterModel, setFinanceFilterModel] = useState({ items: [] });
    const [activeIndex, setActiveIndex] = useState(0);
    const [sumOfOrders, setSumOfOrders] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
     const [successMessage, setSuccessMessage] = useState('');
     const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');

  // const currentStartDate = startOfMonth(new Date());
  // const currentEndDate = endOfMonth(new Date());
  // const [selectedRange, setSelectedRange] = useState({
  //   startDate: currentStartDate,
  //   endDate: currentEndDate,
  // });
  // const [startDate, setStartDate] = useState(format(currentStartDate, 'yyyy-MM-dd'));
  // const [endDate, setEndDate] = useState(format(currentEndDate, 'yyyy-MM-dd'));
  const { dateRange } = useAppSelector(state => state.reportSlice);
   const startDateForDisplay = new Date(dateRange.startDate);
   const endDateForDisplay = new Date(dateRange.endDate);
   const [selectedRange, setSelectedRange] = useState({
    startDate: startDateForDisplay,
    endDate: endDateForDisplay,  
  });

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
  const [consultantDiagnosticsReportData, setConsultantDiagnosticsReportData] = useState([]);
  const [openCDR, setOpenCDR] = useState(false);
  const [consultantNameCDR, setConsultantNameCDR] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  // const [displayOrderDetails, setDisplayOrderDetails] = useState([]);
  // const [displayFinanceDetails, setDisplayFinanceDetails] = useState([]);

const checkIfSMSSentToday = () => {
  axios
    .get(`https://orders.baleenmedia.com/API/Media/CheckCDRSmsCount.php?JsonDBName=${companyName}`)
    .then((response) => {
      const { count } = response.data;
      
      if (count > 0) {
        setIsButtonDisabled(true);
      } else {
        setIsButtonDisabled(false);
      }
    })
    .catch((error) => {
      console.error('Error checking SMS count:', error);
    });
};



// Call this function when the component is loaded
useEffect(() => {
  checkIfSMSSentToday();
}, []);

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

    useEffect(()=>{
      if (!username || dbName === "") {
        router.push('/login');
      }
      // fetchCurrentDateConsultants();
      if(dbName){
        elementsToHideList()
      }
    },[])
    
    useEffect(() => {
        fetchMarginAmount();
        fetchOrderDetails();
        fetchFinanceDetails();
        fetchSumOfFinance();
        fetchRateBaseIncome();
        fetchSumOfOrders();
        FetchCurrentBalanceAmount();
        fetchAmounts();
    }, [dateRange.startDate, dateRange.endDate]);


    useEffect(() => {
      FetchCurrentBalanceAmount();
  }, [marginResult]);

  useEffect(() => {
    //searching elements to Hide from database

    elementsToHide.forEach((name) => {
      const elements = document.getElementsByName(name);
      elements.forEach((element) => {
        element.style.display = 'none'; // Hide the element
      });
    });
  }, [elementsToHide])

  const elementsToHideList = () => {
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${dbName}`)
        .then((response) => response.json())
        .then((data) => setElementsToHide(data));
    } catch(error){
      console.error("Error showing element names: " + error)
    }
  }


  // const handleOpenCDR = () => {
  //   setOpenCDR(true);
  // };
  
  // const handleCloseCDR = () => {
  //   setOpenCDR(false);
  // };

//   const fetchCurrentDateConsultants = () => {
//     axios
//         .get(`https://orders.baleenmedia.com/API/Media/FetchCurrentDateConsultants.php?JsonDBName=${companyName}`)
//         .then((response) => {
//           const data = response.data.data;
//           const consultantNames = data.map(item => item.consultantName); 
//           setConsultantNameCDR(consultantNames); 

//           // Group the results by consultant name
//           const consultantData = data.reduce((acc, item) => {
//               const { consultantName, consultantNumber, Card, card_count } = item;

//               if (!acc[consultantName]) {
                
//                   acc[consultantName] = {
//                       consultantName: consultantName,
//                       consultantNumber: consultantNumber,
//                       totalCount: 0,
//                       cards: {}
//                   };
//               }

//               // Update total count and individual card counts
//               acc[consultantName].totalCount += parseInt(card_count);
//               acc[consultantName].cards[Card] = (acc[consultantName].cards[Card] || 0) + parseInt(card_count);
              

//               return acc;
//           }, {});
          
//           setConsultantDiagnosticsReportData(consultantData);
//       })
//       .catch((error) => {
//           console.error(error);
//       });
// };

// const handleConsultantSMS = () => {
// // Generate SMS messages for each consultant and send SMS
//           Object.values(consultantDiagnosticsReportData).forEach((consultant) => {
//               const { consultantName, consultantNumber, totalCount, cards } = consultant;

//               const usgCount = cards['USG Scan'] || 0;
//               const ctCount = cards['CT Scan'] || 0;
//               const xrayCount = cards['X-Ray'] || 0;

//               // Create the message for the consultant
//               // const message = `Hello Dr. ${consultantName}, \n${totalCount} of your Patients utilized our Diagnostic Services today. \n${usgCount} - USG + ${ctCount} - CT + ${xrayCount} - X-Ray.\nIt was our pleasure to serve your Patients.\n- Grace Scans`;
//               const message = `Hello ${consultantName}, 
// ${totalCount} of your Patients utilized our Diagnostic Services Today. 
// USG - ${usgCount} 
// CT - ${ctCount} 
// X-Ray - ${xrayCount} 
// It was our pleasure to serve your Patients. 
// - Grace Scans`;
              
//               // Call the function to send SMS
//               SendSMSViaNetty(consultantName, consultantNumber, message);
//           });
// };


// const SendSMSViaNetty = (consultantName, consultantNumber, message) => {

//   // Ensure consultantNumber is valid
//   if (!consultantName || consultantName === '' || consultantNumber === '0' || consultantNumber === '' || !/^\d+$/.test(consultantNumber)) {
//       setToastMessage('SMS Not Sent! Reason: Phone Number is Unavailable');
//             setSeverity('warning');
//             setToast(true);
//             setTimeout(() => {
//               setToast(false);
//             }, 2000);
//       return; // Prevent the function from continuing if consultantNumber is invalid
//   }

//   const sendableNumber = `91${consultantNumber}`;
//   const encodedMessage = encodeURIComponent(message);
  

//   axios
//     .get(`https://orders.baleenmedia.com/API/Media/SendSmsNetty.php?JsonNumber=${sendableNumber}&JsonMessage=${encodedMessage}&JsonConsultantName=${consultantName}&JsonConsultantNumber=${consultantNumber}&JsonDBName=${companyName}`)
//     .then((response) => {

//       const result = response.data;
//       // if (result.includes('Done')) {
//       if (result === 'SMS Sent and Database Updated Successfully') {
//         // Success Case
//         handleCloseCDR();
//         checkIfSMSSentToday();
//         setSuccessMessage('SMS Sent!');
//         setTimeout(() => {
//           setSuccessMessage('');
//         }, 1500);
//       } else {
//         // Error Case
//         setToastMessage(`SMS Not Sent! Reason: ${result}`);
//         setSeverity('warning');
//         setToast(true);
//         setTimeout(() => {
//           setToast(false);
//         }, 2000);
//       }
//   })

//     .catch((error) => {
//       console.error(error);
//     });
  
// };


    const fetchSumOfOrders = () => {
      axios
          .get(`https://orders.baleenmedia.com/API/Media/FetchSumOfOrders.php?JsonDBName=${companyName}&JsonStartDate=${dateRange.startDate}&JsonEndDate=${dateRange.endDate}`)
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
            .get(`https://orders.baleenmedia.com/API/Media/OrdersList.php?JsonDBName=${companyName}&JsonStartDate=${dateRange.startDate}&JsonEndDate=${dateRange.endDate}`)
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
                    Margin: `₹ ${order.Margin}`,
                    editDisabled: order.RateWiseOrderNumber < 0,
                }));
                setOrderDetails(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };
    const fetchFinanceDetails = () => {
        axios
            .get(`https://orders.baleenmedia.com/API/Media/FinanceList.php?JsonDBName=${companyName}&JsonStartDate=${dateRange.startDate}&JsonEndDate=${dateRange.endDate}`)
            .then((response) => {
                const financeDetails = response.data.map((transaction, index) => ({
                    ...transaction,
                    id: transaction.ID, // Generate a unique identifier based on the index
                    Amount: `₹ ${transaction.Amount}`,
                    OrderValue: `₹ ${transaction.OrderValue}`,
                    markInvalidFinanceDisabled: transaction.ValidStatus === 'Invalid'
                }));
                //console.log(response.data)  
                //const displayData = response.data
                setFinanceDetails(financeDetails);
                
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchSumOfFinance = () => {
        axios
            .get(`https://orders.baleenmedia.com/API/Media/FetchSumOfFinance.php?JsonDBName=${companyName}&JsonStartDate=${dateRange.startDate}&JsonEndDate=${dateRange.endDate}`)
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
          .get(`https://orders.baleenmedia.com/API/Media/FetchRateBaseIncome.php?JsonDBName=${companyName}&JsonStartDate=${dateRange.startDate}&JsonEndDate=${dateRange.endDate}`)
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
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchTotalOrderAndFinanceAmount.php?JsonDBName=${companyName}&JsonStartDate=${dateRange.startDate}&JsonEndDate=${dateRange.endDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
    
        // Ensure the fetched data is formatted correctly
        const TotalOrderAmt = data.order_amount !== null ? data.order_amount : '0';
        const TotalFinanceAmt = data.finance_amount !== null ? data.finance_amount : '0';
    
        // Update state with formatted values
        // setTotalOrderAmount(TotalOrderAmt);
        // setTotalFinanceAmount(TotalFinanceAmt);
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

const handleTransactionDelete = (id, RateWiseOrderNumber) => {
  axios
      .get(`https://orders.baleenmedia.com/API/Media/DeleteTransactionTest.php?JsonID=${id}&JsonRateWiseOrderNumber=${RateWiseOrderNumber}&sonDBName=${companyName}`)
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

// const handleFinanceRestore = (rateWiseOrderNum, orderNum, clientName) => {
//   axios
//     .get(`https://orders.baleenmedia.com/API/Media/RestoreFinance.php?JsonRateWiseOrderNumber=${rateWiseOrderNum}&OrderNumber=${orderNum}&JsonDBName=${companyName}`)
//     .then((response) => {
//       const data = response.data;
//       if (data.success) {
//         setSuccessMessage('Transaction Restored!');
//         setTimeout(() => {
//           setSuccessMessage('');
//         }, 2000);
//         fetchFinanceDetails();
//         fetchAmounts();
//         fetchSumOfFinance();
//         fetchRateBaseIncome();
//       } else {
//         setToastMessage(data.message);
//         setSeverity('error');
//         setToast(true);
//         setTimeout(() => {
//           setToast(false);
//         }, 2000);
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//       setToastMessage('Failed to restore transaction. Please try again.');
//       setSeverity('error');
//       setToast(true);
//       setTimeout(() => {
//         setToast(false);
//       }, 2000);
//     });
// };
const handleFinanceRestore = (id, RateWiseOrderNumber) => {
// const handleFinanceRestore = (rateWiseOrderNum, orderNum, clientName) => {
//   axios
//     .get(`https://orders.baleenmedia.com/API/Media/RestoreFinance.php?JsonRateWiseOrderNumber=${rateWiseOrderNum}&OrderNumber=${orderNum}&JsonDBName=${companyName}`)
//     .then((response) => {
//       const data = response.data;
//       if (data.success) {
//         setSuccessMessage('Transaction Restored!');
//         setTimeout(() => {
//           setSuccessMessage('');
//         }, 2000);
//         fetchFinanceDetails();
//         fetchAmounts();
//         fetchSumOfFinance();
//         fetchRateBaseIncome();
//       } else {
//         setToastMessage(data.message);
//         setSeverity('error');
//         setToast(true);
//         setTimeout(() => {
//           setToast(false);
//         }, 2000);
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//       setToastMessage('Failed to restore transaction. Please try again.');
//       setSeverity('error');
//       setToast(true);
//       setTimeout(() => {
//         setToast(false);
//       }, 2000);
//     });
// };
const handleFinanceRestore = (id, RateWiseOrderNumber) => {
  axios
    .get(`https://orders.baleenmedia.com/API/Media/RestoreFinanceTest.php?JsonID=${id}&JsonRateWiseOrderNumber=${RateWiseOrderNumber}&JsonDBName=${companyName}`)
    .then((response) => {
      const data = response.data;
      if (data.success) {
        setSuccessMessage('Transaction Restored!');
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
      setToastMessage('Failed to restore transaction. Please try again.');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    });
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
        .get(`https://orders.baleenmedia.com/API/Media/FetchMarginAmount.php?JsonDBName=${companyName}&JsonStartDate=${dateRange.startDate}&JsonEndDate=${dateRange.endDate}`)
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

// const isMobile = useMediaQuery('(max-width:640px)');
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


const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

const orderColumns = [
  { field: 'OrderNumber', headerName: 'Order#', width: isMobile ? 120 : 100 },
    { field: 'RateWiseOrderNumber', headerName: 'R.Order#', width: isMobile ? 130 : 80 },
    { field: 'OrderDate', headerName: 'Order Date', width: isMobile ? 150 : 100 },
    { field: 'ClientName', headerName: 'Client Name', width: isMobile ? 150 : 120 },
    { field: 'ClientContact', headerName: 'Client Contact', width: isMobile ? 160 : 120 },
    { field: 'Margin', headerName: 'Margin', width: isMobile ? 120 : 90, hide: elementsToHide.includes('RatesMarginPercentText') },
    { field: 'Receivable', headerName: 'Order Value(₹)', width: isMobile ? 170 : 120, renderCell: (params) => <div>{params.value}</div> },
    { field: 'AdjustedOrderAmount', headerName: 'Adjustment/Discount(₹)', width: isMobile ? 230 : 170 },
    { field: 'TotalAmountReceived', headerName: 'Income(₹)', width: isMobile ? 140 : 100 },
    { field: 'AmountDifference', headerName: 'Difference(₹)', width: isMobile ? 160 : 100 },
    { field: 'PaymentMode', headerName: 'Payment Mode', width: isMobile ? 170 : 120 },
    { field: 'CombinedRemarks', headerName: 'Finance Remarks', width: isMobile ? 190 : 130 },
    { field: 'Remarks', headerName: 'Order Remarks', width: isMobile ? 180 : 160 },
    { field: 'Card', headerName: 'Rate Name', width: isMobile ? 140 : 150, renderCell: (params) => <div>{params.value}</div> },
    { field: 'AdType', headerName: 'Rate Type', width: isMobile ? 140 : 150, renderCell: (params) => <div>{params.value}</div> },
    { field: 'ConsultantName', headerName: 'Consultant Name', width: isMobile ? 180 : 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: isMobile ? 290 : 270,
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
                disabled={params.row.editDisabled}
                style={{ marginLeft: '12px',
                  backgroundColor: '#499b25',
                  color: 'white',
                  fontWeight: 'bold',
                  opacity: params.row.editDisabled ? 0.5 : 1,
                  pointerEvents: params.row.editDisabled ? 'none' : 'auto'
                 }}  
            >  
               Edit
            </Button>
        </div>
    ),
},
];





const financeColumns = [
  { field: 'ID', headerName: 'Finance ID', width: isMobile ? 140 : 130 },
  { field: 'TransactionType', headerName: 'Transaction Type', width: isMobile ? 180 : 150 },
  { field: 'TransactionDate', headerName: 'Transaction Date', width: isMobile ? 180 : 150 },
  { field: 'Amount', headerName: 'Amount(₹)', width: isMobile ? 140 : 100 },
  { field: 'OrderValue', headerName: 'Order Value(₹)', width: isMobile ? 180 : 100 },
  { field: 'PaymentMode', headerName: 'Payment Mode', width: isMobile ? 170 : 100 },
  { field: 'OrderNumber', headerName: 'Order#', width: isMobile ? 120 : 100 },
  { field: 'RateWiseOrderNumber', headerName: 'R.Order#', width: isMobile ? 130 : 80 },
  { field: 'ClientName', headerName: 'Client Name', width: isMobile ? 150 : 130 },
  { field: 'Remarks', headerName: 'Remarks', width: isMobile ? 130 : 120 },
  { field: 'ConsultantName', headerName: 'Consultant Name', width: isMobile ? 180 : 150 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: isMobile ? 210 : 220,
    renderCell: (params) => (
      <div>
        <button
          className='delete-button py-1 px-2 rounded-md text-sm sm:text-xs mr-3'
          disabled={params.row.markInvalidFinanceDisabled }
          onClick={() => handleOpenConfirmDialog(params.row.ID, params.row.RateWiseOrderNumber)}
          style={{  backgroundColor: '#fa594d',
            color: 'white',
            fontWeight: 'bold', 
            opacity: params.row.markInvalidFinanceDisabled ? 0.2 : 1,
            pointerEvents: params.row.markInvalidFinanceDisabled ? 'none' : 'auto'
           }}
        >
          Delete
        </Button> 
        {/* <button
          className='delete-button py-1 px-2 rounded-md text-sm sm:text-xs mr-3'
          onClick={(e) => e.preventDefault()} // Prevent any action on click
          style={{ backgroundColor: '#fa594d', color: 'white', fontWeight: 'bold', cursor: 'not-allowed', opacity: 0.6 }}
          disabled // This makes the button disabled
        >
          Delete
        </button> */}
        <Button
                variant="contained"
                color="primary"
                size="small"
                disabled={!params.row.markInvalidFinanceDisabled}
                onClick={() => handleFinanceRestore(params.row.ID, params.row.RateWiseOrderNumber)}
                style={{ backgroundColor: '#1976d2',
                  marginLeft: '12px',
                  color: 'white',
                  fontWeight: 'bold',
                  opacity: !params.row.markInvalidFinanceDisabled ? 0.5 : 1,
                  pointerEvents: !params.row.markInvalidFinanceDisabled ? 'none' : 'auto' }}
            >
                Restore
            </Button>
        {/* <button
          className="Restore-button py-1 px-2 rounded-md text-sm sm:text-xs "
          disabled={params.row.restoreFinanceDisabled} // Conditional disabling
          onClick={() => handleFinanceRestore(params.row.ID, params.row.RateWiseOrderNumber)}
          style={{ backgroundColor: '#1976d2',
            color: 'white',
            fontWeight: 'bold',
            opacity: params.row.restoreFinanceDisabled ? 0.5 : 1,
            pointerEvents: params.row.restoreFinanceDisabled ? 'none' : 'auto' }}
        >
          Restore
        </button> */}
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
];  

    const handleOpenConfirmDialog = (ID, RateWiseOrderNumber) => {
      setSelectedTransaction({ ID, RateWiseOrderNumber});
      setOpenConfirmDialog(true);
    };
    

    const handleConfirmDelete = () => {
      const { ID, RateWiseOrderNumber } = selectedTransaction;
      //console.log(selectedTransaction)
      handleTransactionDelete(ID, RateWiseOrderNumber);
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
  dispatch(setDateRange({
    startDate: range.startDate,
    endDate: range.endDate,
  }));
};

 const formatIndianCurrency = (number) => {
  if (typeof number === 'number') {
    return number.toLocaleString('en-IN');
  }
  return number;
};

const [filterModel, setFilterModel] = useState({ items: [] }); 
const [filteredData, setFilteredData] = useState([]);
const [rateStats, setRateStats] = useState({});


   // Function to filter the order data based on the filter model
 const applyFilters = () => {
    let filteredRows = orderDetails;

    filterModel.items.forEach(filter => {
      const { field, value } = filter;
      // Check if value is defined and not null before proceeding
      if (value !== undefined && value !== null) {
        filteredRows = filteredRows.filter(row => {
          const cellValue = String(row[field]).toLowerCase(); // Get the cell value and convert to lowercase
          return cellValue.includes(value.toLowerCase()); // Apply the filter condition
        });
      }
    });

      // Update the filtered data in the grid (without RateWiseOrderNumber condition)
      setFilteredData(filteredRows);

      const rowsForSummary = filteredRows.filter(row => row.RateWiseOrderNumber > 0);
      const sumOfOrders = rowsForSummary.length;
      const totalOrderAmount = rowsForSummary.reduce((sum, row) => {
        const receivableAmount = parseFloat(row.Receivable.replace(/[₹,]/g, '').trim()) || 0;
      
        const AdjustedOrderAmount = parseFloat(row.AdjustedOrderAmount.replace(/[₹,]/g, '').trim()) || 0;
        const adjustedAmount = AdjustedOrderAmount >= 0 
          ? receivableAmount + AdjustedOrderAmount   // Add if AdjustedOrderAmount is positive
          : receivableAmount - Math.abs(AdjustedOrderAmount); // Subtract if AdjustedOrderAmount is negative
        return sum + adjustedAmount;
      }, 0);
      const roundedTotalOrderAmount = Math.round(totalOrderAmount);
      
       // Sum of order values
      const totalFinanceAmount = rowsForSummary.reduce((sum, row) => 
        sum + (parseFloat(row.TotalAmountReceived.replace(/[₹,]/g, '').trim()) || 0), 
      0); // Sum of finance amounts
      const roundedTotalFinanceAmount = Math.round(totalFinanceAmount);
      
      // Update state for summary info
      setSumOfOrders(sumOfOrders);
      setTotalOrderAmount(roundedTotalOrderAmount);
      setTotalFinanceAmount(roundedTotalFinanceAmount);
  };

  // Function to calculate the statistics based on filtered rows
  const calculateRateStats = () => {
    const stats = {};
  
    // Filter out rows where RateWiseOrderNumber <= 0
    const filteredRows = filteredData.filter(order => order.RateWiseOrderNumber > 0);
  
    // Iterate over the filtered rows to calculate the stats
    filteredRows.forEach(order => {
      const rateName = order.Card; 
      const orderValue = Math.round(Number(order.Receivable.replace(/[₹,]/g, '').trim()) || 0);
      const adjustedOrderAmount = Number(order.AdjustedOrderAmount.replace(/[₹,]/g, '').trim()) || 0;

      // Adjust the order value based on AdjustedOrderAmount
      const finalOrderValue = adjustedOrderAmount >= 0 
        ? orderValue + adjustedOrderAmount 
        : orderValue - Math.abs(adjustedOrderAmount);
      const income = Math.round(Number(order.TotalAmountReceived.replace('₹', '').trim()) || 0); // Ensure it's a number
  
      if (stats[rateName]) {
        stats[rateName].orderCount += 1;
        stats[rateName].totalOrderValue += finalOrderValue;
        stats[rateName].totalIncome += income;
      } else {
        stats[rateName] = {
          orderCount: 1,
          totalOrderValue: finalOrderValue,
          totalIncome: income,
        };
      }
    });
  
    setRateStats(stats); // Update state with new stats
  };
  



  useEffect(() => {
    const filteredRows = orderDetails.filter((row) => {
      return filterModel.items.every((filter) => {
        const field = filter.field;
        const value = filter.value ? filter.value.toLowerCase() : '';
  
        if (value === '') return true; // Skip if the filter value is empty
  
        const cellValue = String(row[field]).toLowerCase(); // Case-insensitive comparison
        return cellValue.includes(value);
      });
    });
  
    setFilteredData(filteredRows);
  }, [filterModel, orderDetails]);  // Recalculate rows whenever filterModel or orderDetails change
  

  useEffect(() => {
    applyFilters(); 
  }, [filterModel, orderDetails]); // Reapply filters on change

  useEffect(() => {
    calculateRateStats();
  }, [filteredData]); // Recalculate when filteredData changes

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
                {appRights.includes('Administrator') || appRights.includes('Admin') || appRights.includes('Finance') || appRights.includes('Leadership') ? <Tab label="Finance Report" /> : null}
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
                {appRights.includes('Administrator')  || appRights.includes('Admin') || appRights.includes('Finance') || appRights.includes('Leadership')? (
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

{/* CDR confirmation */}
{/* <Dialog open={openCDR} onClose={handleCloseCDR}>
        <DialogTitle>SMS Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/* Show the names of all consultants */}
            {/* <>
            <strong>The SMS will be sent to the following consultant(s):</strong>
            <ul className="mt-2 ml-4 list-disc ">
              {consultantNameCDR.map((consultant, index) => (
                <li key={index}>{consultant}</li>
              ))}
            </ul>
            <strong>Do you want to continue?</strong>
            </>
          </DialogContentText> */}
        {/* </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCDR} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConsultantSMS} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog> */}


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
  <h1 className="md:text-xl lg:text-2xl sm:text-base font-bold my-2 ml-2 text-start text-blue-500">
    Reports
  </h1>

{/* Sticky Container */}
<div className="sticky top-0 z-10 bg-white p-2 shadow-md">
  <div className="flex flex-nowrap overflow-x-auto">
    {/* DateRangePicker and Spacer */}
    <div className="w-fit h-auto rounded-lg shadow-md p-4 mb-5 flex flex-col border border-gray-300 mr-2 flex-shrink-0 text-black">
      <DateRangePicker
        startDate={selectedRange.startDate}
        endDate={selectedRange.endDate}
        onDateChange={handleDateChange}
      />
    </div>

    {/* Combined Total Orders and Amounts box */}
    <div className="w-fit h-auto rounded-lg shadow-md p-4 mb-5 flex flex-col border border-gray-300 mr-2 flex-shrink-0">
      <div className="text-2xl sm:text-3xl lg:text-4xl text-black font-bold">
        {formatIndianNumber(sumOfOrders)}
      </div>
      <div className="text-sm sm:text-base lg:text-lg text-gray-600 text-opacity-80">
        Total Orders
      </div>

      <div className="flex mt-4 w-fit">
        <div className="flex-1 text-base sm:text-xl lg:text-xl mr-5 text-black font-bold">
          ₹{formatIndianNumber(totalOrderAmount)}
          <div className="text-xs sm:text-sm lg:text-base text-green-600 text-opacity-80 font-normal w-fit text-nowrap">
            Order Value
          </div>
        </div>
        <div className="flex-1 text-base sm:text-xl lg:text-xl text-black font-bold">
          ₹{formatIndianNumber(totalFinanceAmount)}
          <div className="text-xs sm:text-sm lg:text-base text-sky-500 text-opacity-80 font-normal text-nowrap">
            Income
          </div>
        </div>
      </div>
    </div>

    {/* New Rate-wise Stats Box */}
    {Object.keys(rateStats).map((rateName) => (
      <div
        key={rateName}
        className="w-fit h-auto rounded-lg shadow-md p-4 mb-5 flex flex-col border border-gray-300 mr-2 flex-shrink-0"
      >
        <div className="text-2xl sm:text-3xl lg:text-4xl text-black font-bold">
          {formatIndianNumber(rateStats[rateName].orderCount)}
        </div>
        <div className="text-sm sm:text-base lg:text-lg text-gray-600 text-opacity-80">
          {rateName} Orders
        </div>

        <div className="flex mt-4 w-fit">
          <div className="flex-1 text-base sm:text-xl lg:text-xl mr-5 text-black font-bold">
            ₹{formatIndianNumber(Number(rateStats[rateName].totalOrderValue))}
            <div className="text-xs sm:text-sm lg:text-base text-green-600 text-opacity-80 font-normal w-fit text-nowrap">
              Order Value
            </div>
          </div>
          <div className="flex-1 text-base sm:text-xl lg:text-xl text-black font-bold">
            ₹{formatIndianNumber(Number(rateStats[rateName].totalIncome))}
            <div className="text-xs sm:text-sm lg:text-base text-sky-500 text-opacity-80 font-normal text-nowrap">
              Income
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>


  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '54px' }}>
    <div style={{ flex: 1, width: '100%', boxShadow: '0px 4px 8px rgba(128, 128, 128, 0.4)' }}>
      <DataGrid
         rows={filteredData.length > 0 ? filteredData : orderDetails}
        columns={orderColumns}
        columnVisibilityModel={{ Margin: !elementsToHide.includes('QuoteSenderNavigation') }}
        pageSize={10}
        onFilterModelChange={(newFilterModel) => {
          // Merge new filters with existing filters
          setFilterModel((prevModel) => {
            const existingItems = prevModel.items;
        
            // Update or add new filter
            const updatedItems = newFilterModel.items.reduce((acc, newFilter) => {
              const existingFilterIndex = acc.findIndex((filter) => filter.field === newFilter.field);
        
              if (existingFilterIndex !== -1) {
                // If the filter already exists, update it or remove it if the value is empty
                if (newFilter.value === '') {
                  acc.splice(existingFilterIndex, 1); // Remove filter only if the input is explicitly cleared
                } else {
                  acc[existingFilterIndex] = { ...acc[existingFilterIndex], ...newFilter }; // Update existing filter with new value
                }
              } else if (newFilter.value && newFilter.value !== '') {
                acc.push({ ...newFilter }); // Add new filter if it's not empty
              }
        
              return acc;
            }, [...existingItems]); // Ensure we work on a copy of the existing items
        
            return { items: updatedItems };
          });
        }}
        
        
        
         // Update the filter model state
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
</div>

)}

        {value === 1 && (
             <div style={{ width: '100%' }}>
              <h1 className='text-2xl font-bold ml-2 text-start text-blue-500'>Reports</h1>
             <div className="flex flex-grow text-black mb-4">
    <DateRangePicker startDate={selectedRange.startDate} endDate={selectedRange.endDate} onDateChange={handleDateChange} />
    
    
    <div className="flex flex-grow items-end ml-2 mb-4">
  <div className="flex flex-col md:flex-row sm:flex-col sm:items-start md:items-end">
    <button className="custom-button mb-2 md:mb-0 sm:mr-0 md:mr-2" onClick={handleClickOpen}>
      Show Balance
    </button>
    {(appRights.includes('Administrator') || appRights.includes('Finance') || appRights.includes('Leadership') || appRights.includes('Admin')) && (
      <button className="consultant-button mb-2 md:mb-0 sm:mr-0 md:mr-2" onClick={handleConsultantReportOpen}>
        Cons. Report
      </button>
    )}
    {/* <button className="consultant-sms-button" onClick={handleOpenCDR} disabled={isButtonDisabled}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
      Send CDR
    </button> */}
  </div>
</div>

    {/* <div className="flex flex-grow items-end ml-2 mb-4">
      <div className="flex flex-col sm:flex-row">
        <button className="custom-button mb-2 sm:mb-0 sm:mr-2" onClick={handleClickOpen}>
          Show Balance
        </button>
        {(appRights.includes('Administrator') || appRights.includes('Finance') || appRights.includes('Leadership') || appRights.includes('Admin')) && (
        <button className="consultant-button" onClick={handleConsultantReportOpen}>
          Consultant Report
        </button>
      )}


      </div> */}
    {/* </div> */}
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
                    <p className="text-xs  mt-1">({format(dateRange.startDate, 'dd-MMM-yy')} - {format(dateRange.endDate, 'dd-MMM-yy')})</p>
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
                        sortModel: [{ field: 'ID', sort: 'desc' }],
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
                        backgroundColor: '#e3f2fd', // Light blue on hover
                      },
                      '& .highlighted-row': {
                        backgroundColor: '#fff385', // Yellow highlight
                        backgroundColor: '#fff385', // Yellow highlight
                      },
                      '& .grey-row': {
                        backgroundColor: '#ededed', // Grey highlight for invalid rows
                      },
                    }}
                    getRowClassName={(params) => {
                      // Check if the row has 'markInvalidFinanceDisabled' set to true (i.e., ValidStatus is 'Invalid')
                      const isInvalid = params.row.markInvalidFinanceDisabled;
                    
                      // If markInvalidFinanceDisabled is true, return 'grey-row' to apply grey background, else return 'highlighted-row' for selected order
                      if (isInvalid) {
                        return 'grey-row';
                      }
                    
                      // Highlight row if it matches the selected order
                      return params.row.OrderNumber === selectedOrder ? 'highlighted-row' : '';
                    }}
                    
                      '& .grey-row': {
                        backgroundColor: '#ededed', // Grey highlight for invalid rows
                      },
                    }}
                    getRowClassName={(params) => {
                      // Check if the row has 'markInvalidFinanceDisabled' set to true (i.e., ValidStatus is 'Invalid')
                      const isInvalid = params.row.markInvalidFinanceDisabled;
                    
                      // If markInvalidFinanceDisabled is true, return 'grey-row' to apply grey background, else return 'highlighted-row' for selected order
                      if (isInvalid) {
                        return 'grey-row';
                      }
                    
                      // Highlight row if it matches the selected order
                      return params.row.OrderNumber === selectedOrder ? 'highlighted-row' : '';
                    }}
                    
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
  {toast && <ToastMessage message={toastMessage} type="warning"/>}
    </Box>
    
    );
}

export default Report;