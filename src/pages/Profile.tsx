import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { User, Save, Shield, Lock, Mail, Phone } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import ImageUpload from '../components/ui/ImageUpload';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
    const { user, role, refreshRole } = useAuth();
    const [profileData, setProfileData] = useState({
        nome: '',
        telemovel: '',
        avatar_url: ''
    });

    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                nome: user.user_metadata?.nome || '',
                telemovel: user.user_metadata?.telemovel || '',
                avatar_url: user.user_metadata?.avatar_url || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('perfis')
                .update({
                    nome: profileData.nome,
                    telemovel: profileData.telemovel,
                    avatar_url: profileData.avatar_url
                })
                .eq('id', user?.id);

            if (error) throw error;

            await supabase.auth.updateUser({
                data: {
                    nome: profileData.nome,
                    telemovel: profileData.telemovel,
                    avatar_url: profileData.avatar_url
                }
            });

            toast.success('Perfil atualizado com sucesso!');
            window.location.reload();
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            toast.error('Erro ao atualizar perfil.');
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error('As palavras-passe não coincidem.');
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            });

            if (error) throw error;

            toast.success('Palavra-passe alterada com sucesso!');
            setPasswords({ new: '', confirm: '' });
        } catch (error) {
            console.error('Erro ao alterar palavra-passe:', error);
            toast.error('Erro ao alterar palavra-passe. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-gray-100 pb-20">
            <PageHeader
                title={<>MEU <span className="text-primary">PERFIL</span></>}
                subtitle="Faça a gestão das suas informações pessoais e segurança da conta."
                backgroundImage="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-10">
                <div className="space-y-8">
                    {/* User Profile Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl"
                    >
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-yellow-600 rounded-full blur opacity-20"></div>
                            <div className="relative w-full h-full bg-gray-800 rounded-full border-2 border-primary/50 flex items-center justify-center overflow-hidden">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-gray-400" />
                                )}
                            </div>
                            <div className="absolute bottom-1 right-1 bg-dark border border-gray-700 rounded-full p-2" title="Seu Cargo">
                                <Shield className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-heading font-bold text-white mb-2">{user?.user_metadata?.nome || 'Cliente'}</h2>
                            <p className="text-sm text-gray-400 mb-4">{role?.toUpperCase() || 'MEMBRO'}</p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span>{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span>{user?.user_metadata?.telemovel || 'Não definido'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Settings Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-8"
                    >
                        {/* Personal Details Card */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Informações Pessoais
                            </h3>

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={profileData.nome}
                                            onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                                            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Telemóvel</label>
                                        <input
                                            type="tel"
                                            value={profileData.telemovel}
                                            onChange={(e) => setProfileData({ ...profileData, telemovel: e.target.value })}
                                            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm text-gray-400">Email (Não editável)</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full bg-black/20 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed pl-12"
                                            />
                                            <Lock className="w-4 h-4 text-gray-600 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2 pt-2">
                                        <ImageUpload
                                            value={profileData.avatar_url}
                                            onChange={(url) => setProfileData({ ...profileData, avatar_url: url })}
                                            bucket="imagens"
                                            folder="perfis"
                                            label="Foto de Perfil"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-white/5 mt-6">
                                    <button type="submit" className="btn-primary px-8 py-3 flex items-center gap-2 rounded-xl">
                                        <Save className="w-5 h-5" />
                                        Guardar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Security Card */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Segurança da Conta
                            </h3>

                            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Nova Palavra-passe</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            placeholder="Mínimo 6 caracteres"
                                            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Confirmar Palavra-passe</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            placeholder="Repita a palavra-passe"
                                            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-white/5 mt-6">
                                    <button
                                        type="submit"
                                        className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!passwords.new || !passwords.confirm}
                                    >
                                        <Lock className="w-5 h-5" />
                                        Atualizar Palavra-passe
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
