import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Loader, Package, Calendar, DollarSign, QrCode, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import PageHeader from '../components/layout/PageHeader';

const MyOrders: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('encomendas')
                .select('*')
                .eq('cliente_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'entregue': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
            case 'cancelado': return 'bg-red-500/20 text-red-400 border-red-500/20';
            case 'pago': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            default: return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'entregue': return <CheckCircle className="w-4 h-4" />;
            case 'cancelado': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white pb-20">
            <PageHeader
                title="Minhas Encomendas"
                subtitle="Consulte o histórico das suas compras"
                backgroundImage="https://images.unsplash.com/photo-1578983946288-7551065965ed?auto=format&fit=crop&q=80"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                {orders.length > 0 ? (
                    <div className="grid gap-8">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl hover:shadow-primary/5 transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="bg-white/5 p-6 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-primary font-bold font-mono">
                                            #{order.id.slice(0, 4)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(order.created_at).toLocaleDateString('pt-PT', {
                                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                            <h3 className="text-lg font-bold text-white mt-0.5">
                                                Encomenda Registada
                                            </h3>
                                        </div>
                                    </div>

                                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
                                    {/* Items Grid */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Itens Adquiridos</h4>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {order.itens?.map((item: any, i: number) => (
                                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                    {item.imagem_url ? (
                                                        <img src={item.imagem_url} alt={item.nome} className="w-16 h-16 object-cover rounded-lg bg-black/20" />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                            <Package className="w-8 h-8 text-zinc-600" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-white line-clamp-1">{item.nome}</p>
                                                        <p className="text-sm text-gray-400 mb-2">{item.categoria}</p>
                                                        <div className="flex items-center gap-3 text-sm">
                                                            <span className="bg-black/30 px-2 py-0.5 rounded text-gray-300">x{item.quantity}</span>
                                                            <span className="text-primary font-bold">{item.preco}€</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary & Code */}
                                    <div className="md:col-span-1 border-l border-white/5 md:pl-8 space-y-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Resumo</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between text-gray-400">
                                                    <span>Subtotal</span>
                                                    <span>{order.total}€</span>
                                                </div>
                                                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10 mt-2">
                                                    <span>Total</span>
                                                    <span className="text-primary">{order.total}€</span>
                                                </div>
                                            </div>
                                        </div>

                                        {order.status !== 'entregue' && order.status !== 'cancelado' && (
                                            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-1 border border-primary/20">
                                                <div className="bg-zinc-900/90 rounded-xl p-4 text-center backdrop-blur-sm">
                                                    <div className="bg-white p-3 rounded-lg w-fit mx-auto mb-3">
                                                        <QrCode className="w-12 h-12 text-black" />
                                                    </div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Código de Levantamento</p>
                                                    <p className="text-3xl font-mono font-bold text-white tracking-[0.2em]">{order.codigo}</p>
                                                    <p className="text-[10px] text-primary mt-2 flex items-center justify-center gap-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Apresente ao balcão
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-zinc-900/50 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Sem encomendas</h3>
                        <p className="text-gray-400 max-w-sm mx-auto">Ainda não realizou nenhuma compra na nossa loja. Explore os nossos produtos!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
