'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { resetClientData, setClientData } from '@/redux/features/client-slice';
import { useAppSelector } from '@/redux/store';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import ToastMessage from './components/ToastMessage';
import SuccessToast from './components/SuccessToast';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
    
const ClientsData = () => {
  const loggedInUser = useAppSelector(state => state.authSlice.userName);
  //const companyName = "Grace Scans"
  const companyName = useAppSelector(state => state.authSlice.companyName);
  // const loggedInUser = 'GraceScans'
  const clientDetails = useAppSelector(state => state.clientSlice)
  const {clientName, clientContact, clientEmail, clientSource} = clientDetails;
  const [title, setTitle] = useState('Mr.');
  const [clientContactPerson, setClientContactPerson] = useState("")
  const bmsources = ['1.JustDial', '2.IndiaMart', '3.Sulekha','4.LG','5.Consultant','6.Own','7.WebApp DB', '8.Online','9.Self', '10.Friends/Relatives'];
  const gssources = ['Self', 'Consultant', 'Online', 'Friends/Relatives', 'Others'];
  const [toast, setToast] = useState(false);
  const [clientAge, setClientAge] = useState('');
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);
  const [consultantNameSuggestions, setConsultantNameSuggestions] = useState([]);
  const [address, setAddress] = useState('');
  const [DOB, setDOB] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [consultantNumber, setConsultantNumber] = useState('');
  const [displayWarning, setDisplayWarning] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Mrs.");
  const [displayDOBWarning, setDisplayDOBWarning] = useState(false);
  const [clientGST, setClientGST] = useState("");
  const [clientPAN, setClientPAN] = useState("");
  const [months, setMonths] = useState('');
  const [days, setDays] = useState('');
  const [elementsToHide, setElementsToHide] = useState([])
  const [isEmpty, setIsEmpty] = useState(true);
  const [error, setError] = useState('');
  const [isNewClient, setIsNewClient] = useState(true);
  const sources = companyName === 'Grace Scans' ? gssources : bmsources;
  const [contactWarning, setContactWarning] = useState('');
  const [consulantWarning, setConsulantWarning] = useState('');
  const [clientID, setClientID] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [clientContactToRestore, setClientContactToRestore] = useState('');
  
  const dispatch = useDispatch();
  const router = useRouter()

  // useEffect(() => {
  //   if (!clientSource && sources.length > 0) {
  //     dispatch(setClientData({ clientSource: sources[0] }));
  //   }
  // }, [clientSource, dispatch]);

  useEffect(() => {
    // Check if age input violates constraints for selected option
    if ((selectedOption === "Baby." && parseInt(clientAge) > 3) || 
        (selectedOption === "Master." && (parseInt(clientAge) < 4 || parseInt(clientAge) > 12))) {
      setDisplayWarning(true);
    } else {
      setDisplayWarning(false);
    }
    //MP-70-DOB doesn't set while fetching from DB
  }, [clientAge, selectedOption]); 

  const isDetails = useAppSelector(state => state.quoteSlice.isDetails);

  const handleSearchTermChange = (event) => {
    const newName = event.target.value
    // setIsNewClient(true);
    
    if (newName !== '' && clientContact === '') {
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/SuggestingClientNames.php/get?suggestion=${newName}&JsonDBName=${companyName}&type=name`)
        .then((response) => response.json())
        .then((data) => setClientNameSuggestions(data));
      
    } catch(error){
      console.error("Error Suggesting Client Names: " + error)
    }
  } else {
    setClientNameSuggestions([]);
  }
  dispatch(setClientData({clientName: newName}));
  if (errors.clientName) {
    setErrors((prevErrors) => ({ ...prevErrors, clientName: undefined }));
  }
  };

  const elementsToHideList = () => {
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${companyName}`)
        .then((response) => response.json())
        .then((data) => setElementsToHide(data));
    } catch(error){
      console.error("Error showing element names: " + error)
    }
  }

  const handleConsultantNameChange = (event) => {
    const newName = event.target.value;
    setConsultantName(newName)
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestingVendorNames.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
      .then((response) => response.json())
      .then((data) => {setConsultantNameSuggestions(data)});
      if (errors.consultantName) {
        setErrors((prevErrors) => ({ ...prevErrors, consultantName: undefined }));
      }
  };

  const showToastMessage = (severityStatus, toastMessageContent) => {
    setSeverity(severityStatus)
    setToastMessage(toastMessageContent)
    setToast(true)
  }

 
  const handleClientNameSelection = (names) => {
    const input = names.target.value;
    const name = input.substring(0, input.indexOf('(')).trim();
    const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();

    
    dispatch(setClientData({clientName: name}));
    dispatch(setClientData({clientContact: number}));
    fetchClientDetails(number);
    setClientNameSuggestions([]);
    setIsNewClient('false');
    setContactWarning('');
  };
  
  const handleConsultantNameSelection = (event) => {
    const input = event.target.value;
    const name = input.substring(0, input.indexOf('(')).trim();
    const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();
  
    setConsultantNameSuggestions([]);
    setConsultantName(name)
    setConsultantNumber(number);
    // fetchConsultantDetails(name, number);
  };

  const fetchClientDetails = (clientNumber) => {
    axios
      .get(`https://orders.baleenmedia.com/API/Media/FetchClientDetails.php?ClientContact=${clientNumber}&JsonDBName=${companyName}`)
      .then((response) => {
        const data = response.data;
        if (data && data.length > 0) {
          const clientDetails = data[0];
          setClientID(clientDetails.id);
          dispatch(setClientData({ clientName: clientDetails.name || "" }));
          //MP-69-New Record are not fetching in GS
          setDOB(clientDetails.DOB);
          dispatch(setClientData({ clientEmail: clientDetails.email || "" }));
          dispatch(setClientData({ clientSource: clientDetails.source || "" }));
          //setClientAge(clientDetails.Age || "");
          setAddress(clientDetails.address || "");
          setTitle(clientDetails.gender || "");
          setSelectedOption(clientDetails.gender || "");
          setConsultantName(clientDetails.consname || "");
          setConsultantNumber(clientDetails.consnumber || "");
          // setClientPAN(clientDetails.PAN || "");
          setClientGST(clientDetails.GST || "");
          setClientContactPerson(clientDetails.clientContactPerson || "");
          setMonths(clientDetails.Age || "");
          const age = calculateAge(clientDetails.DOB);
          setClientAge(age);
          // Extract PAN from GST if necessary
        if (clientDetails.GST && clientDetails.GST.length >= 15 && (!clientDetails.ClientPAN || clientDetails.ClientPAN === "")) {
          const pan = clientDetails.GST.slice(2, 12); // Correctly slice GST to get PAN
          setClientPAN(pan);
        } else {
          setClientPAN(clientDetails.ClientPAN);
        }
      
        } else {
          // Handle case where no data is returned
          // dispatch(setClientData({ clientEmail: "" }));
          // dispatch(setClientData({ clientSource: "" }));
          // setClientAge("");
          // // setDOB("");
          // setAddress("");
          // setTitle("");
          // setSelectedOption("");
          // setConsultantName("");
          // setConsultantNumber("");
          // setClientPAN("");
          // setClientGST("");
          console.warn("No client details found for the given name and contact number.");
        }
      })
      .catch((error) => {
        console.error("Error fetching client details:", error);
        // Optionally, you can reset the fields or show an error message to the user
        // dispatch(setClientData({ clientEmail: "" }));
        // dispatch(setClientData({ clientSource: "" }));
        // setClientAge("");
        // setDOB("");
        // setAddress("");
        // setTitle("");
        // setSelectedOption("");
        // setConsultantName("");
        // setConsultantNumber("");
        // setClientPAN("");
        // setClientGST("");
      });
  };

  useEffect(() => {    
        if (!loggedInUser) {
          router.push('/login');
        }
        
        // if(!clientName){
        //   dispatch(resetClientData());
        //   dispatch(resetQuotesData());
        // }

        dispatch(resetClientData());
        dispatch(resetQuotesData());
        // MP-72-Fix - Source is empty on start up.

        companyName === 'Grace Scans' ? dispatch(setClientData({clientSource: sources[1]})) : dispatch(setClientData({clientSource: sources[0]}))
        elementsToHideList()
  }, []);

  useEffect(() => {
    //searching elements to Hide from database

    elementsToHide.forEach((name) => {
      const elements = document.getElementsByName(name);
      elements.forEach((element) => {
        element.style.display = 'none'; // Hide the element
      });
    });
  }, [elementsToHide])


  const handleClientContactChange = (newValue) => {
    
    // Contact Validation
    if (newValue === '') {
        setContactWarning('');
    } else if (newValue.length !== 10 && newValue.length !== 0) {
        setContactWarning('Contact number should contain exactly 10 digits.');
      } else {
        setContactWarning('');

        // Check if contact number already exists or not
        if (newValue !== '') {
            fetch(`https://orders.baleenmedia.com/API/Media/CheckClientContact.php?ClientContact=${newValue}&JsonDBName=${companyName}`)
                .then((response) => response.json())
                .then((data) => {
                    if (!data.isNewUser) {
                        // Contact number already exists
                        setIsNewClient(false);
                        setContactWarning('Contact number already exists.');

                        // MP-95-As a user, I should able to restore a removed client.
                    if (data.warningMessage.includes('restore the client')) {
                          setClientContactToRestore(newValue);
                          setRestoreDialogOpen(true);
                      }
                    } else {
                        // Contact number is new
                        setIsNewClient(true);
                        setContactWarning('');
                          dispatch(setClientData({ clientEmail: "" }));
                          dispatch(setClientData({ clientName: "" }));
                          setClientAge("");
                          setDOB("");
                          setAddress("");
                          setConsultantName("");
                          setConsultantNumber("");
                          setClientPAN("");
                          setClientGST("");
                          setClientContactPerson("");
                          setClientID("");
                          
                    }
                })
                .catch((error) => {
                    console.error("Error checking contact number: " + error);
                });
        }
    }
 

    // Client Name Suggestions
    if (newValue !== '' ) {
        try {
            fetch(`https://orders.baleenmedia.com/API/Media/SuggestingClientNames.php/get?suggestion=${newValue}&JsonDBName=${companyName}&type=contact`)
                .then((response) => response.json())
                .then((data) => setClientNameSuggestions(data));
        } catch (error) {
            console.error("Error suggesting client names: " + error);
        }
    } else {
        setClientNameSuggestions([]);
    }

    dispatch(setClientData({ clientContact: newValue }));

    // MP-96-As a user, I want the validation to go away while filling the details.
    if (errors.clientContact) {
      setErrors((prevErrors) => ({ ...prevErrors, clientContact: undefined }));
    }
};



  let emailTimeout;
  const handleClientEmailChange = (newValue) => {
    dispatch(setClientData({ clientEmail: newValue }));
    
    
    if (emailTimeout) {
      clearTimeout(emailTimeout);
    }

    emailTimeout = setTimeout(() => {
      if (newValue && !newValue.includes('@')) {
        setEmailWarning('Email should contain an "@" symbol.');
      } else {
        setEmailWarning('');
      }
    }, 500);
    // MP-96-As a user, I want the validation to go away while filling the details.
    if (errors.clientEmail) {
      setErrors((prevErrors) => ({ ...prevErrors, clientEmail: undefined }));
    }
  };

  const handleClientSourceChange = (selectedOption) => {
    dispatch(setClientData({ clientSource: selectedOption.target.value }));
    if (errors.clientSource) {
      setErrors((prevErrors) => ({ ...prevErrors, clientSource: undefined }));
    }
  };

  const handleClientContactPersonChange = (value) => {
    setClientContactPerson(value);
    if (errors.clientContactPerson) {
      setErrors((prevErrors) => ({ ...prevErrors, clientContactPerson: undefined }));
    }
  };

  const submitDetails = async(event) => {
    event.preventDefault()
    
    if(companyName !== 'Grace Scans'){
      if (isEmpty === true){
      router.push('/adDetails')
    }
    const isValid = BMvalidateFields();
    if (isValid) {
    try {

      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertNewEnquiry.php/?JsonUserName=${loggedInUser}&JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonSource=${clientSource}&JsonAge=${clientAge}&JsonDOB=${DOB}&JsonAddress=${address}&JsonDBName=${companyName}&JsonGender=${selectedOption}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantNumber}&JsonClientGST=${clientGST}&JsonClientPAN=${clientPAN}&JsonIsNewClient=${isNewClient}&JsonClientID=${clientID}&JsonClientContactPerson=${clientContactPerson}`)
      const data = await response.json();
      if (data === "Values Inserted Successfully!") {
                setSuccessMessage('Client Details Are Saved!');
                setTimeout(() => {
              setSuccessMessage('');
            }, 3000);
          // window.location.reload();
          dispatch(resetQuotesData())
          dispatch(setQuotesData({currentPage: "checkout"}))
          router.push('/adDetails')
        // setMessage(data.message);
      } else if (data === "Contact Number Already Exists!"){
        setToastMessage('Contact Number Already Exists!');
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
      } else {
        alert(`The following error occurred while inserting data: ${data}`);
      }

    } catch (error) {
      console.error('Error updating rate:', error);
  }
  
} else {
  setToastMessage('Please fill the necessary details in the form.');
  setSeverity('error');
  setToast(true);
  setTimeout(() => {
    setToast(false);
  }, 2000);
  }
 }
  else{
    const isValid = GSvalidateFields();
    if (isValid) {
    try {
      const age = selectedOption.toLowerCase().includes('baby') || selectedOption.toLowerCase().includes('b/o.') ? months : clientAge;
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertNewEnquiry.php/?JsonUserName=${loggedInUser}&JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonSource=${clientSource}&JsonAge=${age}&JsonDOB=${DOB}&JsonAddress=${address}&JsonDBName=${companyName}&JsonGender=${selectedOption}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantNumber}&JsonClientGST=${clientGST}&JsonClientPAN=${clientPAN}&JsonIsNewClient=${isNewClient}&JsonClientID=${clientID}&JsonClientContactPerson=${clientContactPerson}`)
      const data = await response.json();
      if (data === "Values Inserted Successfully!") {
        setSuccessMessage('Client Details Are Saved!');
        setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
          // window.location.reload();
        
        //setMessage(data.message);
      } else if (data === "Contact Number Already Exists!"){
        setToastMessage('Contact Number Already Exists!');
  setSeverity('error');
  setToast(true);
  setTimeout(() => {
    setToast(false);
  }, 2000);
      } else {
        alert(`The following error occurred while inserting data: ${data}`);
      }
  }catch (error) {
    console.error('Error updating rate:', error);
  } 
  // setSeverity('success');
  // setToast(true);
} else {
  setToastMessage('Please fill the necessary details in the form.');
  setSeverity('error');
  setToast(true);
  setTimeout(() => {
    setToast(false);
  }, 2000);
}}
}
// Function to format the date as dd-MON-yyyy
function formatDate(inputValue) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = String(inputValue.getDate()).padStart(2, '0');
  const monthIndex = inputValue.getMonth();
  const year = inputValue.getFullYear();
  const month = months[monthIndex];
  return `${day}-${month}-${year}`;
}


