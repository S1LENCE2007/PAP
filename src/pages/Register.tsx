import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { Scissors, User, Mail, Lock, Phone, Loader, Eye, EyeOff } from 'lucide-react';
import ImageUpload from '../components/ui/ImageUpload';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        avatar_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
            setError('Todos os campos (Nome, Telemóvel e Email) são obrigatórios');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As palavras-passe não coincidem');
            setLoading(false);
            return;
        }

        try {
            // 1. Sign up user
            const { data, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        nome: formData.name,
                        telemovel: formData.phone,
                        avatar_url: formData.avatar_url
                    }
                }
            });

            if (authError) throw authError;

            if (data?.session && data.user) {
                // Wait for profile triggering to complete
                const user = data.user;
                let profileExists = false;
                for (let i = 0; i < 5; i++) {
                    if (!user) break;
                    const { data: profile } = await supabase.from('perfis').select('id').eq('id', user.id).single();
                    if (profile) {
                        profileExists = true;
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                if (!profileExists && user) {
                    console.warn('Profile creation delayed or failed. Attempting manual creation...');
                    // Fallback: Try to create profile manually
                    const { error: insertError } = await supabase.from('perfis').insert([{
                        id: user.id,
                        nome: formData.name,
                        email: formData.email,
                        telemovel: formData.phone,
                        avatar_url: formData.avatar_url,
                        role: 'client' // Default role
                    }]);

                    if (insertError) {
                        console.error('Manual profile creation failed:', insertError);
                        // If this fails, we really have a problem, but usually it's RLS or Duplicate
                    } else {
                        console.log('Profile created manually.');
                    }
                }
                navigate('/');
            } else if (data?.user) {
                // User created but no session => Email confirmation required
                setError('Conta criada com sucesso! Por favor, verifique o seu email para ativar a conta.');
                setLoading(false);
            } else {
                navigate('/');
            }

        } catch (err: unknown) {
            console.error('Registration Error:', err);
            let errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta';

            // Translate common Supabase errors
            if (errorMessage.includes('User already registered') || errorMessage.includes('already registered')) {
                errorMessage = 'Este email já está registado. Tente fazer login ou recuperar a palavra-passe.';
            }

            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1503951914875-452162b7f30a?auto=format&fit=crop&q=80&w=2070')` }}>
                <div className="absolute inset-0 bg-black/70 z-10" />
            </div>
            <motion.div
                className="max-w-4xl w-full bg-card-bg p-8 rounded-2xl border border-white/5 shadow-2xl relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-dark-bg rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/5">
                        <Scissors className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-white mb-1">Crie sua Conta</h2>
                    <p className="text-gray-400 text-sm">Junte-se à Barbearia Dourado</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-5 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Nome Completo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 pl-12 text-white focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>

                        {/* Foto de Perfil (Opcional) - no right side on desktop, spans 3 rows */}
                        <div className="md:row-span-3 md:col-start-2 md:row-start-1">
                            <ImageUpload
                                value={formData.avatar_url}
                                onChange={(url) => setFormData({ ...formData, avatar_url: url })}
                                bucket="imagens"
                                folder="perfis"
                                label="Foto de Perfil (Opcional)"
                            />
                        </div>

                        {/* Telemóvel */}
                        <div className="md:col-start-1">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Telemóvel <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 pl-12 text-white focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Seu telefone"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="md:col-start-1">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 pl-12 text-white focus:border-primary focus:outline-none transition-colors"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        {/* Palavra-passe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Palavra-passe <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 pl-12 pr-12 text-white focus:border-primary focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar Palavra-passe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Confirmar Palavra-passe <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 pl-12 pr-12 text-white focus:border-primary focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3.5 font-bold uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4 rounded-lg shadow-lg shadow-primary/20"
                    >
                        {loading ? <Loader className="animate-spin w-5 h-5" /> : 'Criar Conta'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-primary hover:text-secondary font-semibold transition-colors">
                        Entrar
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
