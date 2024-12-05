import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { toast } from 'react-toastify';
import '../styles/EventCreate.css';

function EventCreate() {
  const navigate = useNavigate();
  const { createEvent, loading } = useEvents();
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    category: '',
    sponsorshipNeeded: '',
    description: '',
    attendees: '',
  });

  const validateForm = () => {
    const newErrors = {};
    if (!eventData.title.trim()) newErrors.title = 'Title is required';
    if (!eventData.date) newErrors.date = 'Date is required';
    if (!eventData.category) newErrors.category = 'Category is required';
    if (!eventData.sponsorshipNeeded) newErrors.sponsorshipNeeded = 'Sponsorship amount is required';
    if (eventData.sponsorshipNeeded <= 0) newErrors.sponsorshipNeeded = 'Sponsorship amount must be positive';
    if (!eventData.description.trim()) newErrors.description = 'Description is required';
    if (!eventData.attendees) newErrors.attendees = 'Expected attendees is required';
    if (eventData.attendees <= 0) newErrors.attendees = 'Expected attendees must be positive';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      await createEvent(eventData, imageFile);
      toast.success('Event created successfully!');
      navigate('/events');
    } catch (err) {
      toast.error('Failed to create event. Please try again.');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  return (
    <div className="event-create">
      <h1>Create New Event</h1>
      
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Event Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={eventData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="date">Event Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={eventData.date}
            onChange={handleChange}
            className={errors.date ? 'error' : ''}
          />
          {errors.date && <span className="error-message">{errors.date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={eventData.category}
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
            required
          >
            <option value="">Select Category</option>
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Sports">Sports</option>
            <option value="Arts">Arts</option>
            <option value="Science">Science</option>
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="sponsorshipNeeded">Sponsorship Amount Needed ($)</label>
          <input
            type="number"
            id="sponsorshipNeeded"
            name="sponsorshipNeeded"
            value={eventData.sponsorshipNeeded}
            onChange={handleChange}
            className={errors.sponsorshipNeeded ? 'error' : ''}
            required
          />
          {errors.sponsorshipNeeded && <span className="error-message">{errors.sponsorshipNeeded}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="attendees">Expected Attendees</label>
          <input
            type="number"
            id="attendees"
            name="attendees"
            value={eventData.attendees}
            onChange={handleChange}
            className={errors.attendees ? 'error' : ''}
            required
          />
          {errors.attendees && <span className="error-message">{errors.attendees}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Event Description</label>
          <textarea
            id="description"
            name="description"
            value={eventData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
            required
            rows="4"
          ></textarea>
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="image">Event Image</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default EventCreate;
