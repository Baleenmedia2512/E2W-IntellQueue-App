import { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const CustomToast = () => {
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToastMessage = (severityStatus, toastMessageContent) => {
    setSeverity(severityStatus)
    setToastMessage(toastMessageContent)
    setToast(true)
  }

  return(
    <div className='bg-surface-card p-8 rounded-2xl mb-4'>
        <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
          <MuiAlert severity={severity} onClose={() => setToast(false)}>
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </div>
  )
}

export default CustomToast;