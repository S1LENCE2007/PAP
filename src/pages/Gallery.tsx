import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, ZoomIn } from 'lucide-react';
import { supabase } from '../utils/supabase';

import PageHeader from '../components/layout/PageHeader';

interface GalleryItem {
    id: string;
    url: string;
    descricao?: string;
    visible: boolean;
    created_at: string;
}

const Gallery: React.FC = () => {
    const [images, setImages] = React.useState<GalleryItem[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const { data, error } = await supabase
                .from('galeria')
                .select('*')
                .eq('visible', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setImages(data || []);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white">
            <PageHeader
                title={<>NOSSA <span className="text-primary">GALERIA</span></>}
                subtitle="Confira alguns dos nossos melhores trabalhos e inspire-se."
                backgroundImage="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1976&auto=format&fit=crop"
            />

            <div className="max-w-7xl mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {images.map((item) => (
                            <motion.div
                                key={item.id}
                                className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer border border-white/5 shadow-lg bg-zinc-900"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <img
                                    src={item.url}
                                    alt={item.descricao || 'Galeria Barbearia Dourado'}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                    <button className="p-3 bg-primary rounded-full text-dark hover:bg-white transition-colors">
                                        <ZoomIn className="w-6 h-6" />
                                    </button>
                                    <a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-dark rounded-full text-white hover:text-primary transition-colors"
                                    >
                                        <Instagram className="w-6 h-6" />
                                    </a>
                                </div>
                                {item.descricao && (
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white text-sm font-medium truncate">{item.descricao}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-lg">Nenhuma imagem disponível no momento.</p>
                    </div>
                )}

                <div className="text-center mt-16">
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline inline-flex items-center px-8 py-4 text-lg"
                    >
                        <Instagram className="mr-2 w-6 h-6" /> Ver mais no Instagram
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Gallery;
