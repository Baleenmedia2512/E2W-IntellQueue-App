'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { resetClientData, setClientData } from '@/redux/features/client-slice';
import { useAppSelector } from '@/redux/store';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';
import ToastMessage from './components/ToastMessage';
import SuccessToast from './components/SuccessToast';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '@mui/x-date-pickers/DatePicker';
import { Calendar } from 'primereact/calendar';


const titleOptions = [
  { label: 'Mr.', value: 'Mr.', gender: 'Male' },
  { label: 'Miss.', value: 'Miss.', gender: 'Female' },
  { label: 'Mrs.', value: 'Mrs.', gender: 'Female' },
  { label: 'Ms.', value: 'Ms.', gender: '' },
  { label: 'B/o.', value: 'B/o.', gender: '' },
  { label: 'Baby.', value: 'Baby.', gender: '' },
  { label: 'Master.', value: 'Master.', gender: 'Male' },
  { label: 'Dr.', value: 'Dr.', gender: '' },
];
    
const ClientsData = () => {
  const loggedInUser = useAppSelector(state => state.authSlice.userName);
  const dbName = useAppSelector(state => state.authSlice.dbName);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const clientDetails = useAppSelector(state => state.clientSlice)
  const {clientName, clientContact, clientEmail, clientSource, clientID} = clientDetails;
  const [title, setTitle] = useState('Mr.');
  const [clientContactPerson, setClientContactPerson] = useState("")
  const bmsources = ['1.JustDial', '2.IndiaMart', '3.Sulekha','4.LG','5.Consultant','6.Own','7.Web App DB', '8.Online','9.Self', '10.Friends/Relatives'];
  const gssources = ['Consultant', 'Self', 'Online', 'Friends/Relatives', 'Others'];
  const [toast, setToast] = useState(false);
  const [clientAge, setClientAge] = useState('');
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);
  const [clientNumberSuggestions, setClientNumberSuggestions] = useState([]);
  const [consultantNameSuggestions, setConsultantNameSuggestions] = useState([]);
  const [address, setAddress] = useState('');
  const [DOB, setDOB] = useState('');
  const [displayDOB, setDisplayDOB] = useState('');
  const [consultantId, setConsultantId] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [consultantNumber, setConsultantNumber] = useState('');
  const [consultantPlace, setConsultantPlace] = useState('');
  const [displayWarning, setDisplayWarning] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
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
  // const [clientID, setClientID] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [clientContactToRestore, setClientContactToRestore] = useState('');
  const isDetails = useAppSelector(state => state.quoteSlice.isDetails)
  const [editMode, setEditMode] = useState(false);
  const [displayClientName, setDisplayClientName] = useState(clientName);
  const [displayClientNumber, setDisplayClientNumber] = useState('');
  const [displayClientID, setDisplayClientID] = useState(clientID);
  const nameInputRef = useRef(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [proceed, setProceed] = useState(false);
  const genderOptions = ['Male', 'Female', 'Others'];
  const [gender, setGender] = useState(genderOptions[1]);
  const [similarConsultantNames, setSimilarConsultantNames] = useState([]);
  const [similarConsultantDialogOpen, setSimilarConsultantDialogOpen] = useState(false);
  const [shouldCheckForSimilarConsultantNames, setShouldCheckForSimilarConsultantNames] = useState(true);
  
  const dispatch = useDispatch();
  const router = useRouter()


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

  useEffect(() => {
    if (elementsToHide.includes("ClientGSTInput")) {
      setSelectedOption(titleOptions[2].value);
      setGender(genderOptions[1]);
    } else {
      setSelectedOption(titleOptions[3].value);
      setGender(genderOptions[1]);
    }
  }, [elementsToHide]);


  const handleSearchTermChange = (event) => {
    const newName = event.target.value
    // setIsNewClient(true);

    if (newName !== '') {
            fetch(`https://orders.baleenmedia.com/API/Media/CheckClientContact.php?ClientContact=${clientContact}&ClientName=${newName}&JsonDBName=${companyName}`)
                .then((response) => response.json())
                .then((data) => {
                    if (!data.isNewUser) {
                        // Contact number already exists
                        setIsNewClient(false);
                        setEditMode(true);
                        // setContactWarning('Contact number already exists.');

                        // MP-95-As a user, I should able to restore a removed client.
                    if (data.warningMessage.includes('restore the client')) {
                          setClientContactToRestore(newValue);
                          setRestoreDialogOpen(true);
                      }
                    } else {
                        // Contact number is new
                        if (!editMode) {
                        setIsNewClient(true);
                        setContactWarning('');
                          dispatch(setClientData({ clientEmail: "" }));
                          // dispatch(setClientData({ clientName: "" }));
                          setClientAge("");
                          setDOB("");
                          setAddress("");
                          setConsultantId("");
                          setConsultantName("");
                          setConsultantNumber("");
                          setConsultantPlace("");
                          setClientPAN("");
                          setClientGST("");
                          setClientContactPerson("");
                          // setClientID("");
                          dispatch(setClientData({ clientID: "" }));
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error checking contact number: " + error);
                });
        }
  
    
    if (newName !== '') {
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
      fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${dbName}`)
        .then((response) => response.json())
        .then((data) => setElementsToHide(data));
    } catch(error){
      console.error("Error showing element names: " + error)
    }
  }

  const handleConsultantNameChange = (event) => {
    const newName = event.target.value;
    setConsultantName(newName)
    dispatch(setClientData({ consultantName: newName || "" }));

    if (newName.length > 1) {
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestingVendorNamesTest.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
      .then((response) => response.json())
      .then((data) => {setConsultantNameSuggestions(data)});
      if (errors.consultantName) {
        setErrors((prevErrors) => ({ ...prevErrors, consultantName: undefined }));
      }
    } else {
      setConsultantNameSuggestions([]);
    }
  };

  const checkForSimilarNames = async () => {
    try {
        const response = await fetch(
            `https://orders.baleenmedia.com/API/Media/CheckSimilarConsultantNamesTest.php?ConsultantName=${consultantName}&ConsultantNumber=${consultantNumber}&ConsultantPlace=${consultantPlace}&JsonDBName=${companyName}`
        );
        const data = await response.json();
        
        if (data.similarConsultants.length > 0) {
            setSimilarConsultantNames(data.similarConsultants); // Store objects instead of just names
            return true; // Similar consultants found
        }
    } catch (error) {
        console.error("Error checking similar consultant names: " + error);
    }
    return false; // No similar consultants found
};


  const showToastMessage = (severityStatus, toastMessageContent) => {
    setSeverity(severityStatus)
    setToastMessage(toastMessageContent)
    setToast(true)
  }


  
  const handleClientNameSelection = (names) => {
    const input = names.target.value;
    const splitInput = input.split('-');
    const ID = splitInput[0].trim();
    const rest = splitInput[1];
    const name = rest.substring(0, rest.indexOf('(')).trim();
    const number = rest.substring(rest.indexOf('(') + 1, rest.indexOf(')')).trim();
    
    dispatch(setClientData({
      clientName: name,
      clientContact: number,
      clientID: ID
    }));

    setDisplayClientID(ID);
    setDisplayClientName(name);
    setDisplayClientNumber(number);

    fetchClientDetails(ID);

    setClientNameSuggestions([]);
    setClientNumberSuggestions([]);
    setIsNewClient(false);
    setEditMode(true);
    setContactWarning('');
  };


  const handleConsultantNameSelection = (event) => {
    const input = event.target.value;
    const id = input.split('-')[0].trim();
    
    setConsultantNameSuggestions([]);
    fetchConsultantDetails(id);
  };
  
  const fetchConsultantDetails = (Id) => {
    fetch(`https://orders.baleenmedia.com/API/Media/FetchConsultantDetails.php?JsonConsultantID=${Id}&JsonDBName=${companyName}`)
    .then((response) => response.json())
    .then((data) => {
        setConsultantId(Id);
        setConsultantName(data.ConsultantName);
        setConsultantNumber( data.ConsultantNumber ? data.ConsultantNumber : '');
        setConsultantPlace(data.ConsultantPlace ? data.ConsultantPlace : '');

        dispatch(setClientData({ ConsultantId: Id }));
        dispatch(setClientData({ consultantName: data.ConsultantName || "" }));
        dispatch(setClientData({ consultantNumber: data.ConsultantNumber || "" }));
        dispatch(setClientData({ consultantPlace: data.ConsultantPlace || "" }));
    })
    .catch((error) => {
    });
  }

  const fetchClientDetails = (clientID) => {
    axios
      .get(`https://orders.baleenmedia.com/API/Media/FetchClientDetailsTest.php?ClientID=${clientID}&JsonDBName=${companyName}`)
      .then((response) => {
        const data = response.data;
        if (data && data.length > 0) {
          setErrors({});
          const clientDetails = data[0];

          const formattedDOB = parseDateFromDB(clientDetails.DOB);
          setDOB(clientDetails.DOB);
          setDisplayDOB(formattedDOB);

          setAddress(clientDetails.address || "");
          setTitle(clientDetails.title || "");
          setSelectedOption(clientDetails.title || "");
          setGender(clientDetails.gender || "");
          setConsultantId(clientDetails.consid || "");
          setConsultantName(clientDetails.consname || "");
          setConsultantNumber(clientDetails.consnumber || "");
          setConsultantPlace(clientDetails.consplace || "");
          setClientGST(clientDetails.GST || "");
          setClientContactPerson(clientDetails.clientContactPerson || "");
          setMonths(clientDetails.Age || "");
          
          const age = calculateAge(clientDetails.DOB);
          setClientAge(age);
          dispatch(setClientData({ clientAge: age || "" }));
          
        if (clientDetails.GST && clientDetails.GST.length >= 15 && (!clientDetails.PAN || clientDetails.PAN === "")) {
          const pan = clientDetails.GST.slice(2, 12);
          setClientPAN(pan);
          dispatch(setClientData({ clientPAN: pan || "" }));
        } else {
          setClientPAN(clientDetails.PAN);
          dispatch(setClientData({ clientPAN: clientDetails.PAN || "" }));
        }

          dispatch(setClientData({ 
            clientName: clientDetails.name || "", 
            clientTitle: clientDetails.title || "", 
            clientEmail: clientDetails.email || "", 
            clientAddress: clientDetails.address || "", 
            clientDOB: clientDetails.DOB || "", 
            clientMonths: clientDetails.age || "", 
            clientGST: clientDetails.GST || "", 
            clientSource: clientDetails.source || "", 
            consultantId: clientDetails.consid || "", 
            consultantName: clientDetails.consname || "", 
            consultantNumber: clientDetails.consnumber || "", 
            consultantPlace: clientDetails.consplace || "", 
            clientContactPerson: clientDetails.clientContactPerson || "", 
            clientGender: clientDetails.gender || "" }));

        } else {
          console.warn("No client details found for the given name and contact number.");
        }
      })
      .catch((error) => {
        console.error("Error fetching client details:", error);
      });
  };

  const FetchClientDetailsByContact = (clientNumber) => {
    axios
      .get(`https://orders.baleenmedia.com/API/Media/FetchClientDetailsByContactTest.php?ClientContact=${clientNumber}&JsonDBName=${companyName}`)
      .then((response) => {
        const data = response.data;
        if (data && data.length > 0) {
          setErrors({});
          setClientNumberSuggestions([]);
          const clientDetails = data[0];

          // Handle DOB and Age
          const formattedDOB = parseDateFromDB(clientDetails.DOB);
          setDOB(clientDetails.DOB);
          setDisplayDOB(formattedDOB);
          setClientAge(calculateAge(clientDetails.DOB));

          // Handle PAN extraction from GST if applicable
          const pan = clientDetails.GST?.length >= 15 && !clientDetails.PAN
            ? clientDetails.GST.slice(2, 12)
            : clientDetails.PAN;
          setClientPAN(pan);

          // Update client information locally
          setDisplayClientNumber(clientNumber);
          setDisplayClientID(clientDetails.id);
          setDisplayClientName(clientDetails.name);
          setAddress(clientDetails.address || "");
          setSelectedOption(clientDetails.title || "");
          setTitle(clientDetails.title || "");
          setConsultantId(clientDetails.consid || "");
          setConsultantName(clientDetails.consname || "");
          setConsultantNumber(clientDetails.consnumber || "");
          setConsultantPlace(clientDetails.consplace || "");
          setClientGST(clientDetails.GST || "");
          setClientContactPerson(clientDetails.clientContactPerson || "");
          setMonths(clientDetails.Age || "");
          setGender(clientDetails.gender || "");

          // Update client data in state
          dispatch(setClientData({
            clientContact: clientNumber,
            clientID: clientDetails.id || "",
            clientName: clientDetails.name || "",
            clientEmail: clientDetails.email || "",
            clientSource: clientDetails.source || "",
            clientTitle: clientDetails.title || "",
            consultantName: clientDetails.consname || "",
            // Additional values from local state
            displayClientNumber: clientNumber,
            displayClientID: clientDetails.id || "",
            displayClientName: clientDetails.name || "",
            address: clientDetails.address || "",
            selectedOption: clientDetails.title || "",
            title: clientDetails.title || "",
            consultantNumber: clientDetails.consnumber || "",
            consultantPlace: clientDetails.consplace || "",
            clientGST: clientDetails.GST || "",
            clientContactPerson: clientDetails.clientContactPerson || "",
            months: clientDetails.Age || "",
            gender: clientDetails.gender || "",
            DOB: clientDetails.DOB,
            displayDOB: formattedDOB,
            clientAge: clientAge,
            clientPAN: pan
          }));
      
        } else {
          console.warn("No client details found for the given name and contact number.");
        }
      })
      .catch((error) => {
        console.error("Error fetching client details:", error);
      });
  };

  useEffect(() => {    
        if (!loggedInUser || dbName === "") {
          router.push('/login');
        }
        
        // if(!clientName){
        //   dispatch(resetClientData());
        //   dispatch(resetQuotesData());
        // }
        // if (!isDetails) {
        // dispatch(resetClientData());
        // }
        // dispatch(resetQuotesData());
        // MP-72-Fix - Source is empty on start up.

        // dispatch(setClientData({clientSource: sources[0]}))
        if(dbName){
          elementsToHideList()
        }
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
            fetch(`https://orders.baleenmedia.com/API/Media/CheckClientContact.php?ClientContact=${newValue}&ClientName=${clientName}&JsonDBName=${companyName}`)
                .then((response) => response.json())
                .then((data) => {
                    if (!data.isNewUser) {
                        // Contact number already exists
                        setIsNewClient(false);
                        setEditMode(true);
                        setContactWarning('Contact number already exists.');
                        setErrors((prevErrors) => ({ ...prevErrors, clientContact: 'Contact number already exists' }));

                        // MP-95-As a user, I should able to restore a removed client.
                    if (data.warningMessage.includes('restore the client')) {
                          setClientContactToRestore(newValue);
                          setRestoreDialogOpen(true);
                      }
                    } else {
                        // Contact number is new
                        if(!editMode) {
                        setIsNewClient(true);
                        setContactWarning('');
                          dispatch(setClientData({ clientEmail: "" }));
                          // dispatch(setClientData({ clientName: "" }));
                          setClientAge("");
                          setDOB("");
                          setAddress("");
                          setConsultantId("");
                          setConsultantName("");
                          setConsultantNumber("");
                          setConsultantPlace("");
                          setClientPAN("");
                          setClientGST("");
                          setClientContactPerson("");
                          // setClientID("");
                          dispatch(setClientData({ clientID: "" }));
                        }
                          
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
                .then((data) => setClientNumberSuggestions(data));
        } catch (error) {
            console.error("Error suggesting client names: " + error);
        }
    } else {
        setClientNumberSuggestions([]);
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
    setClientContactPerson(value.target.value);
    if (errors.clientContactPerson) {
      setErrors((prevErrors) => ({ ...prevErrors, clientContactPerson: undefined }));
    }
  };

  // const handleDialogClose = (result) => {
  //   setProceed(result);
  //   setContactDialogOpen(false);
  // };

  const submitDetails = async(event) => {
      event.preventDefault();
    
    if(companyName !== 'Grace Scans' && dbName !== 'Grace Scans'){
      if (isEmpty === true){
      router.push('/adDetails')
    }
    const isValid = BMvalidateFields();
    if (isValid) {
      // if(clientContact === '' || clientContact === 0 ){
      //   setContactDialogOpen(true);
      //  if (!proceed){
      //   return
      //  }
      // }
      // Ensure we only check for similar names once
      if (shouldCheckForSimilarConsultantNames) {
        setShouldCheckForSimilarConsultantNames(false); // Prevent re-checking
        if (clientSource === "Consultant" || clientSource === "5.Consultant") {
          const similarNamesFound = await checkForSimilarNames();
          if (similarNamesFound) {
            setSimilarConsultantDialogOpen(true);
            return; // Stop execution here until the user makes a choice
          }
        }
      }
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertNewEnquiryTest.php/?JsonUserName=${loggedInUser}&JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonSource=${clientSource}&JsonAge=${clientAge}&JsonDOB=${DOB}&JsonAddress=${address}&JsonDBName=${companyName}&JsonTitle=${selectedOption}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantNumber}&JsonConsultantPlace=${consultantPlace}&JsonClientGST=${clientGST}&JsonClientPAN=${clientPAN}&JsonIsNewClient=${isNewClient}&JsonClientID=${clientID}&JsonClientContactPerson=${clientContactPerson}&JsonGender=${gender}`)
      const data = await response.json();
      
      if (data.message === "Values Inserted Successfully!") {
                setSuccessMessage('Client Details Are Saved!');
                dispatch(setClientData({ consultantId: data.CId }));
                setTimeout(() => {
                setSuccessMessage('');
                if (isDetails) {
                  router.push('/adDetails')
                  dispatch(setQuotesData({currentPage: "checkout"}))
                } else {
                  if (!elementsToHide.includes('QuoteSenderNavigation')) {
                    router.push('/adDetails')
                    dispatch(setQuotesData({currentPage: ""}))
                  }
                }
              }, 2000);
            // router.push('/adDetails')
            
            
          // window.location.reload();
          // dispatch(resetQuotesData())
          
          
        // setMessage(data.message);
      } else if (data.message  === "Duplicate Entry!"){
        setToastMessage('Contact Number Already Exists!');
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
      } else {
        alert(`The following error occurred while inserting data: ${data.message }`);
      }

    } catch (error) {
      console.error('Error while data BM:', error);
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
      // if (clientContact === '' || clientContact === 0) {
      //   setContactDialogOpen(true);
      // if (!proceed) return;
      // }
      // Ensure we only check for similar names once
      if (shouldCheckForSimilarConsultantNames) {
        setShouldCheckForSimilarConsultantNames(false); // Prevent re-checking
        if (clientSource === "Consultant" || clientSource === "5.Consultant") {
          const similarNamesFound = await checkForSimilarNames();
          if (similarNamesFound) {
            setSimilarConsultantDialogOpen(true);
            return; // Stop execution here until the user makes a choice
          }
        }
      }
    try {
      const age = selectedOption.toLowerCase().includes('baby') || selectedOption.toLowerCase().includes('b/o.') ? months : clientAge;
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertNewEnquiryTest.php/?JsonUserName=${loggedInUser}&JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonSource=${clientSource}&JsonAge=${age}&JsonDOB=${DOB}&JsonAddress=${address}&JsonDBName=${companyName}&JsonTitle=${selectedOption}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantNumber}&JsonConsultantPlace=${consultantPlace}&JsonClientGST=${clientGST}&JsonClientPAN=${clientPAN}&JsonIsNewClient=${isNewClient}&JsonClientID=${clientID}&JsonClientContactPerson=${clientContactPerson}&JsonGender=${gender}`)
      const data = await response.json();

      if (data.message === "Values Inserted Successfully!") {
        setSuccessMessage('Client Details Are Saved!');
        dispatch(setClientData({ consultantId: data.CId }));
        setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
    setIsNewClient(false);
    // fetchClientDetails(clientContact, clientName);
    router.push('/Create-Order');
          // window.location.reload();
        
        //setMessage(data.message);
      } else if (data.message === "Duplicate Entry!"){
        setToastMessage('Contact Number Already Exists!');
        setSeverity('error');
        setToast(true);
        setTimeout(() => {
          setToast(false);
        }, 2000);

      // } else if (data === "Consultant Number Already Exists!"){
      //   setToastMessage('Consultant Number Already Exists!');
      //   setSeverity('error');
      //   setToast(true);
      //   setTimeout(() => {
      //     setToast(false);
      //   }, 2000);

    } else {
      setToastMessage(data.message);
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    }

  }catch (error) {
        console.error('Error while data GS: ', error);
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
  if( event.target.value < 121) {
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
    const formattedDOB = parseDateFromDB(dob);
    setDOB(dob);
    setDisplayDOB(formattedDOB);
  }

  if (errors.ageAndDOB) {
    setErrors((prevErrors) => ({ ...prevErrors, ageAndDOB: undefined }));
  }
// } else {
//   setErrors({ ...errors, ageAndDOB: true });
}
};


const handleDateChange = (e) => {
  const dateValue = e.target.value;
  setDisplayDOB(dateValue);
  const formattedDate = formatDateToSave(e.value);
  setDOB(formattedDate);
  const age = calculateAge(formattedDate);
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
function formatDateToSave(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function parseDateFromDB(dateString) {
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day);
}



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
    const formattedDOB = parseDateFromDB(dateFromMonths);
    setDisplayDOB(formattedDOB);
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
          handleEditMode();
          // dispatch(setClientData({ clientEmail: "" }));
          // dispatch(setClientData({ clientName: "" }));
          // dispatch(setClientData({ clientContact: "" }));
          // dispatch(setClientData({clientSource: ""}));
          // setClientAge("");
          // setDOB("");
          // setAddress("");
          // setConsultantName("");
          // dispatch(setClientData({ consultantName: clientDetails.consname || "" }));
          // setConsultantNumber("");
          // setConsultantPlace("");
          // setClientPAN("");
          // setClientGST("");
          // setClientContactPerson("");
          // // setClientID("");
          // dispatch(setClientData({ clientID: "" }));
          // setIsNewClient(true);
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
          FetchClientDetailsByContact(clientContactToRestore);
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

  // if (!clientContact) errors.clientContact = 'Contact Number is required';
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

  if (!gender) errors.gender = 'Client Gender is required';
  // if ((clientSource === 'Consultant' || clientSource === '5.Consultant') && (!consultantName || !consultantNumber)) {
  //   if (!consultantName) errors.consultantName = 'Consultant Name is required';
  //   if (!consultantNumber) errors.consultantNumber = 'Consultant Contact is required';
  // }

  if ((clientSource === 'Consultant' || clientSource === '5.Consultant') && (!consultantName)) {
    if (!consultantName) errors.consultantName = 'Consultant Name is required';
  }
  
  // if (selectedOption === 'Ms.' && !clientContactPerson) {
  //   errors.clientContactPerson = 'Contact Person Name is required';
  // }
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

  // if (!clientContact) errors.clientContact = 'Contact Number is required';
  // if (!clientContact || clientContact.length !== 10) {
  //   errors.clientContact = 'Client contact must be exactly 10 digits.';
  // }
  if (!clientName) errors.clientName = 'Client Name is required';
  if (!isValidEmail(clientEmail) && clientEmail) errors.clientEmail = 'Invalid email format';
  if (clientSource === 'Consultant' || clientSource === '5.Consultant' && !consultantName) errors.consultantName = 'Consultant Name is required';
  // if ((clientSource === 'Consultant' || clientSource === '5.Consultant') && (!consultantNumber || consultantNumber.length !== 10)) {
  //   if (!consultantNumber) {
  //     errors.consultantNumber = 'Consultant contact is required.';
  //   } else if (consultantNumber.length !== 10) {
  //     errors.consultantNumber = 'Consultant contact must be exactly 10 digits.';
  //   }
  // }
  // if (selectedOption === 'Ms.' && !clientContactPerson) {
  //   errors.clientContactPerson = 'Contact Person Name is required';
  // }
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

  const handleEditMode = () => {
    // Clear the contact warning
    setContactWarning('');
  
    // Reset client data fields
    dispatch(resetClientData());
  
    // Reset other client-related fields
    setClientAge("");
    setDOB("");
    setDisplayDOB("");
    setAddress("");
    setConsultantId("");
    setConsultantName("");
    setConsultantNumber("");
    setConsultantPlace("");
    setClientPAN("");
    setClientGST("");
    setClientContactPerson("");

    setDisplayClientID("");
    setDisplayClientName("");
    setDisplayClientNumber("");

    // Set edit mode and any other necessary state changes
    setEditMode(true);
    setIsNewClient(true);

    if (elementsToHide.includes("ClientGSTInput")) {
      setSelectedOption(titleOptions[2].value);
      setGender(genderOptions[1]);
    } else {
      setSelectedOption(titleOptions[3].value);
      setGender(genderOptions[1]);
    }

    setSimilarConsultantNames([]);
    setSimilarConsultantDialogOpen(false);
    setShouldCheckForSimilarConsultantNames(true);

    // Focus on the name input field
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 0);  
  };

    return (
      <div className='min-h-screen bg-gray-100 mb-14 p-2'>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-6xl">
            <div className="text-start">
              <h2 className="text-2xl mt-3 sm:mt-20 font-bold text-blue-500 mb-1">Client Manager</h2>
              <div className="border-2 w-10 mb-6 border-blue-500"></div>
            </div>
                {/* Buttons */}
    {/* <div className="text-center">
      
      {clientID === '' ? (
        <button
          className="add-button"
          onClick={submitDetails}
        >
          Add
        </button>
      ) : (
        <div className="flex space-x-2">
          <button
            className="Update-button"
            onClick={submitDetails}
          >
            Update
          </button>
          <button
            className="remove-button"
            onClick={handleRemoveClient}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  </div>
</div> */}
      </div></div>
        <div className="flex items-center justify-center ">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl">
        
        {/* <p className="text-gray-400 text-sm mb-3">Please fill in the following details</p> */}
        
        {!isNewClient && clientID && (
  <div className="w-fit bg-blue-50 border border-blue-200 rounded-lg mb-4 flex items-center shadow-md -ml-2 sm:ml-0">
    <button 
      className="bg-blue-500 text-white font-medium text-sm md:text-base px-3 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 mr-2 text-nowrap"
      onClick={handleEditMode}
    >
      Exit Edit
    </button>
    <div className="flex flex-row text-left text-sm md:text-base pr-2">
      <p className="text-gray-600 font-semibold">{displayClientID}</p>
      <p className="text-gray-600 font-semibold mx-1">-</p>
      <p className="text-gray-600 font-semibold">{displayClientName}</p>
      <p className="text-gray-600 font-semibold mx-1">-</p>
      <p className="text-gray-600 font-semibold">{displayClientNumber}</p>
    </div>
  </div>
)}

        <form className="space-y-6">
          {/* Restore client dialog */}
          <Dialog 
  open={restoreDialogOpen} 
  onClose={() => setRestoreDialogOpen(false)} 
  className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
>
  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg sm:max-w-md">
    <DialogTitle className="text-lg font-semibold text-gray-900 text-center sm:text-left">
      Restore Client
    </DialogTitle>
    <DialogContent className="mt-2">
      <DialogContentText className="text-gray-600 text-sm text-center sm:text-left">
        This record appears to be a duplicate. Would you like to restore the existing record?
      </DialogContentText>
    </DialogContent>
    <DialogActions className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
      <button 
        onClick={() => setRestoreDialogOpen(false)} 
        className="w-full sm:w-auto px-5 py-2 text-gray-700 bg-gray-200 rounded-full font-medium hover:bg-gray-300 transition duration-200 ease-in-out shadow-sm active:scale-95 focus:ring-2 focus:ring-gray-400"
      >
        No
      </button>
      <button 
        onClick={handleRestoreClient} 
        className="w-full sm:w-auto px-5 py-2 text-white bg-green-600 rounded-full font-medium hover:bg-green-700 transition duration-200 ease-in-out shadow-md active:scale-95 focus:ring-2 focus:ring-green-400"
        autoFocus
      >
        Yes
      </button>
    </DialogActions>
  </div>
</Dialog>



          {/* Similar Consultants dialog */}
          <Dialog 
  open={similarConsultantDialogOpen} 
  onClose={() => setSimilarConsultantDialogOpen(false)} 
  className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
>
  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg sm:max-w-md">
    <DialogTitle className="text-lg font-semibold text-gray-900 text-center sm:text-left">
      Similar Consultant Names Found
    </DialogTitle>
    <DialogContent className="mt-2">
      <DialogContentText className="text-gray-600 text-sm text-center sm:text-left">
        The following similar consultant names were found in the database:
      </DialogContentText>
      <ul className="mt-3 space-y-2 text-sm font-medium text-gray-800 text-center sm:text-left">
  {similarConsultantNames.map((consultant, index) => (
    <li
      key={index}
      className="p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition"
      onClick={() => {
        setConsultantId(consultant.CId);
        setConsultantName(consultant.ConsultantName);
        setConsultantNumber(consultant.ConsultantNumber || '');
        setConsultantPlace(consultant.ConsultantPlace || '');

        dispatch(setClientData({ consultantId: consultant.CId }));
        dispatch(setClientData({ consultantName: consultant.ConsultantName}));
        dispatch(setClientData({ consultantNumber: consultant.ConsultantNumber || '' }));
        dispatch(setClientData({ consultantPlace: consultant.ConsultantPlace || '' }));

        setSimilarConsultantDialogOpen(false); // Close the dialog
        setShouldCheckForSimilarConsultantNames(false); // Prevent rechecking on next submit
      }}
    >
      {consultant.ConsultantName} - {consultant.ConsultantNumber} - {consultant.ConsultantPlace}
    </li>
  ))}
</ul>

      <p className="mt-4 text-gray-700 font-medium text-center sm:text-left">
      Do you want to continue with the selected consultant?
      </p>
    </DialogContent>
    <DialogActions className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
      <button 
        onClick={(e) => {
          setSimilarConsultantDialogOpen(false);
          setShouldCheckForSimilarConsultantNames(true);
        }} 
        className="w-full sm:w-auto px-5 py-2 text-gray-700 bg-gray-200 rounded-full font-medium hover:bg-gray-300 transition duration-200 ease-in-out shadow-sm active:scale-95 focus:ring-2 focus:ring-gray-400"
      >
        No
      </button>
      <button 
        onClick={async (e) => {
          setSimilarConsultantDialogOpen(false); // Close dialog first
          await new Promise((resolve) => setTimeout(resolve, 50)); // Short delay to ensure closure
          setShouldCheckForSimilarConsultantNames(false);
          submitDetails(e);
        }} 
        className="w-full sm:w-auto px-5 py-2 text-white bg-blue-600 rounded-full font-medium hover:bg-blue-700 transition duration-200 ease-in-out shadow-md active:scale-95 focus:ring-2 focus:ring-blue-400"
        autoFocus
      >
        Yes
      </button>
    </DialogActions>
  </div>
</Dialog>


          {/* Contact dialog */}
          {/* <Dialog open={contactDialogOpen} onClose={() => handleDialogClose(false)}>
            <DialogTitle>No Contact Number Detected</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Client Contact is not entered. Do you want to proceed?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleDialogClose(false)} color="primary">
                No
              </Button>
              <Button onClick={() => handleDialogClose(true)} color="primary">
                Yes
              </Button>
            </DialogActions>
          </Dialog> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left section */}
            <div className="space-y-4">
          <div className="relative">
          <label className="block mb-1 text-black font-medium">Name<span className="text-red-500">*</span></label>
          <div className="flex space-x-2" name="ClientNameInput">
            <Dropdown
              value={selectedOption}
              options={titleOptions}
              onChange={(e) => {
                const selectedTitle = e.target.value;
                setSelectedOption(e.target.value);
                dispatch(setClientData({clientTitle: e.target.value}));

                const matchedTitle = titleOptions.find(option => option.value === selectedTitle);
                setGender(matchedTitle ? matchedTitle.gender || '' : '');
              }}
              className={`w-1/3 sm:w-1/4 text-black border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.clientName ? 'border-red-400' : ''} overflow-visible`}
              id="1"
              name="TitleSelect"
            />
            <input
              type="text"
              className={`w-2/3 sm:w-3/4 text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.clientName ? 'border-red-400' : ''}`}
              placeholder="Name"
              id="2"
              name="ClientNameInput"
              maxLength={64}
              value={clientDetails.clientName}
              onChange={handleSearchTermChange}
              onBlur={() => {
                setTimeout(() => {
                  setClientNameSuggestions([]);
                }, 200); // Adjust the delay time according to your preference
              }}
              onFocus={e => e.target.select()}
              ref={nameInputRef}
              // onKeyPress={(e) => {
              //   // Allow only alphabetic characters
              //   const regex = /^[a-zA-Z\s]*$/;
              //   if (!regex.test(e.key)) {
              //     e.preventDefault();
              //   }
              // }}
            />
          </div>
          {(clientNameSuggestions.length > 0 && clientDetails.clientName !== "") && (
            <ul className={`list-none bg-white shadow-lg rounded-md mt-2 overflow-y-scroll ${
              clientNameSuggestions.length > 5 ? 'h-40' : 'h-fit'
            }`}>
            {clientNameSuggestions.map((name, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                  onClick={handleClientNameSelection}
                  value={name}
                >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors.clientName && <p className="text-red-500 text-xs">{errors.clientName}</p>}
        </div>

              {selectedOption === 'Ms.' ? (
                <div name="ClientContactPersonInput">
                  <label className="block mb-1 text-black font-medium">Contact Person Name<span className="text-red-500">*</span></label>
                  <input
                    className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.clientContactPerson ? 'border-red-400' : ''}`}
                    type="text"
                    placeholder="Contact Person Name"
                    id="30"
                    name="ClientContactPersonInput"
                    value={clientDetails.clientContactPerson}
                    onChange={handleClientContactPersonChange}
                    onFocus={e => e.target.select()}
                  />
                  {errors.clientContactPerson && <p className="text-red-500 text-xs">{errors.clientContactPerson}</p>}
                </div>
              ) : (
                <></>
              )}
              <div className="relative" name="ClientContactInput">
            <label className="block mb-1 text-black font-medium">Contact Number</label>
            <input
              type="number"
              className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.clientContact ? 'border-red-400' : ''}`}
              placeholder="Contact Number"
              id="3"
              name="ClientContactInput"
              value={clientContact}
              onFocus={e => e.target.select()}
              onChange={(e) => {
                if (e.target.value.length <= 10) {
                  handleClientContactChange(e.target.value);
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  setClientNameSuggestions([]);
                  setContactWarning('');
                  if (clientContact.length === 10 && !isNewClient) {
                    FetchClientDetailsByContact(clientContact);
                  } else{
                    setClientNumberSuggestions([]);
                  }
                }, 200);
              }}
            />
            {(clientNumberSuggestions.length > 0 && clientContact !== "") && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                {clientNumberSuggestions.map((name, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                      onClick={handleClientNameSelection}
                      value={name}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {/* {contactWarning && <p className="text-red-500 text-xs">{contactWarning}</p>} */}
            {errors.clientContact && <p className="text-red-500 text-xs">{errors.clientContact}</p>}
          </div>
              <div name="ClientEmailInput">
                <label className="block mb-1 text-black font-medium">Email</label>
                <input
                  className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.clientEmail ? 'border-red-400' : ''}`}
                  type="email"
                  placeholder="Email"
                  id="4"
                  name="ClientEmailInput"
                  value={clientEmail}
                  onFocus={e => e.target.select()}
                  onChange={(e) => handleClientEmailChange(e.target.value)}
                />
                {emailWarning && <p className="text-red-500 text-xs">{emailWarning}</p>}
                {errors.clientEmail && <p className="text-red-500 text-xs">{errors.clientEmail}</p>}
              </div>
            </div>
            {/* Middle section */}
            <div className="mt-0">
              <div name="ClientAddressTextArea">
                <label className="block text-black mb-1 font-medium">Address</label>
                <textarea
                  className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 h-10`}
                  id="7"
                  name="ClientAddressTextArea"
                  placeholder="Address"
                  value={address}
                  onFocus={e => e.target.select()}
                  onChange={e => setAddress(e.target.value) }
                />
              </div>
              {selectedOption !== 'B/o.' && selectedOption !== 'Baby.' ? (
                
                <div className="flex space-x-2 mt-3" name="ClientAgeInput">
                  
                  <div className="w-1/2">
                    <label className="block mb-1 text-black font-medium">Age<span className="text-red-500">*</span></label>
                    <input
                      className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.ageAndDOB ? 'border-red-400' : ''}`}
                      type="number"
                      id="5"
                      name="ClientAgeInput"
                      placeholder="Age"
                      value={clientAge}
                      onChange={handleInputAgeChange}
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block mb-1 text-black font-medium">Birthdate<span className="text-red-500">*</span></label>
                    <div>
                  <div name="AgeDatePicker">
                    <Calendar
                      type="date"
                      name="AgeDatePicker"
                      id="6"
                      value={displayDOB}
                      onChange={handleDateChange}
                      placeholder="dd-M-yyyy"
                      showIcon
                      dateFormat='dd-M-yy'
                      className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.ageAndDOB ? 'border-red-400' : ''}`}
                      inputClassName="p-inputtext-lg"
                    />
                  </div>
                   </div>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2 mt-3">
                  
                  <div className="w-1/2" name="MonthsInput">
                    <label className="block mb-1 text-black font-medium">Months<span className="text-red-500">*</span></label>
                    <input
                      className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.ageAndDOB ? 'border-red-400' : ''}`}
                      type="number"
                      name="MonthsInput"
                      placeholder="Months"
                      value={months}
                      onChange={handleMonthsChange}
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block mb-1 text-black font-medium">Birthdate<span className="text-red-500">*</span></label>
                    <div>
                  <div name="AgeDatePicker">
                    <Calendar
                      type="date"
                      name="AgeDatePicker"
                      id="6"
                      value={displayDOB}
                      onChange={handleDateChange}
                      placeholder="dd-M-yyyy"
                      showIcon
                      dateFormat='dd-M-yy'
                      className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.ageAndDOB ? 'border-red-400' : ''}`}
                      inputClassName="p-inputtext-lg"
                    />
                  </div>
                   </div>
                  </div>
                  
                  </div>
                  
              )}
              {errors.ageAndDOB && <p className="text-red-500 text-xs">{errors.ageAndDOB}</p>}
              {errors.months && <p className="text-red-500 text-xs">{errors.months}</p>}
              <div>
              </div>
              <div className="mt-4" name="ClientAgeInput">
                <label className="block mb-1 text-black font-medium">Gender<span className="text-red-500">*</span></label>
                <Dropdown
                  className={`w-full text-black border rounded-lg ${errors.gender ? 'border-red-400' : ''}`}
                  options={genderOptions}
                  value={gender}
                  placeholder='Select a Gender'
                  onChange={e => {
                    setGender(e.target.value);
                    if (errors.gender) {
                      setErrors(prevErrors => ({ ...prevErrors, gender: undefined }));
                    }
                  }}
                />
                {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
              </div>
              <div className="mt-3" name="ClientGSTInput">
              <div>
                <label className="block mb-1 text-black font-medium">GST Number</label>
                <input
                  className={`w-full text-black mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.clientGST ? 'border-red-400' : ''}`}
                  placeholder="GST Number"
                  id="31"
                  name="ClientGSTInput"
                  value={clientGST}
                  maxLength={15}
                  onChange={handleGSTChange}
                />
                {errors.clientGST && <p className="text-red-500 text-xs">{errors.clientGST}</p>}
              </div>
                <label className="block mb-1 text-black font-medium">PAN Number</label>
                <input
                  className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.clientPAN ? 'border-red-400' : ''}`}
                  placeholder="PAN Number"
                  id="32"
                  name="ClientPANInput"
                  value={clientPAN}
                  maxLength={10}
                  onChange={(e) => setClientPAN(e.target.value)}
                />
                {errors.clientPAN && <p className="text-red-500 text-xs">{errors.clientPAN}</p>}
              </div>
            </div>
            {/* Right section */}
            <div className="space-y-4">
              <div name="ClientSourceSelect">
                <label className="block mb-1 text-black font-medium">Source<span className="text-red-500">*</span></label>
                <Dropdown
                  className={`w-full text-black border rounded-lg ${errors.clientSource ? 'border-red-400' : ''}`}
                  id="8"
                  name="ClientSourceSelect"
                  options={sources}
                  value={clientSource}
                  defaultValue=""
                  placeholder='Select a Source'
                  onChange={handleClientSourceChange}
                />
              </div>
              {errors.clientSource && <p className="text-red-500 text-xs">{errors.clientSource}</p>}
              {(clientSource === '5.Consultant' || clientSource === 'Consultant') && (
                <>
                  <div className="relative" name="ConsultantNameInput">
                  <label className="block mb-1 text-black font-medium">Consultant Name<span className="text-red-500">*</span></label>
                  <input
                    className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.consultantName ? 'border-red-400' : ''}`}
                    type="text"
                    placeholder="Consultant Name"
                    id="9"
                    name="ConsultantNameInput"
                    onChange={handleConsultantNameChange}
                    value={consultantName}
                    onBlur={() => {
                      setTimeout(() => {
                        setConsultantNameSuggestions([]);
                      }, 200);
                    }}
                    onKeyPress={(e) => {
                      // Allow only alphabetic characters
                      const regex = /^[a-zA-Z\s]*$/;
                      if (!regex.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {consultantNameSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                      {consultantNameSuggestions.map((name, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                            onClick={handleConsultantNameSelection}
                            value={name}
                          >
                            {name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.consultantName && <p className="text-red-500 text-xs">{errors.consultantName}</p>}
                </div>

                  <div name="ConsultantNumberInput">
                    <label className="block mb-1 text-black font-medium">Consultant Number</label>
                    <input
                      className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.consultantNumber ? 'border-red-400' : ''}`}
                      type="number" 
                      placeholder="Consultant Number" 
                      id="10" 
                      name="ConsultantNumberInput" 
                      value={consultantNumber} 
                      // onChange={handleConsultantNumberChange} 
                      onChange={(e) => {
                        if (e.target.value.length <= 10) {
                          handleConsultantNumberChange(e.target.value);
                        }
                      }}
                      
                    />
                    {consulantWarning && <p className="text-red-500">{consulantWarning}</p>}
                    {errors.consultantNumber && <p className="text-red-500 text-xs">{errors.consultantNumber}</p>}
                  </div>
                  <div name="ConsultantPlaceInput">
                  <label className="block mb-1 text-black font-medium">Consultant Place</label>
                  <input
                    className="w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300"
                    type="text"
                    placeholder="Consultant Place"
                    id="11"
                    name="ConsultantPlaceInput"
                    value={consultantPlace}
                    onChange={(e) => setConsultantPlace(e.target.value)}
                  />
                </div>
                </>
              )}
            </div>
          </div>
          <div className="text-center">
            {/* MP-71-Rename “Submit” button to “Add” and “Update” based on client existence */}
            {clientID === '' ? (
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded-lg"
                onClick={submitDetails}
              >
                Add
              </button>
            ) : (
              <div className="relative">
                <button
                  className="px-6 py-2 mr-3 bg-blue-500 text-white rounded-lg w-fit"
                  onClick={submitDetails}
                >
                  Update
                </button>
                <button
                  className="px-6 py-2 bg-red-500 text-white rounded-lg w-fit"
                  onClick={handleRemoveClient}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
      </div>
      {successMessage && <SuccessToast message={successMessage} />}
      {toast && <ToastMessage message={toastMessage} type="error"/>}
    </div>
  );
};

export default ClientsData;
