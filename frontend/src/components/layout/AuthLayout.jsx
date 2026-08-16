import React from 'react';
import { Outlet } from 'react-router-dom';
import { ChatProvider } from '../../context/ChatContext';
import { MainLayout } from './MainLayout';

export const AuthLayout = () => {
  return (
    <ChatProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ChatProvider>
  );
};
