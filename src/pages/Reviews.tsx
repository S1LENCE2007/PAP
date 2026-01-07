import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, User, MessageSquare, Send, Loader } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Review {
    id: string;
    nota: number;
    comentario: string;
    created_at: string;
    perfis: {
        nome: string;
    };
}

import PageHeader from '../components/layout/PageHeader';

const Reviews: React.FC = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('avaliacoes')
                .select(`
                    id,
                    nota,
                    comentario,
                    created_at,
                    perfis (nome)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            type ProfileData = { nome: string };

            interface ReviewData {
                id: string;
                nota: number;
                comentario: string;
                created_at: string;
                perfis: ProfileData | ProfileData[];
            }

            // Handle joined data structure
            const formattedReviews = (data as unknown as ReviewData[]).map(item => {
                const perfis = Array.isArray(item.perfis) ? item.perfis[0] : item.perfis;
                return {
                    ...item,
                    perfis: perfis ? { nome: perfis.nome } : { nome: 'Cliente' }
                };
            });

            setReviews(formattedReviews);
        } catch (err) {
            console.error('Erro ao buscar avaliações:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const { error } = await supabase
                .from('avaliacoes')
                .insert([
                    {
                        cliente_id: user.id,
                        nota: rating,
                        comentario: comment,
                        barbeiro_id: null // General review for now
                    }
                ]);

            if (error) throw error;

            setSuccess(true);
            setComment('');
            setRating(5);
            fetchReviews(); // Refresh list
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar avaliação');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg">
            <PageHeader
                title={<>O QUE DIZEM <span className="text-primary">NOSSOS CLIENTES</span></>}
                subtitle="A satisfação dos nossos clientes é a nossa maior recompensa."
                backgroundImage="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=1976"
            />

            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Submission Form */}
                {user ? (
                    <div className="bg-card-bg p-8 rounded-2xl border border-white/5 mb-16 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <MessageSquare className="w-6 h-6 mr-3 text-primary" /> Deixe sua Avaliação
                        </h3>

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl mb-6 flex items-center">
                                <Star className="w-5 h-5 mr-2 fill-current" />
                                Avaliação enviada com sucesso! Obrigado pelo feedback.
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 font-medium">Sua Nota</label>
                                <div className="flex space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`focus:outline-none transition-transform hover:scale-110 ${star <= rating ? 'text-primary' : 'text-gray-700'}`}
                                        >
                                            <Star className="w-10 h-10 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 font-medium">Seu Comentário</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full bg-dark-bg border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none h-32 transition-colors"
                                    placeholder="Conte-nos como foi sua experiência..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full flex justify-center items-center py-4 text-lg"
                            >
                                {submitting ? <Loader className="w-6 h-6 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                                Enviar Avaliação
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-card-bg p-10 rounded-2xl border border-white/5 mb-16 text-center shadow-xl">
                        <Star className="w-16 h-16 text-primary mx-auto mb-6 opacity-50" />
                        <h3 className="text-2xl font-bold text-white mb-4">Quer avaliar nossos serviços?</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">Faça login para compartilhar sua experiência com a comunidade Barbearia Dourado.</p>
                        <a href="/login" className="btn-outline px-8 py-3">Entrar na Conta</a>
                    </div>
                )}

                {/* Reviews List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="grid gap-6">
                        {reviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card-bg p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-all shadow-lg"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-dark-bg rounded-full flex items-center justify-center mr-4 border border-white/5 text-primary font-bold text-xl">
                                            {review.perfis?.nome ? review.perfis.nome.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{review.perfis?.nome || 'Cliente'}</h4>
                                            <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString('pt-PT')}</span>
                                        </div>
                                    </div>
                                    <div className="flex text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < review.nota ? 'fill-current' : 'text-gray-800'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="relative">
                                    <span className="absolute -top-2 -left-2 text-6xl text-primary/10 font-serif">"</span>
                                    <p className="text-gray-300 italic text-lg leading-relaxed pl-6 relative z-10">{review.comentario}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <MessageSquare className="w-20 h-20 text-gray-800 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">Nenhuma avaliação ainda</h3>
                        <p className="text-gray-500">Seja o primeiro a avaliar!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
