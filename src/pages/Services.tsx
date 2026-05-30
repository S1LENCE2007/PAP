import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';

import { supabase } from '../utils/supabase';

const Services: React.FC = () => {
    const [categories, setCategories] = React.useState<{ title: string, items: any[] }[]>([]);

    React.useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data, error } = await supabase
                    .from('servicos')
                    .select('*')
                    .eq('disponivel', true)
                    .order('preco');

                if (error) throw error;

                if (data) {
                    const grouped = data.reduce((acc, curr) => {
                        const cat = curr.categoria || 'cabelo';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push({
                            name: curr.nome,
                            price: `${curr.preco}€`,
                            description: curr.descricao || '',
                            imagem_url: curr.imagem_url
                        });
                        return acc;
                    }, {} as Record<string, any[]>);

                    const formatted = [
                        { title: 'Cabelo', items: grouped['cabelo'] || [] },
                        { title: 'Barba', items: grouped['barba'] || [] },
                        { title: 'Combos', items: grouped['combo'] || [] },
                    ].filter(cat => cat.items.length > 0);

                    setCategories(formatted);
                }
            } catch (error) {
                console.error('Erro ao buscar serviços:', error);
            }
        };

        fetchServices();
    }, []);

    return (
        <div className="min-h-screen bg-dark-bg text-white">
            <PageHeader
                title={<>MENU DE <span className="text-primary">SERVIÇOS</span></>}
                subtitle="Qualidade premium e atenção aos detalhes em cada corte e barba."
                backgroundImage="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2070"
            />

            {/* Services List */}
            <div className="max-w-6xl mx-auto px-4 pb-24">
                {categories.map((category, catIndex) => (
                    <motion.div
                        key={catIndex}
                        className="mb-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: catIndex * 0.2 }}
                    >
                        <div className="flex items-center mb-10">
                            <div className="h-px flex-grow bg-gradient-to-r from-transparent to-primary/50" />
                            <h2 className="font-heading text-3xl text-white px-6 uppercase tracking-widest">
                                {category.title}
                            </h2>
                            <div className="h-px flex-grow bg-gradient-to-l from-transparent to-primary/50" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {category.items.map((service, index) => (
                                <div
                                    key={index}
                                    className="bg-card-bg p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-primary/5 flex flex-col"
                                >
                                    {service.imagem_url && (
                                        <div className="w-full h-48 rounded-xl overflow-hidden mb-6 bg-black/40 relative">
                                            <img
                                                src={service.imagem_url}
                                                alt={service.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                            {service.name}
                                        </h3>
                                        <span className="text-xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg shrink-0 ml-4">{service.price}</span>
                                    </div>
                                    {service.description && (
                                        <p className="text-gray-400 text-sm mb-6 leading-relaxed border-b border-white/5 pb-4">{service.description}</p>
                                    )}
                                    <Link
                                        to="/agendar"
                                        state={{ serviceName: service.name }}
                                        className="inline-flex items-center text-sm font-bold text-white hover:text-primary transition-colors uppercase tracking-wide"
                                    >
                                        <Check className="w-4 h-4 mr-2 text-primary" /> Agendar Agora
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* CTA */}
            <section className="py-24 bg-card-bg border-t border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">Não sabe qual escolher?</h2>
                    <p className="text-gray-400 text-lg mb-10">
                        Nossos profissionais experientes podem ajudar você a encontrar o estilo perfeito para o seu rosto e personalidade.
                    </p>
                    <Link
                        to="/contato"
                        className="btn-outline px-10 py-4 text-lg hover:bg-primary hover:text-dark"
                    >
                        Fale Conosco
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Services;
