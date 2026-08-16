import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-4 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="text-gray-500 dark:text-gray-400">Page not found</p>
        <div className="mt-4">
          <Link to="/login" className="text-blue-500 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
