import toast from 'react-hot-toast';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle, Loader, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

import PageHeader from '../components/layout/PageHeader';

const Cart: React.FC = () => {
    const { items, removeFromCart, updateQuantity, total, itemCount, clearCart } = useCart();
    const { user } = useAuth();
    const [isCheckingOut, setIsCheckingOut] = React.useState(false);
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-dark-bg">
                <PageHeader
                    title="O SEU CARRINHO"
                    subtitle="O seu carrinho está vazio."
                    backgroundImage="https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&q=80&w=2070"
                />
                <div className="pt-12 px-4 flex flex-col items-center justify-center text-center">
                    <div className="bg-dark p-8 rounded-lg border border-gray-800 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">O seu carrinho está vazio</h2>
                        <p className="text-gray-400 mb-8">Parece que ainda não adicionou nenhum produto.</p>
                        <Link to="/loja" className="btn-primary inline-flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a Loja
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg text-white">
            <PageHeader
                title={<>O SEU <span className="text-primary">CARRINHO</span></>}
                subtitle={`Tem ${itemCount} itens no seu carrinho.`}
                backgroundImage="https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&q=80&w=2070"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col sm:flex-row items-center p-6 gap-6"
                            >
                                <div className="bg-black/20 p-2 rounded-2xl w-full sm:w-auto flex-shrink-0">
                                    <img
                                        src={item.imagem_url}
                                        alt={item.nome}
                                        className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-xl"
                                    />
                                </div>
                                <div className="flex-grow text-center sm:text-left w-full">
                                    <h3 className="text-xl font-bold text-white line-clamp-1">{item.nome}</h3>
                                    <p className="text-sm text-gray-400 mb-2">{item.categoria}</p>
                                    <p className="text-primary font-bold text-lg">{item.preco.toFixed(2)}€</p>
                                </div>
                                <div className="flex sm:flex-col lg:flex-row items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t border-white/5 sm:border-t-0 pt-4 sm:pt-0 mt-4 sm:mt-0">
                                    <div className="flex items-center bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center text-white font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-3 text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors shrink-0"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl sticky top-24">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Resumo</h4>

                            <div className="space-y-4 text-sm mb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span>{total.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-lg pt-4 border-t border-white/10 mt-4">
                                    <span>Total</span>
                                    <span className="text-primary">{total.toFixed(2)}€</span>
                                </div>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 flex gap-3 text-amber-200/80">
                                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs leading-relaxed">As encomendas servem apenas como <strong>reserva</strong> dos produtos. O pagamento e o levantamento deverão ser efetuados presencialmente no nosso estabelecimento.</p>
                            </div>

                            <button
                                onClick={async () => {
                                    if (!user) {
                                        toast('Por favor, faça login para finalizar a compra.');
                                        return;
                                    }

                                    setIsCheckingOut(true);
                                    try {
                                        // Generate random 12-char code
                                        const codePart1 = Math.random().toString(36).substring(2);
                                        const codePart2 = Math.random().toString(36).substring(2);
                                        const code = (codePart1 + codePart2).substring(0, 12).toUpperCase();

                                        const { error } = await supabase.from('encomendas').insert({
                                            cliente_id: user.id,
                                            itens: items,
                                            total: total,
                                            status: 'pendente',
                                            codigo: code
                                        });

                                        if (error) throw error;

                                        clearCart();
                                        toast.success(`Encomenda registada com sucesso! O seu código de levantamento é: ${code}`);
                                        navigate('/');
                                    } catch (err) {
                                        console.error('Erro na encomenda:', err);
                                        toast.error('Erro ao finalizar encomenda.');
                                    } finally {
                                        setIsCheckingOut(false);
                                    }
                                }}
                                disabled={isCheckingOut}
                                className="w-full btn-primary py-4 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center disabled:opacity-50"
                            >
                                {isCheckingOut ? <Loader className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5 mr-2" /> Finalizar Encomenda</>}
                            </button>

                            <p className="text-xs text-center text-gray-500 mt-6">
                                Ao finalizar, receberá um código único para o levantamento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Cart;
