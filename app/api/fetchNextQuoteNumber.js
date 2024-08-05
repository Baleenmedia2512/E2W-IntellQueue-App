export async function fetchNextQuoteNumber(DBName) {
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchNextQuoteNumber.php/?JsonDBName=${DBName}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return 0; // Default value in case of an error
    }
  }  