import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const EventContext = createContext(null);
const API_URL = 'http://localhost:5000/api';

export const EventProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEvents(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCollegeEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/events/college`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching college events:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getBrandEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/events/brand`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching brand events:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const showInterest = async (eventId, data) => {
    try {
      setLoading(true);
      console.log('Showing interest with data:', data); // Debug log
      const response = await axios.post(
        `${API_URL}/events/${eventId}/interests`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error showing interest:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getEventInterests = async (eventId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/events/${eventId}/interests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching interests:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateInterestStatus = async (eventId, brandId, status) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `${API_URL}/events/${eventId}/interests/${brandId}`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating interest status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData, imageFile) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append all event data to formData
      Object.keys(eventData).forEach(key => {
        formData.append(key, eventData[key]);
      });

      // Append image if exists
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post(
        `${API_URL}/events`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update local events state
      setEvents(prevEvents => [...prevEvents, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <EventContext.Provider value={{
      loading,
      events,
      fetchEvents,
      getCollegeEvents,
      getBrandEvents,
      showInterest,
      getEventInterests,
      updateInterestStatus,
      createEvent
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export default EventContext; 
