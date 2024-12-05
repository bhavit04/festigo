import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import brandService from '../services/brandService';
import '../styles/Browse.css';

// Add industry options
const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'retail', label: 'Retail' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' }
];

const Browse = () => {
  const { user } = useAuth();
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [budgetRange, setBudgetRange] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [selectedIndustry, budgetRange]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const filters = {
        industry: selectedIndustry !== 'all' ? selectedIndustry : undefined,
        budgetRange: budgetRange !== 'all' ? budgetRange : undefined
      };
      const data = await brandService.getListings(filters);
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter listings based on selected filters
  const filteredListings = listings.filter(listing => {
    const industryMatch = selectedIndustry === 'all' || 
                         listing.industry.toLowerCase() === selectedIndustry;
    const budgetMatch = budgetRange === 'all' || 
                       listing.budgetRange === budgetRange;
    return industryMatch && budgetMatch;
  });

  const handleSendProposal = (listing) => {
    if (user?.role !== 'college') {
      alert('Only colleges can send proposals to sponsors');
      return;
    }
    setSelectedListing(listing);
    setShowProposalModal(true);
  };

  return (
    <div className="browse-container">
      <div className="browse-sidebar">
        <div className="filter-section">
          <h3>Filters</h3>
          
          <div className="filter-group">
            <label>Industry</label>
            <select 
              value={selectedIndustry} 
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              <option value="all">All Industries</option>
              {INDUSTRY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Budget Range</label>
            <select 
              value={budgetRange} 
              onChange={(e) => setBudgetRange(e.target.value)}
            >
              <option value="all">All Ranges</option>
              <option value="0-50000">Under ₹50,000</option>
              <option value="50000-200000">₹50,000 - ₹2,00,000</option>
              <option value="200000+">Above ₹2,00,000</option>
            </select>
          </div>

          {/* Show active filters */}
          <div className="active-filters">
            <h4>Active Filters:</h4>
            {selectedIndustry !== 'all' && (
              <div className="filter-tag">
                Industry: {selectedIndustry}
                <button onClick={() => setSelectedIndustry('all')}>×</button>
              </div>
            )}
            {budgetRange !== 'all' && (
              <div className="filter-tag">
                Budget: {budgetRange}
                <button onClick={() => setBudgetRange('all')}>×</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="browse-main">
        <div className="browse-header">
          <h1>Browse Sponsors</h1>
          <div className="browse-stats">
            <span>{filteredListings.length} potential sponsors found</span>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading listings...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="sponsors-grid">
            {filteredListings.map(listing => (
              <div key={listing._id} className="sponsor-card">
                <div className="sponsor-logo">
                  <div className="placeholder-logo">
                    {listing.brandName[0]}
                  </div>
                </div>
                <div className="sponsor-info">
                  <h3>{listing.brandName}</h3>
                  <p className="industry">{listing.industry}</p>
                  <p className="budget">Budget Range: {
                    listing.budgetRange === "0-50000" ? "Under ₹50,000" :
                    listing.budgetRange === "50000-200000" ? "₹50,000 - ₹2,00,000" :
                    "Above ₹2,00,000"
                  }</p>
                  <div className="preferred-events">
                    <h4>Preferred Events:</h4>
                    <div className="tags">
                      {listing.preferredEvents.map(event => (
                        <span key={event} className="tag">{event}</span>
                      ))}
                    </div>
                  </div>
                  <div className="description">
                    <h4>Description:</h4>
                    <p>{listing.description}</p>
                  </div>
                  <div className="requirements">
                    <h4>Requirements:</h4>
                    <p>{listing.requirements}</p>
                  </div>
                  {user?.role === 'college' && (
                    <button 
                      className="send-proposal-btn"
                      onClick={() => handleSendProposal(listing)}
                    >
                      Send Proposal
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showProposalModal && selectedListing && (
          <ProposalModal 
            listing={selectedListing}
            onClose={() => setShowProposalModal(false)}
            collegeId={user?._id}
          />
        )}
      </div>
    </div>
  );
};

// Add ProposalModal component
const ProposalModal = ({ listing, onClose, collegeId }) => {
  const [proposalFile, setProposalFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setProposalFile(file);
    } else {
      alert('Please upload a PDF file');
      e.target.value = ''; // Reset input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proposalFile) {
      alert('Please select a PDF file');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      // Log the values to verify they're correct
      console.log('Debug - IDs:', {
        listingId: listing._id,
        collegeId: collegeId,
        brandId: listing.brandId._id || listing.brandId, // Get the _id if it's an object
      });

      formData.append('proposalFile', proposalFile);
      formData.append('listingId', listing._id);
      formData.append('collegeId', collegeId);
      formData.append('brandId', listing.brandId._id || listing.brandId); // Fix here

      await brandService.sendProposal(formData);
      alert('Proposal sent successfully!');
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to send proposal: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="proposal-modal">
        <h2>Send Proposal to {listing.brandName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Upload Your Proposal</label>
            <div className="file-input-container">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
              <div className="upload-icon">
                <i className="fas fa-cloud-upload-alt"></i>
              </div>
              <p className="upload-text">
                {proposalFile 
                  ? <span>Selected: <strong>{proposalFile.name}</strong></span>
                  : <span>Drag and drop your PDF file here or <strong>click to browse</strong></span>
                }
              </p>
            </div>
            {proposalFile && (
              <div className="file-name">
                <i className="fas fa-file-pdf"></i>
                {proposalFile.name}
              </div>
            )}
          </div>
          <div className="modal-buttons">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting || !proposalFile}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Sending...
                </>
              ) : 'Send Proposal'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Browse;
