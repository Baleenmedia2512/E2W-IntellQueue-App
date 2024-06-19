export async function fetchNextQuoteNumber() {
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchNextQuoteNumber.php`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return 0; // Default value in case of an error
    }
  }  