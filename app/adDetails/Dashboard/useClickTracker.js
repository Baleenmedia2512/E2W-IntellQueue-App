import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { incrementCount } from '/redux/features/count-slice'; // adjust the path if needed

const useClickTracker = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClick = (event) => {
      const tag = event.target.tagName.toLowerCase();

      // Only count clicks if the target is one of the desired elements
      if (['input', 'button', 'textarea', 'select'].includes(tag)) {
        dispatch(incrementCount());
      }
    };

    document.addEventListener('click', handleClick);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [dispatch]);
};

export default useClickTracker;
