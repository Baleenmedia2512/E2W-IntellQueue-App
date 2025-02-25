import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTimeElapsed, resetTime } from "/redux/features/time-slice"; // Adjust the path if needed

const useTimeTracker = () => {
  const dispatch = useDispatch();
  const timeTaken = useSelector((state) => state.timeSlice.timeElapsed);
  const timerRef = useRef(null);
  const [isTracking, setIsTracking] = useState(false);

  const startTimer = () => {
    if (!timerRef.current) {
      let elapsedSeconds = 0;
      dispatch(setTimeElapsed(elapsedSeconds));
      
      timerRef.current = setInterval(() => {
        elapsedSeconds += 1;
        dispatch(setTimeElapsed(elapsedSeconds));
      }, 1000);

      setIsTracking(true);
      console.log("Timer started");
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsTracking(false);
      // console.log("Timer stopped");
    }
  };

  const handleUserInteraction = (event) => {
    const tag = event.target.tagName.toLowerCase();
    const isDownloadButton = event.target.closest("button")?.textContent.includes("Download Quote");
  
    if (isDownloadButton) {
      stopTimer();
    } else if (["input", "textarea", "select"].includes(tag)) {
      if (!isTracking) {
        startTimer();
      }
    }
  };
  

  useEffect(() => {
    document.addEventListener("click", handleUserInteraction);
    return () => {
      document.removeEventListener("click", handleUserInteraction);
      stopTimer();
    };
  }, []);

  const resetTimeTracker = () => {
    console.log("Resetting timer");
    dispatch(resetTime());
    stopTimer();
  };

  const stopTimerOnPdfGeneration = () => {
    console.log("Stopping timer due to PDF generation");
    stopTimer();
  };

  return { timeTaken, resetTime: resetTimeTracker, stopTimerOnPdfGeneration };
};

export default useTimeTracker;
