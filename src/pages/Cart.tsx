import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, Loader } from 'lucide-react';
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

            <div className="max-w-6xl mx-auto px-4 py-12">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                className="bg-dark p-4 rounded-lg border border-gray-800 flex items-center"
                            >
                                <img
                                    src={item.imagem_url}
                                    alt={item.nome}
                                    className="w-20 h-20 object-cover rounded bg-gray-800"
                                />
                                <div className="ml-4 flex-grow">
                                    <h3 className="font-bold text-white">{item.nome}</h3>
                                    <p className="text-primary font-bold">{item.preco.toFixed(2)}€</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center bg-gray-800 rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-2 text-gray-400 hover:text-white"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center text-white font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.stock}
                                            className={`p-2 transition-colors ${item.quantity >= item.stock ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-dark p-6 rounded-lg border border-gray-800 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-6">Resumo do Pedido</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span>{total.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Envio</span>
                                    <span>Grátis</span>
                                </div>
                                <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">{total.toFixed(2)}€</span>
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    if (!user) {
                                        alert('Por favor, faça login para finalizar a compra.');
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
                                        alert(`Encomenda registada com sucesso! O seu código de levantamento é: ${code}`);
                                        navigate('/');
                                    } catch (err) {
                                        console.error('Erro na encomenda:', err);
                                        alert('Erro ao finalizar encomenda.');
                                    } finally {
                                        setIsCheckingOut(false);
                                    }
                                }}
                                disabled={isCheckingOut}
                                className="w-full btn-primary py-3 font-bold uppercase tracking-wide flex items-center justify-center disabled:opacity-50"
                            >
                                {isCheckingOut ? <Loader className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5 mr-2" /> Finalizar Compra</>}
                            </button>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                Pagamento seguro processado por Stripe (Simulado)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Cart;