const handleInputChange = (event) => {
  const inputDate = new Date(event.target.value);
  if (!isNaN(inputDate.getTime())) { // Check if valid date
    // setDOB(event.target.value); // Update the input value
    const age = calculateAge(inputDate); // Calculate age
    setClientAge(age); // Update client age in state
  }
};

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const calculateDateFromAge = (age) => {
  const today = new Date();
  const birthDate = new Date(today.setFullYear(today.getFullYear() - age));
  return birthDate.toISOString().split('T')[0];
};

// const handleInputAgeChange = (event) => {
//   const dob = event.target.value;
//   const age = calculateAge(dob);
//   setInputValue(dob);
//   // setInputValue(formatDate(new Date(dob)));
//   setClientAge(age);
// };



const handleInputAgeChange = (event) => {
  const age = event.target.value;
  setClientAge(age);
  
  if ((selectedOption === 'Baby.' && parseInt(age) > 3) || 
      (selectedOption === 'Master.' && (parseInt(age) < 4 || parseInt(age) > 12))) {
    setDisplayWarning(true);
  } else {
    setDisplayWarning(false);
  }

// MP-42-DOB calculation is not working when age is entered
  if (age) {
    const dob = calculateDateFromAge(age);
    setDOB(dob);
  }

  if (errors.ageAndDOB) {
    setErrors((prevErrors) => ({ ...prevErrors, ageAndDOB: undefined }));
  }
};


