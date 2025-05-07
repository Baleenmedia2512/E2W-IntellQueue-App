// Mock API for lead integration
import { faker } from '@/app/utils/faker'; // Using a simplified faker implementation

// Function to generate a random date within last 14 days
const getRandomRecentDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 14); // Random day in the last 14 days
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Generate mock lead data
const generateMockLeads = (count) => {
  const sources = ['JustDial', 'LinkedIn', 'Apollo', 'Email - Gmail', 'Email - Attachment'];
  const statuses = ['new', 'duplicate', 'imported'];
  const specializations = ['Digital Marketing', 'Web Development', 'Mobile App Development', 'Graphic Design', 'Content Writing'];
  const tags = ['Justdial', 'LinkedIn', 'Apollo', 'Verified', 'Specialist', 'HighValue'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    phone: faker.phone.number(),
    email: faker.internet.email(),
    source: sources[Math.floor(Math.random() * sources.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    specialization: Math.random() > 0.3 ? specializations[Math.floor(Math.random() * specializations.length)] : null,
    location: Math.random() > 0.2 ? faker.address.city() : null,
    createdAt: getRandomRecentDate(),
    tags: Math.random() > 0.5 ? [tags[Math.floor(Math.random() * tags.length)]] : [],
    notes: Math.random() > 0.7 ? faker.lorem.sentence() : null
  }));
};

// Simulated API endpoint to fetch leads
export const mockFetchLeads = async (companyName) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate between 15-30 mock leads
  const count = Math.floor(Math.random() * 16) + 15;
  const leads = generateMockLeads(count);
  
  return {
    success: true,
    leads
  };
};

// Simulated API to fetch email accounts
export const mockFetchEmailAccounts = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    accounts: [
      {
        id: 1,
        name: 'Sales Inbox',
        email: 'sales@example.com',
        provider: 'gmail',
        isConnected: true,
        lastSync: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Marketing',
        email: 'marketing@example.com',
        provider: 'outlook',
        isConnected: false,
        lastSync: null
      }
    ]
  };
};

// Simulated API to add a tag to a lead
export const mockAddTag = async (leadId, tag) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: `Tag "${tag}" added to lead #${leadId}`
  };
};

// Simulated API to remove a duplicate lead
export const mockRemoveDuplicate = async (leadId) => {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return {
    success: true,
    message: `Lead #${leadId} marked as removed`
  };
};

// Simulated API to import a lead to the Lead Manager
export const mockImportToLeadManager = async (leadId) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: `Lead #${leadId} imported to Lead Manager successfully`
  };
};