import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPlus, faTrash, faSync, faEnvelope, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FaGoogle, FaMicrosoft, FaFileExcel, FaFilePdf, FaFileCsv } from 'react-icons/fa';

const EmailConfig = () => {
  const [mailboxes, setMailboxes] = useState([
    {
      id: 1,
      name: 'Sales Inbox',
      email: 'sales@yourcompany.com',
      provider: 'gmail',
      connected: true,
      lastSync: '2025-05-06T14:30:00Z',
      folderPatterns: ['Leads', 'Inquiries', 'INBOX'],
      fileTypes: ['excel', 'pdf', 'csv'],
      keywords: ['quote', 'inquiry', 'lead', 'price']
    },
    {
      id: 2,
      name: 'Marketing Inbox',
      email: 'marketing@yourcompany.com',
      provider: 'outlook',
      connected: false,
      lastSync: null,
      folderPatterns: [],
      fileTypes: [],
      keywords: []
    }
  ]);
  
  const [processingRules, setProcessingRules] = useState([
    {
      id: 1,
      name: 'Extract JustDial leads',
      pattern: 'from:justdial.com subject:"New Lead"',
      isActive: true,
      fieldMappings: {
        name: 'Customer Name: (.+)',
        phone: 'Phone: ([0-9 +]+)',
        email: 'Email: ([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
        specialization: 'Service: (.+)',
        location: 'Location: (.+)'
      }
    },
    {
      id: 2,
      name: 'Extract IndiaMart inquiries',
      pattern: 'from:indiamart.com subject:"Inquiry"',
      isActive: true,
      fieldMappings: {
        name: 'Name: (.+)',
        phone: 'Mobile: ([0-9 +]+)',
        email: 'Email: ([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
        specialization: 'Looking for: (.+)',
        location: 'City: (.+)'
      }
    }
  ]);
  
  const [editingMailbox, setEditingMailbox] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSyncNow = () => {
    setIsSyncing(true);
    // Simulate syncing
    setTimeout(() => {
      setIsSyncing(false);
      // Update last sync time
      const updatedMailboxes = mailboxes.map(mailbox => ({
        ...mailbox,
        lastSync: mailbox.connected ? new Date().toISOString() : mailbox.lastSync
      }));
      setMailboxes(updatedMailboxes);
    }, 2000);
  };
  
  const handleEditMailbox = (id) => {
    const mailbox = mailboxes.find(m => m.id === id);
    if (mailbox) {
      setEditingMailbox({...mailbox});
    }
  };
  
  const handleEditRule = (id) => {
    const rule = processingRules.find(r => r.id === id);
    if (rule) {
      setEditingRule({...rule});
    }
  };
  
  const handleSaveMailbox = () => {
    if (!editingMailbox) return;
    
    setMailboxes(mailboxes.map(mailbox => 
      mailbox.id === editingMailbox.id ? editingMailbox : mailbox
    ));
    
    setEditingMailbox(null);
  };
  
  const handleSaveRule = () => {
    if (!editingRule) return;
    
    setProcessingRules(processingRules.map(rule => 
      rule.id === editingRule.id ? editingRule : rule
    ));
    
    setEditingRule(null);
  };
  
  const handleDeleteMailbox = (id) => {
    setMailboxes(mailboxes.filter(mailbox => mailbox.id !== id));
  };
  
  const handleDeleteRule = (id) => {
    setProcessingRules(processingRules.filter(rule => rule.id !== id));
  };
  
  const handleToggleRuleActive = (id) => {
    setProcessingRules(processingRules.map(rule => 
      rule.id === id ? {...rule, isActive: !rule.isActive} : rule
    ));
  };
  
  const handleAddMailbox = () => {
    const newId = Math.max(0, ...mailboxes.map(m => m.id)) + 1;
    setEditingMailbox({
      id: newId,
      name: '',
      email: '',
      provider: 'gmail',
      connected: false,
      lastSync: null,
      folderPatterns: [],
      fileTypes: [],
      keywords: []
    });
  };
  
  const handleAddRule = () => {
    const newId = Math.max(0, ...processingRules.map(r => r.id)) + 1;
    setEditingRule({
      id: newId,
      name: '',
      pattern: '',
      isActive: true,
      fieldMappings: {
        name: '',
        phone: '',
        email: '',
        specialization: '',
        location: ''
      }
    });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const renderProviderIcon = (provider) => {
    switch (provider) {
      case 'gmail':
        return <FaGoogle className="text-red-500" />;
      case 'outlook':
        return <FaMicrosoft className="text-blue-500" />;
      default:
        return <FontAwesomeIcon icon={faEnvelope} className="text-gray-500" />;
    }
  };
  
  const renderFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'excel':
        return <FaFileExcel className="text-green-600" />;
      case 'pdf':
        return <FaFilePdf className="text-red-600" />;
      case 'csv':
        return <FaFileCsv className="text-orange-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Connected Email Accounts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Connected Email Accounts</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className={`flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FontAwesomeIcon icon={faSync} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={handleAddMailbox}
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Account
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {mailboxes.map((mailbox) => (
            <div 
              key={mailbox.id} 
              className="border rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <div className="flex justify-between">
                <div className="flex items-center">
                  {renderProviderIcon(mailbox.provider)}
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{mailbox.name}</h3>
                    <p className="text-sm text-gray-500">{mailbox.email}</p>
                    <div className="flex items-center mt-1">
                      {mailbox.connected ? (
                        <span className="flex items-center text-xs text-green-600">
                          <FontAwesomeIcon icon={faCheck} className="mr-1" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-red-600">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                          Disconnected
                        </span>
                      )}
                      {mailbox.lastSync && (
                        <span className="text-xs text-gray-500 ml-2">
                          Last synced: {formatDate(mailbox.lastSync)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditMailbox(mailbox.id)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMailbox(mailbox.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              
              {/* File types supported */}
              {mailbox.fileTypes.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-1">Supported File Types:</p>
                  <div className="flex space-x-2">
                    {mailbox.fileTypes.map((fileType, index) => (
                      <div key={index} className="flex items-center text-xs bg-gray-100 p-1 px-2 rounded">
                        {renderFileTypeIcon(fileType)}
                        <span className="ml-1 capitalize">{fileType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Folder patterns */}
              {mailbox.folderPatterns.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Monitored Folders:</p>
                  <div className="flex flex-wrap gap-1">
                    {mailbox.folderPatterns.map((folder, index) => (
                      <span key={index} className="text-xs bg-gray-100 py-1 px-2 rounded">
                        {folder}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Keywords */}
              {mailbox.keywords.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Search Keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {mailbox.keywords.map((keyword, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {mailboxes.length === 0 && (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No email accounts connected yet.</p>
              <button
                onClick={handleAddMailbox}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Add an account to start extracting leads
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Processing Rules Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Email Processing Rules</h2>
          <button
            onClick={handleAddRule}
            className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Rule
          </button>
        </div>
        
        <div className="space-y-4">
          {processingRules.map((rule) => (
            <div 
              key={rule.id}
              className={`border rounded-lg p-4 transition-colors ${rule.isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
            >
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <div className="ml-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={rule.isActive}
                          onChange={() => handleToggleRuleActive(rule.id)}
                        />
                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Pattern: <code className="bg-gray-100 px-1">{rule.pattern}</code></p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditRule(rule.id)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              
              {/* Field Mappings */}
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-1">Field Mappings:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                  {Object.entries(rule.fieldMappings).map(([field, pattern]) => (
                    <div key={field} className="text-xs">
                      <span className="font-medium capitalize">{field}:</span>{' '}
                      <code className="bg-gray-100 px-1 text-xs">{pattern}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {processingRules.length === 0 && (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No processing rules defined yet.</p>
              <button
                onClick={handleAddRule}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Add a rule to extract leads from emails
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mailbox Edit Modal */}
      {editingMailbox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingMailbox.id ? 'Edit Email Account' : 'Add Email Account'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={editingMailbox.name}
                  onChange={(e) => setEditingMailbox({...editingMailbox, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editingMailbox.email}
                  onChange={(e) => setEditingMailbox({...editingMailbox, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  value={editingMailbox.provider}
                  onChange={(e) => setEditingMailbox({...editingMailbox, provider: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook</option>
                  <option value="other">Other IMAP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder Patterns (comma separated)
                </label>
                <input
                  type="text"
                  value={editingMailbox.folderPatterns.join(', ')}
                  onChange={(e) => setEditingMailbox({
                    ...editingMailbox, 
                    folderPatterns: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="INBOX, Leads, Inquiries"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supported File Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {['excel', 'pdf', 'csv'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingMailbox.fileTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingMailbox({
                              ...editingMailbox,
                              fileTypes: [...editingMailbox.fileTypes, type]
                            });
                          } else {
                            setEditingMailbox({
                              ...editingMailbox,
                              fileTypes: editingMailbox.fileTypes.filter(t => t !== type)
                            });
                          }
                        }}
                        className="mr-1"
                      />
                      <span className="text-sm flex items-center">
                        {renderFileTypeIcon(type)}
                        <span className="ml-1 capitalize">{type}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={editingMailbox.keywords.join(', ')}
                  onChange={(e) => setEditingMailbox({
                    ...editingMailbox, 
                    keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="quote, inquiry, lead, price"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingMailbox(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMailbox}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Rule Edit Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingRule.id ? 'Edit Processing Rule' : 'Add Processing Rule'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Pattern
                </label>
                <input
                  type="text"
                  value={editingRule.pattern}
                  onChange={(e) => setEditingRule({...editingRule, pattern: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="from:example.com subject:lead"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use email search syntax: from:, subject:, has:attachment, etc.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Mappings (regex patterns)
                </label>
                
                {Object.entries(editingRule.fieldMappings).map(([field, pattern]) => (
                  <div key={field} className="mb-2">
                    <label className="block text-xs font-medium text-gray-600 capitalize">
                      {field}
                    </label>
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => setEditingRule({
                        ...editingRule, 
                        fieldMappings: {
                          ...editingRule.fieldMappings,
                          [field]: e.target.value
                        }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      placeholder={`Regex pattern to extract ${field}`}
                    />
                  </div>
                ))}
                
                <p className="text-xs text-gray-500 mt-1">
                  Use regex capture groups (...) to extract the field values from email content
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingRule.isActive}
                  onChange={(e) => setEditingRule({...editingRule, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Rule is active
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRule}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailConfig;