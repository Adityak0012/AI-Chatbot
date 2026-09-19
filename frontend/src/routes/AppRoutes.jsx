import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyOtp from '../pages/VerifyOtp';
import ForgotPassword from '../pages/ForgotPassword';
import AuthCallback from '../pages/AuthCallback';
import Chat from '../pages/Chat';
import Projects from '../pages/Projects';
import Library from '../pages/Library';
import ScheduledTasks from '../pages/ScheduledTasks';
import Explore from '../pages/Explore';
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
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route element={<AuthLayout />}>
        <Route path="/chat" element={<Chat />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
        <Route path="/library" element={<Library />} />
        <Route path="/scheduled" element={<ScheduledTasks />} />
        <Route path="/explore" element={<Explore />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
