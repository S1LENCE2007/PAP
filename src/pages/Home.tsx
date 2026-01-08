import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Calendar, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import ScrollReveal from '../components/animations/ScrollReveal';
import TiltCard from '../components/animations/TiltCard';

import heroBg from '../assets/hero-bg.png';
import PageHeader from '../components/layout/PageHeader';

const Home: React.FC = () => {
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
                                Tradição desde 2015
                            </h2>
                            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                                <p>
                                    Fundada com a missão de resgatar a arte da barbearia clássica, a <span className="text-primary font-semibold">Barbearia Dourado</span> nasceu do sonho de criar um espaço onde o homem moderno pudesse encontrar não apenas um corte de cabelo, mas uma experiência de cuidado e relaxamento.
                                </p>
                                <p>
                                    Localizados no coração de Montemor-o-Velho, combinamos técnicas tradicionais de barbearia com as tendências mais atuais, garantindo que cada cliente saia da nossa cadeira sentindo-se confiante e renovado.
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
                                src="https://images.unsplash.com/photo-1503951914875-befbb7135952?q=80&w=2070&auto=format&fit=crop"
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
                                <h3 className="text-2xl font-bold text-white mb-4">Agendamento Fácil</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Reserve seu horário em segundos através da nossa plataforma online, sem complicações ou esperas.
                                </p>
                            </TiltCard>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Services Preview Section */}
            <section className="py-16 md:py-24 bg-dark-bg relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-primary font-bold tracking-widest uppercase mb-3 text-xs md:text-sm">Nossos Serviços</h2>
                        <h3 className="text-3xl md:text-5xl font-heading font-bold text-white">O Que Oferecemos</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Corte Clássico',
                                price: '15€',
                                desc: 'Tesoura e máquina com acabamento perfeito.',
                                image: 'https://images.unsplash.com/photo-1599351431202-6e0000a40697?auto=format&fit=crop&q=80&w=800'
                            },
                            {
                                title: 'Barba Tradicional',
                                price: '12€',
                                desc: 'Toalha quente e navalha para um barbear suave.',
                                image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800'
                            },
                            {
                                title: 'Experiência Completa',
                                price: '25€',
                                desc: 'Combo de corte e barba com tratamento vip.',
                                image: 'https://images.unsplash.com/photo-1503951914875-befbb7135952?auto=format&fit=crop&q=80&w=800'
                            }
                        ].map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="bg-card-bg rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-2 shadow-lg hover:shadow-primary/5 overflow-hidden flex flex-col"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className="text-lg font-bold text-dark bg-primary px-3 py-1 rounded-lg shadow-lg">{service.price}</span>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-4">{service.title}</h3>
                                    <p className="text-gray-400 mb-6 flex-1">{service.desc}</p>
                                    <Link
                                        to="/agendar"
                                        state={{ serviceName: service.title }}
                                        className="text-sm font-bold text-white hover:text-primary transition-colors uppercase tracking-wide flex items-center mt-auto"
                                    >
                                        Ver Detalhes <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/servicos" className="btn-outline px-8 py-3 text-sm">Ver Menu Completo</Link>
                    </div>
                </div>
            </section>

            {/* Shop Preview Section */}
            <section className="py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-dark-bg/50 z-0" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-primary font-bold tracking-widest uppercase mb-3 text-xs md:text-sm">Loja Online</h2>
                        <h3 className="text-3xl md:text-5xl font-heading font-bold text-white">Cuide de si em casa</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Óleo de Barba Premium',
                                price: '18.90€',
                                image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&q=80&w=800'
                            },
                            {
                                title: 'Pomada Modeladora',
                                price: '15.50€',
                                image: 'https://images.unsplash.com/photo-1595348079549-0a6dd24b2bf5?auto=format&fit=crop&q=80&w=800'
                            },
                            {
                                title: 'Kit Barba Completo',
                                price: '45.00€',
                                image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800'
                            }
                        ].map((product, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="bg-card-bg rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-2 shadow-lg hover:shadow-primary/5 overflow-hidden"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className="text-lg font-bold text-dark bg-primary px-3 py-1 rounded-lg shadow-lg">{product.price}</span>
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                                    <Link to="/loja" className="inline-block mt-4 text-primary font-bold uppercase tracking-wide hover:text-white transition-colors">
                                        Ver na Loja
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/loja" className="btn-outline px-8 py-3 text-sm">Ver Todos os Produtos</Link>
                    </div>
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800",
                            "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800",
                            "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800",
                            "https://images.unsplash.com/photo-1503951914875-452162b7f30a?auto=format&fit=crop&q=80&w=800"
                        ].map((img, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative aspect-square overflow-hidden rounded-xl group"
                            >
                                <img src={img} alt={`Trabalho ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <Scissors className="text-primary w-8 h-8" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

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
