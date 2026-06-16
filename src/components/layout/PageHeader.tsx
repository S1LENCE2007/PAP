import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import defaultBannerImage from '../../imagens/Barbiaria.jpg';

interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: string;
    backgroundImage?: string;
    height?: string;
    children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    backgroundImage,
    height = "h-[60vh]",
    children
}) => {
    const location = useLocation();
    const isShopPage = location.pathname === '/loja';
    const bannerSrc = isShopPage ? (backgroundImage || defaultBannerImage) : defaultBannerImage;

    return (
        <div className={`relative ${height} flex items-center justify-center overflow-hidden border-b border-white/5`}>
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/70 z-10" />
                <motion.div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${bannerSrc})` }}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                />
            </div>
            <motion.div
                className="relative z-10 text-center px-4 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 tracking-wider">
                    {title}
                </div>
                {subtitle && (
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light tracking-wide mb-8">
                        {subtitle}
                    </p>
                )}
                {children}
            </motion.div>
        </div>
    );
};

export default PageHeader;
