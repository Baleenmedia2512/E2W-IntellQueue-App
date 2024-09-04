// pages/api/upload.js
import axios from "axios";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's body parsing so we can handle the raw request ourselves
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    // try {
      // Prepare the file data for the PHP script
      const { headers, method, body } = req;
      
      // Forward the request to your PHP server
      const response = await axios.post(
        "https://orders.baleenmedia.com/API/Media/UploadExpenseBills.php",
        body,
        {
          headers: {
            ...headers,
            'Content-Type': headers['content-type'], // Ensure we pass the correct content type
          },
        }
      );

      res.status(200).json({ message: response.data });
    // } catch (error) {
    //   console.error(error);
    //   res.status(500).json({ error: "Failed to upload file" + respone.data});
    // }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
