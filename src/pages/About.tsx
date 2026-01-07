import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, History } from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';

const About: React.FC = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white">
            <PageHeader
                title={<>NOSSA <span className="text-primary">HISTÓRIA</span></>}
                subtitle="Mais do que uma barbearia, um legado de tradição e estilo."
                backgroundImage="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop"
                height="h-[60vh]"
            />

            {/* The Story */}
            <section className="py-24 bg-dark-bg relative">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
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

            {/* Values */}
            <section className="py-24 bg-card-bg border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">Nossos Valores</h2>
                        <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { icon: History, title: 'Tradição', desc: 'Respeitamos as raízes da barbearia clássica, mantendo viva a essência do ofício.' },
                            { icon: Award, title: 'Excelência', desc: 'Compromisso inegociável com a qualidade em cada corte, barba e atendimento.' },
                            { icon: Users, title: 'Comunidade', desc: 'Um ambiente acolhedor onde clientes se tornam amigos e parte da nossa família.' }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                className="p-10 bg-dark-bg rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-2 shadow-lg hover:shadow-primary/10"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card-bg mb-8 text-primary group-hover:scale-110 transition-transform duration-300 border border-white/5 group-hover:border-primary/20">
                                    <item.icon className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 bg-dark-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">Nossa Equipe</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Conheça os mestres por trás das tesouras.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[1, 2, 3].map((member) => (
                            <motion.div
                                key={member}
                                className="group relative overflow-hidden rounded-2xl aspect-[3/4] border border-white/5"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: member * 0.1 }}
                            >
                                <img
                                    src={`https://images.unsplash.com/photo-${member === 1 ? '1560250097-0b93528c311a' : member === 2 ? '1519085360753-af0119f7cbe7' : '1507003211169-0a1dd7228f2d'}?q=80&w=1000&auto=format&fit=crop`}
                                    alt="Barbeiro"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                                    <h3 className="text-2xl font-bold text-white mb-1">Nome do Barbeiro</h3>
                                    <p className="text-primary font-medium tracking-wide">Master Barber</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
