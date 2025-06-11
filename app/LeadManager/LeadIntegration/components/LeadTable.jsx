import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faTrash, faEllipsisV, faExternalLinkAlt, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FaLinkedin, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';

const LeadTable = ({ leads, onTagLead, onRemoveDuplicate, onImportToLeadManager }) => {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [tagMenuOpen, setTagMenuOpen] = useState(null);

  const toggleActionMenu = (leadId) => {
    setActionMenuOpen(actionMenuOpen === leadId ? null : leadId);
    setTagMenuOpen(null); // Close tag menu when action menu opens
  };

  const toggleTagMenu = (leadId) => {
    setTagMenuOpen(tagMenuOpen === leadId ? null : leadId);
    setActionMenuOpen(null); // Close action menu when tag menu opens
  };

  const handleTagClick = (leadId, tag) => {
    onTagLead(leadId, tag);
    setTagMenuOpen(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceBadgeColor = (source) => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('justdial')) return 'bg-orange-100 text-orange-800';
    if (sourceLower.includes('linkedin')) return 'bg-blue-100 text-blue-800';
    if (sourceLower.includes('apollo')) return 'bg-purple-100 text-purple-800';
    if (sourceLower.includes('email')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    if (status === 'new') return 'bg-blue-100 text-blue-800';
    if (status === 'duplicate') return 'bg-yellow-100 text-yellow-800';
    if (status === 'imported') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {leads.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No leads found. Try adjusting your filters or refreshing.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="flex flex-col text-sm text-gray-500">
                          <span className="flex items-center">
                            <FaPhoneAlt className="mr-1 text-gray-400" size={12} />
                            {lead.phone}
                          </span>
                          {lead.email && (
                            <span className="flex items-center">
                              <FaEnvelope className="mr-1 text-gray-400" size={12} />
                              {lead.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSourceBadgeColor(lead.source)}`}>
                      {lead.source}
                    </span>
                    {lead.specialization && (
                      <div className="text-xs text-gray-500 mt-1">
                        <FaBuilding className="inline mr-1" size={10} />
                        {lead.specialization}
                      </div>
                    )}
                    {lead.location && (
                      <div className="text-xs text-gray-500 mt-1">
                        <FaMapMarkerAlt className="inline mr-1" size={10} />
                        {lead.location}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(lead.status)}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {lead.tags && lead.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2 relative">
                      <button
                        onClick={() => toggleTagMenu(lead.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FontAwesomeIcon icon={faTag} />
                      </button>
                      
                      {lead.status === 'duplicate' && (
                        <button
                          onClick={() => onRemoveDuplicate(lead.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => onImportToLeadManager(lead.id)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                      </button>
                      
                      <button
                        onClick={() => toggleActionMenu(lead.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                      
                      {/* Tag menu dropdown */}
                      {tagMenuOpen === lead.id && (
                        <div className="absolute top-8 right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-700 border-b">
                              Add Tag
                            </div>
                            {['Justdial', 'LinkedIn', 'Apollo', 'Verified', 'Specialist'].map((tag) => (
                              <button
                                key={tag}
                                onClick={() => handleTagClick(lead.id, tag)}
                                className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                                role="menuitem"
                              >
                                <FontAwesomeIcon 
                                  icon={lead.tags?.includes(tag) ? faCheck : faTag} 
                                  className="mr-2 text-xs" 
                                />
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action menu dropdown */}
                      {actionMenuOpen === lead.id && (
                        <div className="absolute top-8 right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => {
                                onImportToLeadManager(lead.id);
                                setActionMenuOpen(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              Import to Lead Manager
                            </button>
                            <button
                              onClick={() => {
                                toggleTagMenu(lead.id);
                              }}
                              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              Add Tag
                            </button>
                            {lead.status === 'duplicate' && (
                              <button
                                onClick={() => {
                                  onRemoveDuplicate(lead.id);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                role="menuitem"
                              >
                                Remove Duplicate
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeadTable;