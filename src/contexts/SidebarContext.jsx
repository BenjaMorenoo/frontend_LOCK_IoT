import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const screenWidth = window.innerWidth;
      const userAgent = navigator.userAgent;
      const isMobileDevice = screenWidth < 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      console.log('🔍 Mobile Detection Debug:', {
        screenWidth,
        userAgent,
        isMobileDevice,
        previousIsMobile: isMobile
      });
      
      setIsMobile(isMobileDevice);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    console.log('🔄 Toggle Sidebar Debug:', {
      currentIsOpen: isOpen,
      isMobile,
      willBeOpen: !isOpen
    });
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    console.log('❌ Close Sidebar Debug:', { wasOpen: isOpen, isMobile });
    setIsOpen(false);
  };

  const openSidebar = () => {
    console.log('✅ Open Sidebar Debug:', { wasOpen: isOpen, isMobile });
    setIsOpen(true);
  };

  const value = {
    isOpen,
    isMobile,
    toggleSidebar,
    closeSidebar,
    openSidebar
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};