const handleDateChange = (e) => {
  const dateValue = e.target.value;
  setDOB(dateValue);
  const age = calculateAge(dateValue);
  setClientAge(age);
  
  if (selectedOption === 'B/o.' || selectedOption === 'Baby.') {
  // if (selectedOption === 'B/o.') {
    const selectedDate = new Date(dateValue);
    const today = new Date();
    const diffTime = Math.abs(today - selectedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const calculatedMonths = Math.floor(diffDays / 30);
    const calculatedDays = diffDays % 30;

    setMonths(calculatedMonths);
    
  }
  if (errors.ageAndDOB) {
    setErrors((prevErrors) => ({ ...prevErrors, ageAndDOB: undefined }));
  }
};

const calculateDateFromMonths = (months) => {
  const today = new Date();
  today.setMonth(today.getMonth() - months);
  return today.toISOString().split('T')[0];
};

const handleMonthsChange = (e) => {
  setMonths(e.target.value);
  
  if (e.target.value) {
    const dateFromMonths = calculateDateFromMonths(e.target.value);
    setDOB(dateFromMonths);
  }
  if (errors.months) {
    setErrors((prevErrors) => ({ ...prevErrors, months: undefined }));
  }
};

useEffect(() => {
  // if (selectedOption !== 'B/o.' && selectedOption !== 'Baby.') {
  if (selectedOption !== 'B/o.' && selectedOption !== 'Baby.') {
    setMonths('');
    setDays('');
  }
}, [selectedOption]);

// Function to check if any of the fields are empty
const checkEmptyFields = () => {
  if (
    clientName !== '' ||
    clientContact !== '' ||
    selectedOption !== '' 
    
  ) {
    setIsEmpty(false); // Set isEmpty to false if all fields are filled
  } else {
    setIsEmpty(true); // Set isEmpty to true if any field is empty
  }

};

// useEffect to check empty fields whenever any relevant state changes
useEffect(() => {
  checkEmptyFields();
  
}, [clientName, clientContact, clientEmail, address, clientAge, DOB]);

//MP-39-Warning message should be shown for GST Field (<15 characters)
const handleGSTChange = (e) => {
  const { value } = e.target;
  setClientGST(value);
  if (value.length < 15 || value.length > 15) {
    setError('GST Number must be 15 characters long');
  } else {
    const pan = value.slice(2, -3);
    setClientPAN(pan);
    setError('');
    
  }

};

// MP-67-Create validation for client and consultant contact field (=10)
const handleConsultantNumberChange = (newValue) => {
setConsultantNumber(newValue);
if (newValue === '') {
  setContactWarning('');
} else if (newValue.length !== 10 && newValue.length !== 0) {
  setConsulantWarning('Contact number should contain exactly 10 digits.');
} else {
  
  setConsulantWarning('');
};
if (errors.consultantNumber) {
  setErrors((prevErrors) => ({ ...prevErrors, consultantNumber: undefined }));
}
}



const handleRemoveClient = () => {
  event.preventDefault();
    // Check if client contact is empty
    if (!clientContact) {
      errors.clientContact = 'Contact Number is required';
      return;
  }

  fetch(`https://orders.baleenmedia.com/API/Media/RemoveClient.php?JsonClientID=${clientID}&JsonDBName=${companyName}`)
  .then((response) => response.json())
  .then((data) => {
      if (data.success) {
          // Client removed successfully
          setSuccessMessage('Client removed successfully!');
          dispatch(resetClientData());
          setClientAge("");
          setDOB("");
          setAddress("");
          setConsultantName("");
          setConsultantNumber("");
          setClientPAN("");
          setClientGST("");
          setClientContactPerson("");
          setClientID("");
          setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
          // Failed to remove client
          // window.alert("Failed to remove client: " + data.message);
          setToastMessage("Failed to remove client: " + data.message);
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
      }
  })
  .catch((error) => {
      console.error("Error removing client: " + error);
  });
};

// MP-95-As a user, I should able to restore a removed client.
const handleRestoreClient = () => {
  fetch(`https://orders.baleenmedia.com/API/Media/RestoreClient.php?ClientContact=${clientContactToRestore}&JsonDBName=${companyName}`)
      .then((response) => response.json())
      .then((data) => {
          if (data.success) {
            setSuccessMessage('Client has been restored successfully!');
            setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
          fetchClientDetails(clientContact);
          } else {
            setToastMessage("Failed to restore client: " + data.message);
            setSeverity('error');
            setToast(true);
            setTimeout(() => {
              setToast(false);
            }, 2000);
          }
          setRestoreDialogOpen(false);
      })
      .catch((error) => {
          console.error("Error restoring client: " + error);
          setContactWarning('Error restoring client.');
          setRestoreDialogOpen(false);
      });
};

const GSvalidateFields = () => {
  let errors = {};

  if (!clientContact) errors.clientContact = 'Contact Number is required';
  // if (!clientContact || clientContact.length < 10) {
  //   errors.clientContact = 'Client contact must be exactly 10 digits.';
  // }
  if (!clientName) errors.clientName = 'Client Name is required';
  if (!isValidEmail(clientEmail) && clientEmail) errors.clientEmail = 'Invalid email format';
  if (!clientAge && selectedOption !== 'Baby.' && selectedOption !== 'B/o.') {
    errors.ageAndDOB = 'Age and DOB are required';
  }
  
  if (!DOB && selectedOption !== 'Baby.' && selectedOption !== 'B/o.') {
    errors.ageAndDOB = 'Age and DOB are required';
  }
  if ((clientSource === 'Consultant' || clientSource === '5.Consultant') && (!consultantName || !consultantNumber)) {
    if (!consultantName) errors.consultantName = 'Consultant Name is required';
    if (!consultantNumber) errors.consultantNumber = 'Consultant Contact is required';
  }
  
  if (selectedOption === 'Ms.' && !clientContactPerson) {
    errors.clientContactPerson = 'Contact Person Name is required';
  }
  if ((selectedOption === 'Baby.' || selectedOption === 'B/o.') && (!months || months > 36 || months === 0)) {
    if (!months) {
      errors.months = 'Months and DOB are required for Baby.';
    } else if (months > 36) {
      errors.months = 'Months cannot be greater than 36.';
    } else if (months === 0) {
      errors.months = 'Months cannot be 0.';
    }
  }
  if (selectedOption === 'Master.' && (!clientAge || clientAge < 4 || clientAge > 12 || clientAge === 0)) {
    if (!clientAge) {
      errors.ageAndDOB = 'Age is required for Master.';
    } else if (clientAge < 4 || clientAge > 12) {
      errors.ageAndDOB = 'Age must be between 4 and 12 for Master.';
    } else if (clientAge === 0 ) {
      errors.ageAndDOB = 'Age cannot be 0.';
    }
  }
  if (clientAge === 0 && (selectedOption !== 'Baby.' && selectedOption !== 'B/o.')) {
    errors.ageAndDOB = 'Age cannot be 0.';
  }
  if (!clientSource) {
    errors.clientSource = 'Source is required';
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

const BMvalidateFields = () => {
  let errors = {};

  if (!clientContact) errors.clientContact = 'Contact Number is required';
  // if (!clientContact || clientContact.length !== 10) {
  //   errors.clientContact = 'Client contact must be exactly 10 digits.';
  // }
  if (!clientName) errors.clientName = 'Client Name is required';
  if (!isValidEmail(clientEmail) && clientEmail) errors.clientEmail = 'Invalid email format';
  if (clientSource === 'Consultant' || clientSource === '5.Consultant' && !consultantName) errors.consultantName = 'Consultant Name is required';
  if ((clientSource === 'Consultant' || clientSource === '5.Consultant') && (!consultantNumber || consultantNumber.length !== 10)) {
    if (!consultantNumber) {
      errors.consultantNumber = 'Consultant contact is required.';
    } else if (consultantNumber.length !== 10) {
      errors.consultantNumber = 'Consultant contact must be exactly 10 digits.';
    }
  }
  if (selectedOption === 'Ms.' && !clientContactPerson) {
    errors.clientContactPerson = 'Contact Person Name is required';
  }
  if (!clientSource) {
    errors.clientSource = 'Source is required';
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

  // Function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="flex flex-col justify-center mt-8  mx-[8%]">
      
      <form className="px-7 h-screen grid justify-center items-center"> 
    <div className="grid gap-6" id="form">
    <h1 className="font-bold text-3xl text-center mb-4">Client Registration</h1>
    {/* // MP-95-As a user, I should able to restore a removed client. */}
    {/* Restore client dialog */}
    <Dialog
                open={restoreDialogOpen}
                onClose={() => setRestoreDialogOpen(false)}
            >
                <DialogTitle>Restore Client</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This client is invalid. Do you want to restore the client?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRestoreDialogOpen(false)} color="primary">
                        No
                    </Button>
                    <Button onClick={handleRestoreClient} color="primary" autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
{/* Restore client dialog */}
        <input 
        className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
        type="number" 
        placeholder="Contact Number*" 
        id="3" 
        name="ClientContactInput" 
        // required
        value={clientContact}
        // onChange={(e) => handleClientContactChange(e.target.value)}
        onChange={(e) => {
          if (e.target.value.length <= 10) {
            handleClientContactChange(e.target.value);
          }
        }}
        onBlur={() => {
          setTimeout(() => {
            setClientNameSuggestions([]);
            setContactWarning('');
          if (clientContact.length === 10 && isNewClient === false) {
            fetchClientDetails(clientContact);
          }
          }, 200);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
        />
        {(clientNameSuggestions.length > 0 && clientContact !=='') && (
          <ul className="list-none border-green-300 border-1 ">
            {clientNameSuggestions.map((name, index) => (
              <li key={index} className="text-black text-left pl-3 pt-1 pb-1 border w-full bg-[#9ae5c2] hover:cursor-pointer transition duration-300 rounded-md"> 
                <button
                  type="button"
                  className="text-black w-full h-full text-left"
                  onClick={handleClientNameSelection}
                  value={name}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {contactWarning && <p className="text-red-500">{contactWarning}</p>}
        {errors.clientContact && <p className="text-red-500">{errors.clientContact}</p>}
        <div className="w-full flex gap-3">
      <select
        className="shadow-2xl p-3 ex w-24 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md justify-center"
        id='1'
        name="TitleSelect"
        value={selectedOption}
        //onChange={e => setTitle(e.target.value)}
       // defaultValue="Mrs."
        // required
        onChange={(e) => {
          const selectedOption = e.target.value;
          setSelectedOption(selectedOption);
          // setClientAge(""); // Clear the age input field when the title changes

        // Display DOB warning when selected option is "B/o."
          setDisplayDOBWarning(selectedOption === "B/o.");
      }}
      >
        <option value="Mr.">Mr.</option>
        <option value="Miss.">Miss.</option>
        <option value="Mrs.">Mrs.</option>
        <option value="Ms.">Ms.</option>
        <option value="B/o.">B/o.</option>
        <option value="Baby.">Baby.</option>
        <option value="Master.">Master.</option>
      </select>
        <input className="p-3 shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
          type="text"
          placeholder="Name*" 
          id='2'
          name="ClientNameInput" 
          maxLength={32}
          // required
          value={clientDetails.clientName}
          onChange={handleSearchTermChange}
          // MP-45-The client name suggestions should hide when it is not selected (or while creating a new client entry)

          onBlur={() => {
            setTimeout(() => {
              setClientNameSuggestions([]);
            }, 200); // Adjust the delay time according to your preference
          }}
          onKeyPress={(e) => {
            // Allow only alphabetic characters
            const regex = /^[a-zA-Z\s]*$/;
            if (!regex.test(e.key)) {
                e.preventDefault();
            }
        }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Find the next input field and focus on it
              const inputs = document.querySelectorAll('input, select, textarea');
              const index = Array.from(inputs).findIndex(input => input === e.target);
              if (index !== -1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
              }
            }
          }}
          />
          
      </div>
      
      {/* {clientNameSuggestions.length > 0 && <VirtualizedList clientNameSuggestions={clientNameSuggestions} onClientNameSelection={handleClientNameSelection}/> } */}
      {(clientNameSuggestions.length > 0 && clientName !== '' && clientContact === '' ) && (
          <ul className="list-none border-green-300 border-1 ">
            {clientNameSuggestions.map((name, index) => (
              <li key={index} className="text-black text-left pl-3 pt-1 pb-1 border w-full bg-[#9ae5c2] hover:cursor-pointer transition duration-300 rounded-md">
                <button
                  type="button"
                  className="text-black w-full h-full text-left"
                  onClick={handleClientNameSelection}
                  value={name}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
         {errors.clientName && <p className="text-red-500">{errors.clientName}</p>}
      <div className="grid gap-6 w-full">
      {selectedOption === 'Ms.' ? (
        <input className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
          type="text" 
          placeholder="Contact Person Name*" 
          id="30"
          name="ClientContactPersonInput"
          value={clientContactPerson}
          onChange={handleClientContactPersonChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Find the next input field and focus on it
              const inputs = document.querySelectorAll('input, select, textarea');
              const index = Array.from(inputs).findIndex(input => input === e.target);
              if (index !== -1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
              }
            }
          }}
          
          />
          
        ) : (<></>)}
        {errors.clientContactPerson && <p className="text-red-500">{errors.clientContactPerson}</p>}
        <input className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
        type="email" 
        placeholder="Email"
        id="4" 
        name="ClientEmailInput" 
        value={clientEmail}
        onChange={(e) => handleClientEmailChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
        />
        {emailWarning && <p className="text-red-500 ml-8">{emailWarning}</p>}
      </div>
      {errors.clientEmail && <p className="text-red-500">{errors.clientEmail}</p>}
      
      {/* <div class="w-full flex gap-3 ">
        <input className='capitalize shadow-2xl p-3 ex w-40 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md justify-center' 
        type='number' 
        id='5'
        name='ClientAgeInput'
        placeholder="Age" 
        value={clientAge} 
        onChange={(e) => {
          const { value } = e.target;
          setClientAge(value);

          // Display warning based on the selected option and age input value
          if ((selectedOption === "Baby." && parseInt(value) > 3) || 
              (selectedOption === "Master." && (parseInt(value) < 4 || parseInt(value) > 12))) {
            setDisplayWarning(true);
          } else {
            setDisplayWarning(false);
          }
        }}  
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
        />
        <input class="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
        type="date" 
        name='AgeDatePicker'
        id='6'
        value={inputValue} 
        onChange={handleInputAgeChange} 
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}/>
      </div> */}
      {/* {(selectedOption !== 'B/o.' && selectedOption !== 'Baby.') ? ( */}
      {(selectedOption !== 'B/o.' && selectedOption !== 'Baby.') ? (
        <div className="w-full flex gap-3" name='AgeDatePicker'>
          <input
            className="shadow-2xl p-3 ex w-40 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md justify-center"
            type="number"
            id="5"
            name="ClientAgeInput"
            placeholder="Age*"
            value={clientAge}
            onChange={handleInputAgeChange}
            // onChange={(e) => {
            //   const { value } = e.target;
            //   setClientAge(value);

            //   if (
            //     (selectedOption === 'Baby.' && parseInt(value) > 3) ||
         
            //     (selectedOption === 'Master.' && (parseInt(value) < 4 || parseInt(value) > 12))
            //   ) {
            //     setDisplayWarning(true);
            //   } else {
            //     setDisplayWarning(false);
            //   }
            // }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = document.querySelectorAll('input, select, textarea');
                const index = Array.from(inputs).findIndex(input => input === e.target);
                if (index !== -1 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
                }
              }
            }}
          />
          
          <input
            className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
            type="date"
            name="AgeDatePicker"
            id="6"
            defaultValue={DOB}
            value={DOB}
            onChange={handleDateChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = document.querySelectorAll('input, select, textarea');
                const index = Array.from(inputs).findIndex(input => input === e.target);
                if (index !== -1 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
                }
              }
            }}
          />
          
        </div>
        
      ) : (
        <div className="w-full flex gap-3">
          <input
            className="shadow-2xl p-3 ex w-40 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md justify-center"
            type="number"
            name="MonthsInput"
            placeholder="Months*"
            value={months}
            onChange={handleMonthsChange}
          />
          
          <input
            className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
            type="date"
            name="AgeDatePicker"
            id="7"
            value={DOB}
            onChange={handleDateChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = document.querySelectorAll('input, select, textarea');
                const index = Array.from(inputs).findIndex(input => input === e.target);
                if (index !== -1 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
                }
              }
            }}
          />
          
        
        </div>
      )}
      {errors.ageAndDOB && <p className="text-red-500">{errors.ageAndDOB}</p>}
      {errors.months && <p className="text-red-500">{errors.months}</p>}
      {/* {displayWarning && (
      <div className={`text-red-600 ${selectedOption === "Baby." ? "ml-12" : "ml-9"}`}>
        {selectedOption === "Baby." && "The age should be less than 3."}
        {selectedOption === "Master." && "The age should be between 4 and 12."}
      </div>
    )} */}

{/* {displayDOBWarning && (
      <div className="text-red-600 ml-9">Note: The DOB should be the baby's</div>
    )} */}
      <div className="flex gap-3">
      <textarea
        className="p-3 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
        id="7"
        name="ClientAddressTextArea"
        placeholder="Address"
        // required
        value={address}
        onChange={e => setAddress(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
      ></textarea>
        {/* <input class="p-3 glass shadow-2xl  w-full outline-none focus:border-solid focus:border-[1px] border-[#035ec5]" type="text" placeholder="Confirm password" required="" /> */}
      </div>
      <div className='grid gap-6 w-full' name="ClientGSTInput" >
      <input 
        className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
        placeholder="GST Number" 
        id="31" 
        name="ClientGSTInput" 
        value={clientGST}
        maxLength={15}
        // onChange={(e) => setClientGST(e.target.value)}
        //MP-39-Warning message should be shown for GST Field (<15 characters)
        onChange={handleGSTChange} 
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
        
        />
        {error && <p className="text-red-500">{error}</p>}
        <input 
        className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
        placeholder="PAN" 
        id="32" 
        name="ClientPANInput" 
        value={clientPAN}
        maxLength={10}
        onChange={(e) => setClientPAN(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
        />
        </div>
        <div className='grid gap-6 w-full'>
      <select
        className="p-3 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
        id="8"
        name="ClientSourceSelect"
        value={clientSource}
        // required
        defaultValue={sources[0]}
        onChange={handleClientSourceChange}
      >
        {/* <option >Select Source</option> */}
        {sources.map((source, index) => (
          <option key={index} value={source}>
            {source}
          </option>
        ))}
      </select>
      {errors.clientSource && <p className="text-red-500">{errors.clientSource}</p>}
      {(clientSource === '5.Consultant' || clientSource === 'Consultant') && (
        <>
      <input 
        className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
        type="text" 
        placeholder="Consultant Name*" 
        id="9" 
        name="ConsultantNameInput" 
        // required = {clientSource === '5.Consultant' || clientSource === 'Consultant' ? true : false} 
        onChange={handleConsultantNameChange} 
        value={consultantName}
        onBlur={() => {
          setTimeout(() => {
            setConsultantNameSuggestions([]);
          }, 200);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
      />
      {consultantNameSuggestions.length > 0 && (
  <ul className="list-none">
    {consultantNameSuggestions.map((name, index) => (
      <li key={index} className="text-black text-left pl-3 pt-1 pb-1 border w-full bg-[#9ae5c2] hover:cursor-pointer transition duration-300 rounded-md">
        <button
          type="button"
          className="text-black w-full h-full text-left"
          onClick={handleConsultantNameSelection}
          value={name}
          
        >
          {name}
          
        </button>
      </li>
    ))}
  </ul>
)}
{errors.consultantName && <p className="text-red-500">{errors.consultantName}</p>}
      <input 
        className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" type="number" placeholder="Consultant Number*" 
        id="10" 
        name="ConsultantNumberInput" 
        value={consultantNumber} 
        // onChange={handleConsultantNumberChange} 
        onChange={(e) => {
          if (e.target.value.length <= 10) {
            handleConsultantNumberChange(e.target.value);
          }
        }}
        // required = {clientSource === '5.Consultant' || clientSource === 'Consultant' ? true : false}
        />
        </>
            )}
      </div>
      {consulantWarning && <p className="text-red-500">{consulantWarning}</p>}
      {errors.consultantName && <p className="text-red-500">{errors.consultantNumber}</p>}
      
      <div>
        {/* MP-71-Rename “Submit” button to “Add” and “Update” based on client existence */}
      {isNewClient == true ? (
        <button 
          className="outline-none glass shadow-2xl w-full p-3 bg-[#ffffff] border-[1px] border-solid border-[#b7e0a5] hover:border-[#b7e0a5] hover:bg-[#f0fff0] hover:text-[#008000] font-bold rounded-md mb-28" 
          onClick={submitDetails}>
          Add
        </button>
      ) : (
        <div className="flex gap-3 mb-28 ">
        <button 
            className="outline-none glass shadow-2xl flex-grow p-3 bg-[#ffffff] border-[1px] border-solid border-[#b7e0a5] hover:border-[#b7e0a5] hover:bg-[#f0fff0] hover:text-[#008000] font-bold rounded-md" 
            onClick={submitDetails}>
            Update
        </button>
        <button 
            className="outline-none glass shadow-2xl flex-grow p-3 bg-[#ffffff] border-[1px] border-solid border-[#ffd9d9] hover:border-[#ffe6e6] hover:bg-[#ffe6e6] hover:text-[#e53e3e] font-bold rounded-md" 
            onClick={handleRemoveClient}>
            Remove
        </button>
    </div>
      )}
    </div>
    </div>
  </form>
      {/* <div className='w-full mt-8 justify-center items-center text-black'>
        <h1 className="font-bold text-3xl text-center mb-4 mt-4">Enter client details</h1>
        {/* <h1 className='text-3xl'>Client Details</h1>
        <label className="flex flex-col items-left text-lg mb-2">Client Name</label>
        <input
          className="w-full border border-purple-400 p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
          type="text"
          placeholder="Client Name"
          value={clientDetails.clientName}
          onChange={handleSearchTermChange}
          onFocus={(e) => e.target.select()}
        />
        {clientNameSuggestions.length > 0 && (
          <ul className="list-none">
            {clientNameSuggestions.map((name, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="text-purple-500 hover:text-purple-700"
                  onClick={handleClientNameSelection}
                  value={name}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}

      <label className='mt-4'>Client Contact</label>
      <input
        className="w-full border border-purple-400 p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
        type="text"
        placeholder="Client Contact"
        value={clientContact}
        onChange={(e) => handleClientContactChange(e.target.value)}
        onFocus={(e) => e.target.select()}
      />

      <label>Client Email</label>
      <input
        className="w-full border border-purple-400 p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
        type="email"
        placeholder="Client Email"
        value={clientEmail}
        onChange={(e) => handleClientEmailChange(e.target.value)}
        onFocus={(e) => e.target.select()}
      />

      <label>Source</label>
      <Select
        value={{ label: clientSource, value: clientSource }}
        onChange={handleClientSourceChange}
        options={sources.map((source) => ({ label: source, value: source }))}
      />
      </div>
      <div className='flex flex-row items-center justify-center'>
      <button
          className="bg-purple-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-purple-600 mt-4"
          onClick={() => { submitDetails() }}
        >
          Submit
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-purple-600 mt-4 ml-4"
          onClick={() => {
            if(clientName && clientContact && clientSource){ 
            router.push('/adDetails')
            Cookies.set('isSkipped',true)
            } else{
              dispatch(setQuotesData({currentPage: 'adDetails'}));
              router.push('/adDetails');
            }
          }}
        >
          Skip
        </button>
      </div>*/}

      {/* <div className="bg-surface-card p-8 rounded-2xl mb-4">
        <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
          <MuiAlert severity={severity} onClose={() => setToast(false)}>
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </div>  */}
      {successMessage && <SuccessToast message={successMessage} />}
      {toast && <ToastMessage message={toastMessage} type="error"/>}
    </div>

  );
};

export default ClientsData;