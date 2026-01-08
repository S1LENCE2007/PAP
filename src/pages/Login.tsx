import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { Scissors, Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // ----------------------------------------------------------------
            // 1. AUTENTICAÇÃO (Email & Password)
            // ----------------------------------------------------------------
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // ----------------------------------------------------------------
            // 2. VERIFICAÇÃO DE ROLE (Base de Dados)
            // O sistema verifica o tipo de utilizador na tabela 'perfis'
            // ----------------------------------------------------------------
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Consulta à tabela 'perfis' para obter a role (admin, barbeiro, cliente)
                const { data: profile, error: profileError } = await supabase
                    .from('perfis')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError || !profile) {
                    console.warn('Perfil não encontrado. Tentando criar automaticamente...');

                    // AUTO-FIX: Create profile if missing (Zombie user scenario)
                    const { error: insertError } = await supabase.from('perfis').insert([{
                        id: user.id,
                        nome: user.user_metadata?.nome || 'Utilizador',
                        email: user.email,
                        telemovel: user.user_metadata?.telemovel || '',
                        role: 'client'
                    }]);

                    if (insertError) {
                        console.error('Falha ao criar perfil automático:', insertError);
                        setError('Erro ao carregar perfil de utilizador. Contacte o suporte.');
                        setLoading(false);
                        return;
                    }

                    // Retry fetching profile
                    const { data: newProfile } = await supabase.from('perfis').select('role').eq('id', user.id).single();

                    if (newProfile) {
                        console.log('Perfil recuperado/criado com sucesso.');
                        navigate('/');
                    } else {
                        setError('Erro crítico de perfil. Tente novamente mais tarde.');
                    }
                    return;
                }

                console.log('Login efetuado com perfil:', profile?.role);

                // 3. REDIRECIONAMENTO INTELIGENTE
                if (profile?.role === 'admin') {
                    navigate('/admin');
                } else if (profile?.role === 'barbeiro') {
                    navigate('/barbeiro');
                } else {
                    // Cliente padrão
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (err: unknown) {
            console.error('Login Error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Erro ao efetuar login. Verifique as suas credenciais.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-20 relative overflow-hidden">
            {/* ... (background code omitted for brevity) ... */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/70 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1503951914875-452162b7f30a?auto=format&fit=crop&q=80&w=2070"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
            </div>
            <motion.div
                className="max-w-md w-full bg-card-bg p-10 rounded-2xl border border-white/5 shadow-2xl relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-dark-bg rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                        <Scissors className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-white mb-2">Bem-vindo de volta</h2>
                    <p className="text-gray-400">Aceda à sua conta para agendar</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-8 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-dark-bg border border-white/10 rounded-lg p-4 pl-12 text-white focus:border-primary focus:outline-none transition-colors"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Palavra-passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-dark-bg border border-white/10 rounded-lg p-4 pl-12 pr-12 text-white focus:border-primary focus:outline-none transition-colors"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 font-bold uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-primary/20"
                    >
                        {loading ? <Loader className="animate-spin w-5 h-5" /> : 'Entrar'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Não tem uma conta?{' '}
                    <Link to="/registo" className="text-primary hover:text-secondary font-semibold transition-colors">
                        Registar-se
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
