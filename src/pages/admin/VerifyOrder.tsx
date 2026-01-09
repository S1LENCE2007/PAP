import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader, Package, CheckCircle, AlertCircle, ShoppingBag, DollarSign, User, Phone, Mail } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/layout/PageHeader';

const VerifyOrder: React.FC = () => {
    const { } = useAuth(); // Only admin/barber can access
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
                .eq('codigo', code.toUpperCase())
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
        } catch (err) {
            console.error(err);
            alert('Erro ao atualizar estado.');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white pb-20">
            <PageHeader
                title="Validar Encomenda"
                subtitle="Validação e entrega de pedidos"
                backgroundImage="https://images.unsplash.com/photo-1621609764095-6b2363a01048?auto=format&fit=crop&q=80"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                {/* Search Box */}
                <div className="bg-zinc-900/90 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Insira o código (ex: X7K9P2M8N1L5)"
                                className="w-full bg-black/40 border-2 border-transparent focus:border-primary/50 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase tracking-widest font-mono font-bold text-lg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !code}
                            className="bg-primary hover:bg-primary/90 text-dark font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Verificar Código'}
                        </button>
                    </form>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Order Result */}
                <AnimatePresence mode='wait'>
                    {order && (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            {/* Status Banner */}
                            <div className={`py-4 px-8 flex items-center justify-between font-bold uppercase tracking-widest text-sm
                                ${order.status === 'entregue'
                                    ? 'bg-emerald-500 text-emerald-950'
                                    : 'bg-amber-500 text-amber-950'}`}>
                                <span className="flex items-center gap-2">
                                    {order.status === 'entregue' ? <CheckCircle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                    Estado: {order.status}
                                </span>
                                <span className="font-mono opacity-80">#{order.id.slice(0, 8)}</span>
                            </div>

                            <div className="p-8 grid md:grid-cols-2 gap-12">
                                {/* Left Column: Client & Totals */}
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Cliente</h3>
                                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-primary">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg text-white">{order.cliente?.nome || 'Cliente'}</p>
                                                    <p className="text-gray-400 text-xs uppercase tracking-wide">Perfil de Cliente</p>
                                                </div>
                                            </div>
                                            <div className="border-t border-white/5 pt-4 space-y-3">
                                                <div className="flex items-center gap-3 text-gray-300">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm">{order.cliente?.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-300">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm">{order.cliente?.telemovel || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Pagamento</h3>
                                        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-6 border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <div className="p-2 bg-white/5 rounded-lg">
                                                    <DollarSign className="w-5 h-5" />
                                                </div>
                                                <span>Total do Pedido</span>
                                            </div>
                                            <span className="text-3xl font-bold text-primary">{order.total}€</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Items & Actions */}
                                <div className="flex flex-col h-full">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Itens ({order.itens?.length || 0})</h3>
                                    <div className="bg-white/5 rounded-2xl border border-white/5 flex-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {order.itens?.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {item.imagem_url ? (
                                                        <img src={item.imagem_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <ShoppingBag className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white truncate">{item.nome}</p>
                                                    <p className="text-xs text-gray-500">{item.categoria}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono text-primary font-bold">{(item.preco * item.quantity).toFixed(2)}€</p>
                                                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {order.status !== 'entregue' ? (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleDeliver}
                                            className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Confirmar Entrega
                                        </motion.button>
                                    ) : (
                                        <div className="mt-6 bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                                            <p className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                Entregue com sucesso
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Esta encomenda já foi processada.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VerifyOrder;
