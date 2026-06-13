import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-dark-bg">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
