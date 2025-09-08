// Client-side utility functions for mobile app
import { encryptCompanyName, decryptCompanyName } from '@/lib/encryption';

// Replace server-side generate-link functionality
export function generateEncryptedLink(companyName, baseUrl = '') {
  if (!companyName) {
    throw new Error('Missing company name');
  }
  
  const encrypted = encryptCompanyName(companyName);
  const fullUrl = `${baseUrl}/QueueSystem?ref=${encodeURIComponent(encrypted)}`;
  
  return { encryptedUrl: fullUrl };
}

// Replace server-side decrypt functionality
export function decryptCompanyData(encryptedData) {
  if (!encryptedData) {
    throw new Error('Missing encrypted data');
  }
  
  try {
    const companyName = decryptCompanyName(encryptedData);
    
    if (!companyName) {
      throw new Error('Invalid encrypted data');
    }
    
    return { companyName };
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data');
  }
}

// For push notifications in mobile app, we'll use the external API directly
export async function sendPushNotification(tokens, title, message, link = '', icon = '') {
  // In mobile app, this should call your external PHP API endpoint
  // or use Capacitor's push notification plugin
  const response = await fetch('/api/send-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: tokens,
      title,
      message,
      link,
      icon
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send notification');
  }
  
  return await response.json();
}
