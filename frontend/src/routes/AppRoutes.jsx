import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyOtp from '../pages/VerifyOtp';
import ForgotPassword from '../pages/ForgotPassword';
import Chat from '../pages/Chat';
import Projects from '../pages/Projects';
import Library from '../pages/Library';
import ScheduledTasks from '../pages/ScheduledTasks';
import { ProjectWorkspace } from '../components/projects/ProjectWorkspace';
import { AuthLayout } from '../components/layout/AuthLayout';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      <Route element={<AuthLayout />}>
        <Route path="/chat" element={<Chat />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
        <Route path="/library" element={<Library />} />
        <Route path="/scheduled" element={<ScheduledTasks />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
