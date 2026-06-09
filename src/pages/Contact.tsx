import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Send } from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';

const Contact: React.FC = () => {
    return (
        <div className="min-h-screen bg-dark-bg">
            <PageHeader
                title={<>ENTRE EM <span className="text-primary">CONTACTO</span></>}
                subtitle="Estamos prontos para atendê-lo. Agende seu horário ou visite-nos para um café."
                backgroundImage="https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&q=80&w=2070"
            />

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="bg-card-bg p-8 rounded-2xl border border-white/5 shadow-xl">
                            <h3 className="text-2xl font-bold text-white mb-8 border-l-4 border-primary pl-4">Informações</h3>

                            <div className="space-y-4">
                                <div className="flex items-start group">
                                    <div className="bg-dark-bg p-4 rounded-xl mr-6 border border-white/5 group-hover:border-primary/50 transition-colors">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1 text-lg">Localização</h4>
                                        <p className="text-gray-400">Rua Principal, 123<br />3140-000 Montemor-o-Velho</p>
                                    </div>
                                </div>

                                <div className="flex items-start group">
                                    <div className="bg-dark-bg p-4 rounded-xl mr-6 border border-white/5 group-hover:border-primary/50 transition-colors">
                                        <Phone className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1 text-lg">Telefone</h4>
                                        <p className="text-gray-400">+351 912 345 678</p>
                                    </div>
                                </div>

                                <div className="flex items-start group">
                                    <div className="bg-dark-bg p-4 rounded-xl mr-6 border border-white/5 group-hover:border-primary/50 transition-colors">
                                        <Mail className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1 text-lg">Email</h4>
                                        <p className="text-gray-400">geral@barbeariadourado.pt</p>
                                    </div>
                                </div>

                                <div className="flex items-start group">
                                    <div className="bg-dark-bg p-4 rounded-xl mr-6 border border-white/5 group-hover:border-primary/50 transition-colors">
                                        <Clock className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1 text-lg">Horário de Funcionamento</h4>
                                        <p className="text-gray-400">Segunda a Sábado: 09:00 - 19:00</p>
                                        <p className="text-gray-400">Domingo: Fechado</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 pt-8 border-t border-white/5">
                                <h4 className="font-bold text-white mb-4">Siga-nos</h4>
                                <div className="flex space-x-4">
                                    <a href="https://www.instagram.com/barberyvandourado/" target="_blank" rel="noopener noreferrer" className="bg-dark-bg p-3 rounded-full text-gray-400 hover:text-primary hover:bg-black transition-all border border-white/5 hover:border-primary/30">
                                        <Instagram className="w-6 h-6" />
                                    </a>
                                    <a href="#" className="bg-dark-bg p-3 rounded-full text-gray-400 hover:text-primary hover:bg-black transition-all border border-white/5 hover:border-primary/30">
                                        <Facebook className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Map & Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="bg-card-bg p-8 rounded-2xl border border-white/5 shadow-xl">
                            <h3 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4">Envie uma Mensagem</h3>
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Nome" className="bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none w-full" />
                                    <input type="email" placeholder="Email" className="bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none w-full" />
                                </div>
                                <input type="text" placeholder="Assunto" className="bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none w-full" />
                                <textarea placeholder="Mensagem" rows={4} className="bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none w-full"></textarea>
                                <button type="submit" className="btn-primary w-full flex justify-center items-center">
                                    <Send className="w-4 h-4 mr-2" /> Enviar Mensagem
                                </button>
                            </form>
                        </div>

                        <div className="h-[300px] bg-dark rounded-2xl border border-white/5 overflow-hidden relative shadow-xl">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d415.7506807235549!2d-8.631872311074613!3d40.213110638634845!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd22515504a820af%3A0x20b41df47a79847c!2sBarbearia%20Dourado!5e1!3m2!1spt-PT!2spt!4v1780160556088!5m2!1spt-PT!2spt"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Localização Barbearia Dourado"
                                className="grayscale hover:grayscale-0 transition-all duration-700"
                            ></iframe>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
