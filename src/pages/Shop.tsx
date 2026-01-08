import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Filter, ShoppingCart, Plus, Loader } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useCart, type Product } from '../contexts/CartContext';

import PageHeader from '../components/layout/PageHeader';

const Shop: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('produtos')
                    .select('*');

                if (error) throw error;

                setProducts(data || []);
            } catch (error) {
                console.error('Erro ao buscar produtos:', error);
                // Optionally set error state to show to user
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const categories = ['Todos', ...Array.from(new Set(products.map(p => p.categoria)))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || product.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-dark-bg">
            <PageHeader
                title={<>LOJA <span className="text-primary">EXCLUSIVA</span></>}
                subtitle="Produtos selecionados pelos nossos barbeiros para manter o seu estilo impecável."
                backgroundImage="https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&q=80&w=2070"
            />

            <div className="max-w-7xl mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-card-bg p-6 rounded-2xl border border-white/5 shadow-lg">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar produtos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                                <Filter className="text-primary w-5 h-5 mr-2 flex-shrink-0" />
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                            ? 'bg-primary text-dark shadow-lg shadow-primary/20'
                                            : 'bg-dark-bg text-gray-400 hover:bg-white/5 hover:text-white border border-white/5'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -10 }}
                                    className="bg-card-bg rounded-2xl overflow-hidden border border-white/5 group shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col"
                                >
                                    <div className="relative h-72 overflow-hidden bg-white/5">
                                        <img
                                            src={product.imagem_url}
                                            alt={product.nome}
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${product.stock === 0 ? 'grayscale opacity-50' : ''}`}
                                        />
                                        {product.stock === 0 ? (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="text-white font-bold bg-red-500/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                                                    Esgotado
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="btn-primary transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center px-6 py-3 rounded-full"
                                                >
                                                    <Plus className="w-5 h-5 mr-2" /> Adicionar
                                                </button>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-dark/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                                            <span className="text-primary font-bold">{product.preco.toFixed(2)}€</span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2">{product.categoria}</div>
                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.nome}</h3>
                                        <div className="mt-auto pt-4 flex flex-col gap-3">
                                            {product.stock > 0 && product.stock <= 5 && (
                                                <span className="text-xs text-orange-500 font-bold">
                                                    Apenas {product.stock} unidades restantes!
                                                </span>
                                            )}
                                            <button
                                                onClick={() => product.stock > 0 && addToCart(product)}
                                                disabled={product.stock === 0}
                                                className={`w-full py-3 border rounded-xl font-bold transition-all md:hidden flex justify-center items-center ${product.stock === 0
                                                    ? 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed'
                                                    : 'bg-dark-bg border-white/10 text-gray-300 hover:bg-primary hover:text-dark hover:border-primary'
                                                    }`}
                                            >
                                                {product.stock === 0 ? 'Esgotado' : <><ShoppingCart className="w-5 h-5 mr-2" /> Adicionar</>}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20">
                                <ShoppingBag className="w-20 h-20 text-gray-800 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-2">Nenhum produto encontrado</h3>
                                <p className="text-gray-500">Tente ajustar sua busca ou filtros.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Shop;
