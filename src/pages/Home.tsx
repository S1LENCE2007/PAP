import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Calendar, Star, ArrowRight, Check, Clock, Loader, ChevronLeft, ChevronRight, ShoppingCart, ZoomIn, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import ScrollReveal from '../components/animations/ScrollReveal';
import TiltCard from '../components/animations/TiltCard';
import { supabase } from '../utils/supabase';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

import heroBg from '../assets/hero-bg.png';
import barbeariaImg from '../imagens/Barbiaria.jpg';
import PageHeader from '../components/layout/PageHeader';

interface DbService {
    id: string;
    nome: string;
    preco: number;
    duracao: number;
    descricao?: string;
    imagem_url?: string;
    categoria: string;
}

interface DbProduct {
    id: string;
    nome: string;
    preco: number;
    descricao?: string;
    imagem_url: string;
    categoria: string;
}

interface DbGallery {
    id: string;
    url: string;
    descricao?: string;
    categoria?: string;
    visible: boolean;
}

const Home: React.FC = () => {
    const [services, setServices] = useState<DbService[]>([]);
    const [selectedService, setSelectedService] = useState<DbService | null>(null);
    const [loadingServices, setLoadingServices] = useState(true);

    // Carousel States (Services)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [visibleCards, setVisibleCards] = useState(3);

    // Products States
    const [products, setProducts] = useState<DbProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const [isProductHovered, setIsProductHovered] = useState(false);

    // Gallery States
    const [galleryImages, setGalleryImages] = useState<DbGallery[]>([]);
    const [loadingGallery, setLoadingGallery] = useState(true);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
    const [isGalleryHovered, setIsGalleryHovered] = useState(false);
    const [visibleGalleryCards, setVisibleGalleryCards] = useState(3);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('produtos')
                    .select('*');

                if (error) throw error;
                setProducts(data || []);
            } catch (err) {
                console.error('Erro ao carregar produtos na Home:', err);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data, error } = await supabase
                    .from('servicos')
                    .select('*')
                    .eq('disponivel', true)
                    .order('preco');

                if (error) throw error;
                setServices(data || []);
            } catch (err) {
                console.error('Erro ao carregar serviços na Home:', err);
            } finally {
                setLoadingServices(false);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const { data, error } = await supabase
                    .from('galeria')
                    .select('*')
                    .eq('visible', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setGalleryImages(data || []);
            } catch (err) {
                console.error('Erro ao carregar galeria na Home:', err);
            } finally {
                setLoadingGallery(false);
            }
        };
        fetchGallery();
    }, []);

    // Handle visible cards responsive size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setVisibleCards(window.innerWidth >= 1024 ? 3 : 2);
                setVisibleGalleryCards(3);
            } else {
                setVisibleCards(1);
                setVisibleGalleryCards(1);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, services.length - visibleCards);

    // Autoplay Timer (Services)
    useEffect(() => {
        if (loadingServices || maxIndex === 0 || isHovered) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 5000); // Pass cards every 5 seconds

        return () => clearInterval(interval);
    }, [loadingServices, maxIndex, isHovered]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const maxProductIndex = Math.max(0, products.length - visibleCards);

    // Products Autoplay Timer
    useEffect(() => {
        if (loadingProducts || maxProductIndex === 0 || isProductHovered) return;

        const interval = setInterval(() => {
            setCurrentProductIndex((prev) => (prev >= maxProductIndex ? 0 : prev + 1));
        }, 5000); // Pass cards every 5 seconds

        return () => clearInterval(interval);
    }, [loadingProducts, maxProductIndex, isProductHovered]);

    const handlePrevProduct = () => {
        setCurrentProductIndex((prev) => (prev <= 0 ? maxProductIndex : prev - 1));
    };

    const handleNextProduct = () => {
        setCurrentProductIndex((prev) => (prev >= maxProductIndex ? 0 : prev + 1));
    };

    const maxGalleryIndex = Math.max(0, galleryImages.length - visibleGalleryCards);

    // Gallery Autoplay Timer
    useEffect(() => {
        if (loadingGallery || maxGalleryIndex === 0 || isGalleryHovered) return;

        const interval = setInterval(() => {
            setCurrentGalleryIndex((prev) => (prev >= maxGalleryIndex ? 0 : prev + 1));
        }, 4000); // Pass gallery cards every 4 seconds

        return () => clearInterval(interval);
    }, [loadingGallery, maxGalleryIndex, isGalleryHovered]);

    const handlePrevGallery = () => {
        setCurrentGalleryIndex((prev) => (prev <= 0 ? maxGalleryIndex : prev - 1));
    };

    const handleNextGallery = () => {
        setCurrentGalleryIndex((prev) => (prev >= maxGalleryIndex ? 0 : prev + 1));
    };

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <PageTransition>
            <PageHeader
                title={<>BARBEARIA <br /><span className="text-primary">DOURADO</span></>}
                subtitle="Onde a tradição encontra a modernidade. Cortes clássicos, barbas esculpidas e uma experiência premium em Montemor-o-Velho."
                backgroundImage={heroBg}
                height="h-[85vh]"
            >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
                    <Link to="/agendar" className="btn-primary px-10 py-4 text-lg font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1">
                        Agendar Agora
                    </Link>
                    <Link to="/loja" className="px-10 py-4 text-lg font-bold uppercase tracking-wider border-2 border-white text-white hover:bg-white hover:text-dark transition-all duration-300 shadow-lg hover:shadow-white/20 rounded-md">
                        Loja Online
                    </Link>
                </div>
            </PageHeader>

            {/* The Story Section (Moved from About) */}
            <section className="py-16 md:py-24 bg-dark-bg relative">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        <motion.div {...fadeIn}>
                            <h2 className="font-heading text-3xl md:text-4xl text-white mb-8 border-l-4 border-primary pl-6">
                                Modernidade desde 2026
                            </h2>
                            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                                <p>
                                    Fundada com a missão de resgatar a essência da barbearia clássica, a <span className="text-primary font-semibold">Barbearia Dourado</span> nasceu a 18 de janeiro de 2026 do sonho de criar um espaço exclusivo. Um lugar onde o homem moderno encontra muito mais do que um corte de cabelo ou um barbear: encontra uma verdadeira experiência de cuidado, estilo e relaxamento.
                                </p>
                                <p>
                                    Situados nas Meãs do Campo, bem no coração de Montemor-o-Velho, combinamos com mestria as técnicas tradicionais de barbearia com as tendências mais atuais. O nosso compromisso é garantir que cada cliente sai da nossa cadeira renovado e com a confiança no topo.
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-white/5 group"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="absolute inset-0 bg-primary/10 z-10 group-hover:bg-transparent transition-colors duration-500" />
                            <img
                                src={barbeariaImg}
                                alt="Interior da Barbearia"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 md:py-32 relative z-20 overflow-hidden">
                {/* Background Texture */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <img
                        src="https://www.transparenttextures.com/patterns/cubes.png"
                        alt="Background Texture"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-dark-bg/90 z-0" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-primary font-bold tracking-widest uppercase mb-3 text-xs md:text-sm">Por que nos escolher</h2>
                        <h3 className="text-3xl md:text-5xl font-heading font-bold text-white">A Experiência Dourado</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                        <ScrollReveal delay={0.1} className="h-full">
                            <TiltCard className="bg-card-bg p-10 rounded-2xl border border-white/5 h-full group hover:border-primary/30 transition-colors duration-500">
                                <div className="w-16 h-16 bg-dark-bg rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors border border-white/5 group-hover:border-primary/20">
                                    <Scissors className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Profissionais Experientes</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Nossa equipe é formada por mestres na arte da barbearia, com anos de experiência e paixão pelo ofício.
                                </p>
                            </TiltCard>
                        </ScrollReveal>

                        <ScrollReveal delay={0.3} className="h-full">
                            <TiltCard className="bg-card-bg p-10 rounded-2xl border border-white/5 h-full group hover:border-primary/30 transition-colors duration-500">
                                <div className="w-16 h-16 bg-dark-bg rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors border border-white/5 group-hover:border-primary/20">
                                    <Star className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Produtos Premium</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Utilizamos apenas os melhores produtos do mercado para garantir o cuidado e a saúde do seu cabelo e barba.
                                </p>
                            </TiltCard>
                        </ScrollReveal>

                        <ScrollReveal delay={0.5} className="h-full">
                            <TiltCard className="bg-card-bg p-10 rounded-2xl border border-white/5 h-full group hover:border-primary/30 transition-colors duration-500">
                                <div className="w-16 h-16 bg-dark-bg rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors border border-white/5 group-hover:border-primary/20">
                                    <Calendar className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Marcação Fácil</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Reserve seu horário em segundos através da nossa plataforma online, sem complicações ou esperas.
                                </p>
                            </TiltCard>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Services Preview Section */}
            <section className="py-16 md:py-24 bg-dark-bg relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-primary font-bold tracking-widest uppercase mb-3 text-xs md:text-sm">Nossos Serviços</h2>
                        <h3 className="text-3xl md:text-5xl font-heading font-bold text-white">O Que Oferecemos</h3>
                    </div>

                    {loadingServices ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Carousel Container */}
                            <div
                                className="relative w-full py-4"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                {/* Track wrapper */}
                                <div className="overflow-hidden w-full -mx-4 px-4">
                                    <div
                                        className="flex transition-transform duration-500 ease-out"
                                        style={{ transform: `translateX(-${currentIndex * (100 / visibleCards)}%)` }}
                                    >
                                        {services.map((service) => (
                                            <div
                                                key={service.id}
                                                className="w-full md:w-1/2 lg:w-1/3 shrink-0 px-4"
                                            >
                                                <button
                                                    onClick={() => setSelectedService(selectedService?.id === service.id ? null : service)}
                                                    className={`w-full group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-lg h-full min-h-[380px] ${selectedService?.id === service.id
                                                            ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                                                            : "border-white/5 bg-card-bg hover:border-white/20"
                                                        }`}
                                                >
                                                    {service.imagem_url ? (
                                                        <div className="w-full h-48 overflow-hidden bg-black/40 relative">
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                                                            <img
                                                                src={service.imagem_url}
                                                                alt={service.nome}
                                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800';
                                                                }}
                                                            />
                                                            <div className="absolute top-4 right-4 z-20">
                                                                <span className={`text-base font-bold px-3 py-1.5 rounded-lg shadow-lg ${selectedService?.id === service.id ? "text-dark bg-primary" : "text-white bg-black/70 backdrop-blur-sm border border-white/10"
                                                                    }`}>
                                                                    {service.preco}€
                                                                </span>
                                                            </div>
                                                            {selectedService?.id === service.id && (
                                                                <div className="absolute top-4 left-4 bg-primary text-black p-1.5 rounded-full z-20 shadow-md">
                                                                    <Check className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 pb-4 flex justify-between items-start w-full">
                                                            <div className={`p-4 rounded-xl transition-colors ${selectedService?.id === service.id ? "bg-primary text-black" : "bg-dark-bg text-gray-400 group-hover:text-primary"
                                                                }`}>
                                                                <Scissors className="w-8 h-8" />
                                                            </div>
                                                            <span className={`text-2xl font-bold ${selectedService?.id === service.id ? "text-primary" : "text-white"
                                                                }`}>{service.preco}€</span>
                                                        </div>
                                                    )}

                                                    <div className="p-8 flex-1 flex flex-col justify-between w-full">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2">{service.nome}</h3>
                                                            {service.descricao && <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">{service.descricao}</p>}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-400 mt-auto">
                                                            <Clock className="w-4 h-4 mr-2 text-primary" />
                                                            {service.duracao} min
                                                        </div>
                                                    </div>

                                                    {!service.imagem_url && selectedService?.id === service.id && (
                                                        <div className="absolute top-4 right-4 text-primary z-20">
                                                            <Check className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Navigation Arrows */}
                                {maxIndex > 0 && (
                                    <>
                                        <button
                                            onClick={handlePrev}
                                            className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-primary hover:text-dark text-white p-3 rounded-full border border-white/10 transition-all z-30 shadow-xl"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-primary hover:text-dark text-white p-3 rounded-full border border-white/10 transition-all z-30 shadow-xl"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                {/* Navigation Dots */}
                                {maxIndex > 0 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentIndex(idx)}
                                                className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === idx ? "w-8 bg-primary" : "w-2.5 bg-gray-600 hover:bg-gray-400"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
                                <Link
                                    to="/agendar"
                                    state={selectedService ? { serviceName: selectedService.nome } : undefined}
                                    className="btn-primary px-10 py-4 text-lg font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1 inline-flex items-center justify-center min-w-[280px]"
                                >
                                    {selectedService ? (
                                        <>Agendar {selectedService.nome} <ArrowRight className="ml-2 w-5 h-5" /></>
                                    ) : (
                                        <>Agendar Serviço <ArrowRight className="ml-2 w-5 h-5" /></>
                                    )}
                                </Link>

                                <Link to="/servicos" className="btn-outline px-10 py-4 text-lg font-bold uppercase tracking-wider transition-all duration-300">
                                    Ver Menu Completo
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Shop Preview Section */}
            <section className="py-16 md:py-24 relative overflow-hidden bg-dark-bg/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-primary font-bold tracking-widest uppercase mb-3 text-xs md:text-sm">Loja Online</h2>
                        <h3 className="text-3xl md:text-5xl font-heading font-bold text-white">Cuide de si em casa</h3>
                    </div>

                    {loadingProducts ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Carousel Container */}
                            <div
                                className="relative w-full py-4"
                                onMouseEnter={() => setIsProductHovered(true)}
                                onMouseLeave={() => setIsProductHovered(false)}
                            >
                                {/* Track wrapper */}
                                <div className="overflow-hidden w-full -mx-4 px-4">
                                    <div
                                        className="flex transition-transform duration-500 ease-out"
                                        style={{ transform: `translateX(-${currentProductIndex * (100 / visibleCards)}%)` }}
                                    >
                                        {products.map((product) => (
                                            <div
                                                key={product.id}
                                                className="w-full md:w-1/2 lg:w-1/3 shrink-0 px-4"
                                            >
                                                <button
                                                    onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                                                    className={`w-full group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-lg h-full min-h-[380px] ${selectedProduct?.id === product.id
                                                            ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                                                            : "border-white/5 bg-card-bg hover:border-white/20"
                                                        }`}
                                                >
                                                    <div className="w-full h-48 overflow-hidden bg-black/40 relative">
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                                                        <img
                                                            src={product.imagem_url}
                                                            alt={product.nome}
                                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&q=80&w=800';
                                                            }}
                                                        />
                                                        <div className="absolute top-4 right-4 z-20">
                                                            <span className={`text-base font-bold px-3 py-1.5 rounded-lg shadow-lg ${selectedProduct?.id === product.id ? "text-dark bg-primary" : "text-white bg-black/70 backdrop-blur-sm border border-white/10"
                                                                }`}>
                                                                {product.preco.toFixed(2)}€
                                                            </span>
                                                        </div>
                                                        {selectedProduct?.id === product.id && (
                                                            <div className="absolute top-4 left-4 bg-primary text-black p-1.5 rounded-full z-20 shadow-md">
                                                                <Check className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-8 flex-1 flex flex-col justify-between w-full">
                                                        <div>
                                                            <span className="text-xs text-primary font-bold uppercase tracking-wider mb-2 block">{product.categoria}</span>
                                                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2">{product.nome}</h3>
                                                            {product.descricao && <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">{product.descricao}</p>}
                                                        </div>
                                                        <div className="mt-4 flex items-center justify-between">
                                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Ver na Loja</span>
                                                            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Navigation Arrows */}
                                {maxProductIndex > 0 && (
                                    <>
                                        <button
                                            onClick={handlePrevProduct}
                                            className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-primary hover:text-dark text-white p-3 rounded-full border border-white/10 transition-all z-30 shadow-xl"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={handleNextProduct}
                                            className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-primary hover:text-dark text-white p-3 rounded-full border border-white/10 transition-all z-30 shadow-xl"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                {/* Navigation Dots */}
                                {maxProductIndex > 0 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        {Array.from({ length: maxProductIndex + 1 }).map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentProductIndex(idx)}
                                                className={`h-2.5 rounded-full transition-all duration-300 ${currentProductIndex === idx ? "w-8 bg-primary" : "w-2.5 bg-gray-600 hover:bg-gray-400"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
                                {selectedProduct ? (
                                    <button
                                        onClick={() => {
                                            addToCart(selectedProduct);
                                            toast.success(`${selectedProduct.nome} adicionado ao carrinho!`);
                                        }}
                                        className="btn-primary px-10 py-4 text-lg font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1 inline-flex items-center justify-center min-w-[280px]"
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-2" /> Adicionar ao Carrinho
                                    </button>
                                ) : (
                                    <Link
                                        to="/loja"
                                        className="btn-primary px-10 py-4 text-lg font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1 inline-flex items-center justify-center min-w-[280px]"
                                    >
                                        Ir para a Loja <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                )}

                                <Link to="/loja" className="btn-outline px-10 py-4 text-lg font-bold uppercase tracking-wider transition-all duration-300">
                                    Ver Todos os Produtos
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Gallery Preview Section */}
            <section className="py-16 md:py-24 bg-black/20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-8 md:mb-12">
                        <div>
                            <h2 className="text-primary font-bold tracking-widest uppercase mb-3 text-xs md:text-sm">Galeria</h2>
                            <h3 className="text-3xl md:text-5xl font-heading font-bold text-white">Nossos Trabalhos</h3>
                        </div>
                        <Link to="/galeria" className="hidden md:flex items-center text-primary hover:text-white transition-colors font-bold uppercase tracking-wider text-sm">
                            Ver Galeria Completa <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>

                    {loadingGallery ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Gallery Carousel Container */}
                            <div
                                className="relative w-full py-4"
                                onMouseEnter={() => setIsGalleryHovered(true)}
                                onMouseLeave={() => setIsGalleryHovered(false)}
                            >
                                {/* Track wrapper */}
                                <div className="overflow-hidden w-full -mx-4 px-4">
                                    <div
                                        className="flex transition-transform duration-500 ease-out"
                                        style={{ transform: `translateX(-${currentGalleryIndex * (100 / visibleGalleryCards)}%)` }}
                                    >
                                        {galleryImages.map((item, index) => {
                                            const isActive = visibleGalleryCards === 3 ? index === currentGalleryIndex + 1 : index === currentGalleryIndex;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="w-full md:w-1/3 shrink-0 px-4 transition-all duration-500"
                                                >
                                                    <div className={`relative aspect-square overflow-hidden rounded-2xl group cursor-pointer bg-zinc-900 border transition-all duration-500 ${isActive
                                                            ? "scale-110 border-primary active-gallery-card z-10 blur-none opacity-100"
                                                            : "scale-90 opacity-30 blur-[2px] hover:opacity-75 hover:blur-none border-white/5 z-0"
                                                        }`}>
                                                        <img
                                                            src={item.url}
                                                            alt={item.descricao || 'Galeria Barbearia Dourado'}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
                                                            <Link to="/galeria" className="p-3 bg-primary rounded-full text-dark hover:bg-white transition-colors">
                                                                <ZoomIn className="w-6 h-6" />
                                                            </Link>
                                                            <a
                                                                href="https://www.instagram.com/barberyvandourado/"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-3 bg-dark rounded-full text-white hover:text-primary transition-colors"
                                                            >
                                                                <Instagram className="w-6 h-6" />
                                                            </a>
                                                        </div>
                                                        {item.descricao && (
                                                            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/75 to-transparent transition-all duration-500 z-10 ${isActive ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"
                                                                }`}>
                                                                <p className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-white"}`}>
                                                                    {item.descricao}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Navigation Arrows */}
                                {maxGalleryIndex > 0 && (
                                    <>
                                        <button
                                            onClick={handlePrevGallery}
                                            className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-primary hover:text-dark text-white p-3 rounded-full border border-white/10 transition-all z-30 shadow-xl"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={handleNextGallery}
                                            className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-primary hover:text-dark text-white p-3 rounded-full border border-white/10 transition-all z-30 shadow-xl"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                {/* Navigation Dots */}
                                {maxGalleryIndex > 0 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        {Array.from({ length: maxGalleryIndex + 1 }).map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentGalleryIndex(idx)}
                                                className={`h-2.5 rounded-full transition-all duration-300 ${currentGalleryIndex === idx ? "w-8 bg-primary" : "w-2.5 bg-gray-600 hover:bg-gray-400"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="mt-8 text-center md:hidden">
                        <Link to="/galeria" className="btn-outline px-8 py-3 text-sm">Ver Galeria Completa</Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 z-0" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between bg-card-bg border border-white/5 p-16 rounded-3xl relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-black/80 to-transparent z-0" />

                        <div className="relative z-10 mb-10 md:mb-0 max-w-xl">
                            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">Pronto para renovar o visual?</h2>
                            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                                Não espere mais. Garanta seu horário com os melhores profissionais da região e sinta a diferença.
                            </p>
                        </div>

                        <div className="relative z-10 w-full md:w-auto">
                            <Link to="/agendar" className="btn-primary w-full md:w-auto px-10 py-5 text-lg font-bold uppercase tracking-wider flex items-center justify-center group shadow-xl shadow-primary/20">
                                Agendar Visita <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </PageTransition >
    );
};

export default Home;
