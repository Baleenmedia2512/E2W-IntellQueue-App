export const checkClientContact = async (clientContact) => {
    try {
      const response = await fetch("https://orders.baleenmedia.com/API/Hospital-Form/CheckClientContact.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            phoneNumber: clientContact,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} - ${errorData.error || "Unknown error"}`);
      }
  
      const data = await response.json();
      if (data.exists) {
        return true; // Contact already exists
      } else {
        return false; // Contact does not exist
      }
    } catch (error) {
      alert("Failed to check contact. Please try again.");
    }
  };