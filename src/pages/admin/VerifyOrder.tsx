import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

const VerifyOrder: React.FC = () => {
    const { } = useAuth(); // Assuming only admin/barber can access this route via ProtectedRoute
    const [code, setCode] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const { data, error } = await supabase
                .from('encomendas')
                .select(`
                    *,
                    cliente:perfis(nome, telemovel, email)
                `)
                .eq('codigo', code.toUpperCase()) // Code is stored in uppercase
                .single();

            if (error) throw error;
            if (!data) throw new Error('Encomenda não encontrada.');

            setOrder(data);
        } catch (err: any) {
            console.error(err);
            setError('Código inválido ou encomenda não encontrada.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeliver = async () => {
        if (!order) return;
        if (!window.confirm('Confirmar entrega dos produtos?')) return;

        try {
            const { error } = await supabase
                .from('encomendas')
                .update({ status: 'entregue' })
                .eq('id', order.id);

            if (error) throw error;

            setOrder({ ...order, status: 'entregue' });
            alert('Encomenda marcada como entregue!');
        } catch (err) {
            console.error(err);
            alert('Erro ao atualizar estado.');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white p-6 pt-24">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Verificar Encomenda</h1>
                    <p className="text-gray-400">Insira o código de levantamento do cliente</p>
                </header>

                {/* Search Box */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Código (ex: X7K9P2)"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 uppercase tracking-widest font-mono font-bold"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !code}
                            className="bg-primary hover:bg-primary/90 text-black font-bold px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Verificar'}
                        </button>
                    </form>
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Order Result */}
                {order && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden relative"
                    >
                        {/* Status Banner */}
                        <div className={`py-3 px-6 flex items-center justify-between font-bold uppercase tracking-wide text-sm
                            ${order.status === 'entregue' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            <span>Estado: {order.status}</span>
                            {order.status === 'entregue' && <CheckCircle className="w-5 h-5" />}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Client Info */}
                            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{order.cliente?.nome || 'Cliente'}</h3>
                                    <p className="text-gray-400 text-sm">{order.cliente?.email}</p>
                                    <p className="text-gray-400 text-sm">{order.cliente?.telemovel || 'Sem telemóvel'}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="font-bold text-gray-300 mb-3 text-sm uppercase tracking-wider">Itens do Pedido</h4>
                                <ul className="space-y-3">
                                    {order.itens?.map((item: any, i: number) => (
                                        <li key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                            <span className="text-white font-medium">{item.quantity}x {item.nome}</span>
                                            <span className="text-primary font-bold">{(item.preco * item.quantity).toFixed(2)}€</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                                    <span className="text-gray-400">Total a pagar</span>
                                    <span className="text-2xl font-bold text-primary">{order.total}€</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {order.status !== 'entregue' && (
                                <button
                                    onClick={handleDeliver}
                                    className="w-full btn-primary py-4 font-bold text-lg uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-1 transition-all rounded-xl"
                                >
                                    Confirmar Entrega
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default VerifyOrder;
