import React, { useState, useEffect } from 'react';
import brandService from '../../services/brandService';
import '../../styles/ManageListings.css';

const ManageListings = ({ brandId }) => {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [brandId]);

  const fetchListings = async () => {
    try {
      const response = await brandService.getListings({ brandId });
      setListings(response);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProposals = async (listing) => {
    try {
      const proposals = await brandService.getProposals(listing._id);
      setSelectedListing({ ...listing, proposals });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProposalAction = async (proposalId, status) => {
    try {
      await brandService.updateProposalStatus(proposalId, status);
      // Refresh proposals
      if (selectedListing) {
        const proposals = await brandService.getProposals(selectedListing._id);
        setSelectedListing({ ...selectedListing, proposals });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Add PDF Modal Component
  const ProposalPdfModal = ({ proposal, onClose }) => {
    return (
      <div className="modal-overlay">
        <div className="pdf-modal">
          <div className="modal-header">
            <h2>Proposal from {proposal.collegeId.collegeName}</h2>
            <button onClick={onClose} className="close-modal-btn">&times;</button>
          </div>
          <div className="pdf-container">
            <iframe
              src={`http://localhost:5000/${proposal.proposalFile}`}
              width="100%"
              height="500px"
              title="Proposal PDF"
            />
          </div>
          <div className="modal-actions">
            {proposal.status === 'pending' && (
              <>
                <button 
                  onClick={() => {
                    handleProposalAction(proposal._id, 'accepted');
                    onClose();
                  }}
                  className="accept-btn"
                >
                  Accept
                </button>
                <button 
                  onClick={() => {
                    handleProposalAction(proposal._id, 'rejected');
                    onClose();
                  }}
                  className="reject-btn"
                >
                  Reject
                </button>
              </>
            )}
            <button 
              onClick={onClose} 
              className="close-btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="manage-listings">
      <div className="listings-section">
        <h2>Your Listings</h2>
        <div className="listings-grid">
          {listings.map(listing => (
            <div key={listing._id} className="listing-card">
              <h3>{listing.brandName}</h3>
              <p>Budget: {listing.budgetRange}</p>
              <p>Events: {listing.preferredEvents.join(', ')}</p>
              <button 
                onClick={() => handleViewProposals(listing)}
                className="view-proposals-btn"
              >
                View Proposals
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedListing && (
        <div className="proposals-section">
          <div className="proposals-header">
            <h3>Proposals for {selectedListing.brandName}</h3>
            <button 
              onClick={() => setSelectedListing(null)} 
              className="close-proposals-btn"
            >
              &times;
            </button>
          </div>
          <div className="proposals-list">
            {selectedListing.proposals?.length === 0 ? (
              <p>No proposals yet</p>
            ) : (
              selectedListing.proposals?.map(proposal => (
                <div key={proposal._id} className="proposal-card">
                  <h4>{proposal.collegeId.collegeName}</h4>
                  <p>Status: {proposal.status}</p>
                  <button
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setShowPdfModal(true);
                    }}
                    className="view-pdf-btn"
                  >
                    View Proposal PDF
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showPdfModal && selectedProposal && (
        <ProposalPdfModal
          proposal={selectedProposal}
          onClose={() => {
            setShowPdfModal(false);
            setSelectedProposal(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageListings; 
