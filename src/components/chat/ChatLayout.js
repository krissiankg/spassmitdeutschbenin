"use client";
import React from 'react';

const ChatLayout = ({ children }) => {
  return (
    <div className="flex h-[calc(100vh-80px)] lg:h-[calc(100vh-120px)] bg-white rounded-none lg:rounded-[2.5rem] overflow-hidden border-0 lg:border border-gray-100 shadow-2xl">
      {children}
    </div>
  );
};

export default ChatLayout;
