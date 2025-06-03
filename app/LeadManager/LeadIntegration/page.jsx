'use client'
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExternalLinkAlt, faCheckCircle, faPlusCircle, faSync, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FaJsSquare, FaPython, FaNode, FaLinkedin, FaEnvelope, FaIdCard, FaFileExcel, FaFilePdf, FaRegSnowflake, FaCogs } from 'react-icons/fa';
import { AiOutlineApi, AiOutlineRobot, AiOutlineTable, AiOutlineMail, AiOutlineCloudDownload, AiOutlineTags } from 'react-icons/ai';
import { BiTime } from 'react-icons/bi';
import { GiCampfire } from 'react-icons/gi';
import { MdOutlineWbSunny } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import SourceCard from './components/SourceCard';
import LeadTable from './components/LeadTable';
import EmailConfig from './components/EmailConfig';
import PlatformIntegration from './components/PlatformIntegration';
import { mockFetchLeads } from './api/mockApi';
import { toTitleCase } from '../page';
import LoadingComponent from '../progress';
import ToastMessage from '@/app/components/ToastMessage';
import SuccessToast from '@/app/components/SuccessToast';

const LeadIntegrationPage = () => {
  const router = useRouter();
  const { userName, appRights, companyName: userCompanyName } = useAppSelector(state => state.authSlice);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [severity, setSeverity] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sourceStats, setSourceStats] = useState({
    justdial: { total: 0, recent: 0 },
    linkedin: { total: 0, recent: 0 },
    apollo: { total: 0, recent: 0 },
    email: { total: 0, recent: 0 }
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    if (!userName || !userCompanyName) {
      router.push('/login');
      return;
    }
    
    fetchLeads();
  }, [userName, userCompanyName, router]);
  
  useEffect(() => {
    if (leads.length > 0) {
      // Filter leads based on search term and filter status
      const filtered = leads.filter(lead => {
        const matchesSearch = searchTerm === '' || 
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.location.toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      });
      
      setFilteredLeads(filtered);
    }
  }, [leads, searchTerm, filterStatus]);
  
  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Using mock API for demonstration
      const response = await mockFetchLeads(userCompanyName);
      setLeads(response.leads);
      
      // Calculate stats
      const stats = {
        justdial: { total: 0, recent: 0 },
        linkedin: { total: 0, recent: 0 },
        apollo: { total: 0, recent: 0 },
        email: { total: 0, recent: 0 }
      };
      
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      response.leads.forEach(lead => {
        const source = lead.source.toLowerCase();
        const leadDate = new Date(lead.createdAt);
        
        if (source.includes('justdial')) {
          stats.justdial.total++;
          if (leadDate >= oneDayAgo) stats.justdial.recent++;
        } else if (source.includes('linkedin')) {
          stats.linkedin.total++;
          if (leadDate >= oneDayAgo) stats.linkedin.recent++;
        } else if (source.includes('apollo')) {
          stats.apollo.total++;
          if (leadDate >= oneDayAgo) stats.apollo.recent++;
        } else if (source.includes('email')) {
          stats.email.total++;
          if (leadDate >= oneDayAgo) stats.email.recent++;
        }
      });
      
      setSourceStats(stats);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setToastMessage('Failed to fetch leads. Please try again.');
      setSeverity('error');
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLeads();
    setSuccessMessage('Leads refreshed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
    setIsRefreshing(false);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTagLead = async (leadId, tag) => {
    // Mock implementation to add/update tag
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const existingTags = lead.tags || [];
        if (existingTags.includes(tag)) {
          return lead; // Tag already exists
        }
        return {
          ...lead,
          tags: [...existingTags, tag]
        };
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    setSuccessMessage(`Lead tagged as ${tag} successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const handleRemoveDuplicate = async (leadId) => {
    // Mock implementation to remove duplicate
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    setLeads(updatedLeads);
    setSuccessMessage('Duplicate lead removed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const handleImportToLeadManager = async (leadId) => {
    // Mock implementation to import to lead manager
    setSuccessMessage('Lead imported to Lead Manager successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  if (loading) {
    return <LoadingComponent />;
  }
  
  return (
    <div className="p-4 bg-gray-50 min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/LeadManager')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-blue-600" />
          </button>
          <h1 className="text-2xl font-bold text-blue-600">
            Multi-Platform Lead Integration
          </h1>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FontAwesomeIcon icon={faSync} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex mb-6 border-b">
        <button
          className={`py-3 px-6 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`py-3 px-6 ${activeTab === 'integrations' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600'}`}
          onClick={() => setActiveTab('integrations')}
        >
          Platform Integrations
        </button>
        <button
          className={`py-3 px-6 ${activeTab === 'email' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600'}`}
          onClick={() => setActiveTab('email')}
        >
          Email Configuration
        </button>
        <button
          className={`py-3 px-6 ${activeTab === 'settings' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SourceCard 
              title="JustDial" 
              icon={<AiOutlineApi className="text-orange-500 text-2xl" />}
              total={sourceStats.justdial.total}
              recent={sourceStats.justdial.recent}
              color="orange"
            />
            <SourceCard 
              title="LinkedIn" 
              icon={<FaLinkedin className="text-blue-500 text-2xl" />}
              total={sourceStats.linkedin.total}
              recent={sourceStats.linkedin.recent}
              color="blue"
            />
            <SourceCard 
              title="Apollo" 
              icon={<AiOutlineRobot className="text-purple-500 text-2xl" />}
              total={sourceStats.apollo.total}
              recent={sourceStats.apollo.recent}
              color="purple"
            />
            <SourceCard 
              title="Email" 
              icon={<FaEnvelope className="text-green-500 text-2xl" />}
              total={sourceStats.email.total}
              recent={sourceStats.email.recent}
              color="green"
            />
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
            <div className="relative flex-grow max-w-2xl">
              <input
                type="text"
                placeholder="Search by name, email, phone, specialization..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={handleSearch}
              />
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="flex items-center bg-gray-200 rounded-lg overflow-hidden">
                <button 
                  className={`px-3 py-2 ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button 
                  className={`px-3 py-2 ${filterStatus === 'new' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  onClick={() => setFilterStatus('new')}
                >
                  New
                </button>
                <button 
                  className={`px-3 py-2 ${filterStatus === 'duplicate' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  onClick={() => setFilterStatus('duplicate')}
                >
                  Duplicates
                </button>
              </div>
            </div>
          </div>
          
          {/* Leads Table */}
          <LeadTable 
            leads={filteredLeads} 
            onTagLead={handleTagLead}
            onRemoveDuplicate={handleRemoveDuplicate}
            onImportToLeadManager={handleImportToLeadManager}
          />
        </div>
      )}
      
      {activeTab === 'integrations' && (
        <PlatformIntegration />
      )}
      
      {activeTab === 'email' && (
        <EmailConfig />
      )}
      
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <div className="divide-y">
            <div className="py-4">
              <h3 className="font-medium text-gray-900">Automated Lead Fetching</h3>
              <div className="mt-2 flex items-center">
                <select className="mr-4 border rounded py-2 px-3">
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Save Schedule
                </button>
              </div>
            </div>
            
            <div className="py-4">
              <h3 className="font-medium text-gray-900">Deduplication Settings</h3>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deduplication Method</label>
                  <select className="mt-1 block w-full border rounded py-2 px-3">
                    <option value="exact">Exact Match</option>
                    <option value="fuzzy">Fuzzy Match</option>
                    <option value="combined">Combined</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Similarity Threshold (%)</label>
                  <input 
                    type="number" 
                    min="50" 
                    max="100" 
                    defaultValue="75" 
                    className="mt-1 block w-full border rounded py-2 px-3"
                  />
                </div>
              </div>
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Save Deduplication Settings
              </button>
            </div>
            
            <div className="py-4">
              <h3 className="font-medium text-gray-900">Tag Settings</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                  #Justdial
                  <button className="ml-2 text-blue-600 hover:text-blue-800">×</button>
                </div>
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center">
                  #LinkedIn
                  <button className="ml-2 text-purple-600 hover:text-purple-800">×</button>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                  #Specialist
                  <button className="ml-2 text-green-600 hover:text-green-800">×</button>
                </div>
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center">
                  #Verified
                  <button className="ml-2 text-orange-600 hover:text-orange-800">×</button>
                </div>
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full flex items-center hover:bg-gray-300">
                  <FontAwesomeIcon icon={faPlusCircle} className="mr-1" /> Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast messages */}
      {toast && <ToastMessage message={toastMessage} type={severity} />}
      {successMessage && <SuccessToast message={successMessage} />}
    </div>
  );
};

export default LeadIntegrationPage;