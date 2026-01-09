import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Loader, Package, Calendar, DollarSign, QrCode } from 'lucide-react';
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

    return (
        <div className="min-h-screen bg-dark-bg text-white pb-20">
            <PageHeader
                title="Minhas Encomendas"
                subtitle="Consulte o histórico das suas compras"
                backgroundImage="https://images.unsplash.com/photo-1578983946288-7551065965ed?auto=format&fit=crop&q=80"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                {orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl">
                                                <Package className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    Encomenda #{order.id.slice(0, 8)}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-white font-bold">
                                                        <DollarSign className="w-4 h-4 text-primary" />
                                                        {order.total}€
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                ${order.status === 'entregue' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    order.status === 'cancelado' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="border-t border-white/5 py-4">
                                        <ul className="space-y-2">
                                            {order.itens?.map((item: any, i: number) => (
                                                <li key={i} className="flex justify-between text-sm text-gray-300">
                                                    <span>{item.quantity}x {item.nome}</span>
                                                    <span>{(item.preco * item.quantity).toFixed(2)}€</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Pickup Code Section */}
                                    {order.status !== 'entregue' && order.status !== 'cancelado' && (
                                        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <QrCode className="w-8 h-8 text-primary" />
                                                <div>
                                                    <p className="text-sm text-gray-400">Código de Levantamento</p>
                                                    <p className="text-xs text-gray-500">Apresente este código na barbearia</p>
                                                </div>
                                            </div>
                                            <div className="px-6 py-2 bg-white/10 rounded-lg border border-white/10">
                                                <span className="text-2xl font-mono font-bold text-primary tracking-widest select-all">
                                                    {order.codigo || '------'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-white/5">
                        <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Sem encomendas</h3>
                        <p className="text-gray-400">Ainda não realizou nenhuma compra na nossa loja.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
