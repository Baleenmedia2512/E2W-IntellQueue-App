import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTrash, faCheck, faTimes, faExclamationTriangle, faSync } from '@fortawesome/free-solid-svg-icons';
import { FaLinkedin } from 'react-icons/fa';
import { AiOutlineApi, AiOutlineRobot } from 'react-icons/ai';

const PlatformIntegration = () => {
  const [integrations, setIntegrations] = useState({
    justdial: {
      enabled: true,
      credentials: {
        apiKey: 'JD_API_XXXXXXXXXXXXX',
        secretKey: 'JD_SECRET_XXXXXXXXXXX'
      },
      status: 'connected',
      lastSync: '2025-05-06T15:30:00Z'
    },
    linkedin: {
      enabled: false,
      credentials: {
        clientId: '',
        clientSecret: ''
      },
      status: 'disconnected',
      lastSync: null
    },
    apollo: {
      enabled: true,
      credentials: {
        apiKey: 'APOLLO_API_XXXXXXXXXX'
      },
      status: 'error',
      lastSync: '2025-05-05T09:15:00Z',
      error: 'Rate limit exceeded'
    }
  });

  const [editingPlatform, setEditingPlatform] = useState(null);
  const [testingPlatform, setTestingPlatform] = useState(null);
  const [tempCredentials, setTempCredentials] = useState({});

  const getStatusLabel = (status) => {
    switch (status) {
      case 'connected':
        return (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
            <FontAwesomeIcon icon={faCheck} className="mr-1" />
            Connected
          </span>
        );
      case 'disconnected':
        return (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full flex items-center">
            <FontAwesomeIcon icon={faTimes} className="mr-1" />
            Disconnected
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  const handleToggleEnabled = (platform) => {
    setIntegrations({
      ...integrations,
      [platform]: {
        ...integrations[platform],
        enabled: !integrations[platform].enabled
      }
    });
  };

  const handleEdit = (platform) => {
    setEditingPlatform(platform);
    setTempCredentials({ ...integrations[platform].credentials });
  };

  const handleSave = () => {
    if (!editingPlatform) return;

    setIntegrations({
      ...integrations,
      [editingPlatform]: {
        ...integrations[editingPlatform],
        credentials: tempCredentials,
        status: 'connected',
        lastSync: new Date().toISOString()
      }
    });

    setEditingPlatform(null);
  };

  const handleCancel = () => {
    setEditingPlatform(null);
    setTempCredentials({});
  };

  const handleTestConnection = (platform) => {
    setTestingPlatform(platform);
    
    // Simulate API testing
    setTimeout(() => {
      setIntegrations({
        ...integrations,
        [platform]: {
          ...integrations[platform],
          status: 'connected'
        }
      });
      
      setTestingPlatform(null);
    }, 2000);
  };

  const handleInputChange = (key, value) => {
    setTempCredentials({
      ...tempCredentials,
      [key]: value
    });
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'justdial':
        return <AiOutlineApi className="text-orange-500 text-3xl" />;
      case 'linkedin':
        return <FaLinkedin className="text-blue-600 text-3xl" />;
      case 'apollo':
        return <AiOutlineRobot className="text-purple-500 text-3xl" />;
      default:
        return null;
    }
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Platform Integrations</h2>
        <p className="text-gray-600 mb-6">
          Connect to external platforms to automatically fetch leads.
        </p>

        <div className="grid gap-6">
          {Object.entries(integrations).map(([platform, config]) => (
            <div 
              key={platform} 
              className={`border rounded-lg p-4 ${editingPlatform === platform ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {getPlatformIcon(platform)}
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">{platform}</h3>
                    <div className="mt-1 flex items-center space-x-2">
                      {getStatusLabel(config.status)}
                      {config.lastSync && (
                        <span className="text-xs text-gray-500">
                          Last synced: {formatDate(config.lastSync)}
                        </span>
                      )}
                    </div>
                    {config.error && (
                      <div className="mt-1 text-xs text-red-600">
                        Error: {config.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={config.enabled}
                      onChange={() => handleToggleEnabled(platform)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {editingPlatform === platform ? (
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(tempCredentials).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <input
                          type={key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') ? 'password' : 'text'}
                          value={value}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(platform)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Edit Credentials
                  </button>
                  
                  <button
                    onClick={() => handleTestConnection(platform)}
                    disabled={testingPlatform === platform}
                    className={`px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm ${testingPlatform === platform ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {testingPlatform === platform ? (
                      <>
                        <FontAwesomeIcon icon={faSync} className="mr-1 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <button className="flex items-center justify-center w-full text-gray-500 hover:text-gray-700">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add New Integration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformIntegration;