import { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const CustomToast = ({ loginStatus, loginMessage }) => {
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (loginStatus !== '') {
      setSeverity(loginStatus);
      setToastMessage(loginMessage);
      setToast(true);
    }
  }, [loginStatus, loginMessage]);

  const handleClose = () => {
    setToast(false);
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-800 shadow-md p-4 rounded-md flex items-center">
    <Snackbar open={toast} autoHideDuration={6000} onClose={handleClose}>
      <MuiAlert
        elevation={6}
        variant="filled"
        severity={severity}
        onClose={handleClose}
      >
        {toastMessage}
      </MuiAlert>
    </Snackbar>
    </div>
  );
};

export default CustomToast;