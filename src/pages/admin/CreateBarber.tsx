import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Check, ArrowLeft, Loader, Shield, Sparkles, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import ImageUpload from '../../components/ui/ImageUpload';

const CreateBarber: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        bio: '',
        foto_url: '',
        email: '',
        password: '',
        confirmPassword: '',
        disponivel: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.password || formData.password.length < 6) {
            alert('A palavra-passe deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('As palavras-passe não coincidem.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.rpc('admin_create_barber_v2', {
                p_email: formData.email,
                p_password: formData.password,
                p_nome: formData.nome,
                p_bio: formData.bio,
                p_foto_url: formData.foto_url,
                p_role: 'barbeiro' // Explicitly setting the role
            });

            if (error) throw error;

            // Success animation or redirect
            alert('Barbeiro criado com sucesso!');
            navigate('/admin/gerenciar');

        } catch (error: any) {
            console.error('Erro ao criar barbeiro:', error);

            // Handle specific error for duplicate email
            if (error.message?.includes('duplicate key') || error.message?.includes('users_email_partial_key')) {
                alert('Erro: Este endereço de email já está registado. Por favor, utilize outro email.');
            } else {
                alert('Erro ao criar conta: ' + (error.message || 'Erro desconhecido'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <button
                    onClick={() => navigate('/admin/gerenciar')}
                    className="flex items-center text-gray-400 hover:text-primary transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar para Gestão
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Header Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-4xl font-heading font-bold text-white mb-2">Novo <span className="text-primary">Profissional</span></h1>
                            <p className="text-gray-400 leading-relaxed">
                                Adicione um novo talento à equipa Barberia Dourado.
                                Esta ação criará automaticamente uma conta de acesso e um perfil público.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-dark/50 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shield className="w-24 h-24 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Credenciais de Acesso
                            </h3>
                            <div className="space-y-3 text-sm text-gray-400">
                                <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span>{formData.email || 'email@exemplo.com'}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                    <Lock className="w-4 h-4 text-primary" />
                                    <span>{formData.password ? '••••••••' : 'Palavra-passe não definida'}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <form onSubmit={handleSubmit} className="bg-dark/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <div className="space-y-6">


                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Nome do Profissional</label>
                                        <div className="relative">
                                            <User className="w-5 h-5 absolute left-4 top-3.5 text-gray-500" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.nome}
                                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                                className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-gray-600"
                                                placeholder="Ex: João Silva"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Email de Acesso</label>
                                        <div className="relative">
                                            <Mail className="w-5 h-5 absolute left-4 top-3.5 text-gray-500" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-gray-600"
                                                placeholder="Ex: joao@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Senha de Acesso</label>
                                            <div className="relative">
                                                <Lock className="w-5 h-5 absolute left-4 top-3.5 text-gray-500" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 pl-12 pr-12 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-gray-600"
                                                    placeholder="Mínimo 6 caracteres"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-3.5 text-gray-500 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Confirmar Senha</label>
                                            <div className="relative">
                                                <Lock className="w-5 h-5 absolute left-4 top-3.5 text-gray-500" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={formData.confirmPassword}
                                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    className={`w-full bg-black/40 border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none transition-all placeholder:text-gray-600 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-700 focus:border-primary focus:ring-primary'
                                                        }`}
                                                    placeholder="Repita a senha"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <ImageUpload
                                            value={formData.foto_url}
                                            onChange={(base64) => setFormData({ ...formData, foto_url: base64 })}
                                            label="Foto de Perfil"
                                            placeholder="Carregar foto de perfil"
                                        />
                                    </div>



                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Biografia</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-gray-600 h-32 resize-none"
                                            placeholder="Descreva a experiência e especialidades..."
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                                >
                                    {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                                    Criar Conta de Profissional
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CreateBarber;
