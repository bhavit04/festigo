import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventListing from './pages/EventListing';
import EventCreate from './pages/EventCreate';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Browse from './pages/Browse';
import Sidepanel from './components/Sidepanel';
import CollegeDashboard from './pages/CollegeDashboard';
import BrandDashboard from './pages/BrandDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventInterests from './pages/EventInterests';

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/events" 
                  element={
                    <ProtectedRoute allowedRole={["brand", "college"]}>
                      <EventListing />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/events/create" 
                  element={
                    <ProtectedRoute allowedRole="college">
                      <EventCreate />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/college-dashboard" 
                  element={
                    <ProtectedRoute allowedRole="college">
                      <CollegeDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/brand-dashboard" 
                  element={
                    <ProtectedRoute allowedRole="brand">
                      <BrandDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/browse" 
                  element={
                    <ProtectedRoute allowedRole={["brand", "college"]}>
                      <Browse />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Remove duplicate route */}
                {/* <Route path="/create-event" element={<EventCreate />} /> */}
                
                <Route path="/sidepanel" element={<Sidepanel />} />
                <Route 
                  path="/events/:eventId/interests" 
                  element={
                    <ProtectedRoute allowedRole="college">
                      <EventInterests />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/college/messages" 
                  element={
                    <ProtectedRoute allowedRole="college">
                      <CollegeDashboard activeTab="messages" />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/brand/messages" 
                  element={
                    <ProtectedRoute allowedRole="brand">
                      <BrandDashboard activeTab="messages" />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <ToastContainer />
          </div>
        </Router>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;
