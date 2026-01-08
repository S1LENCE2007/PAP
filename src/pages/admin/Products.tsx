import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Save, Loader, ShoppingBag, X, Search } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../../components/ui/ImageUpload';

interface Product {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    stock: number;
    imagem_url: string;
    categoria: string;
}

const AdminProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Todas');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('produtos').select('*').order('nome');
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setFormData(product);
        setIsCreating(false);
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            nome: '',
            descricao: '',
            preco: 0,
            stock: 0,
            imagem_url: '',
            categoria: 'Cabelo'
        });
        setIsCreating(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsCreating(false);
        setFormData({});
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

        try {
            const { error } = await supabase.from('produtos').delete().eq('id', id);
            if (error) throw error;
            fetchProducts();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir produto.');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isCreating) {
                const { error } = await supabase.from('produtos').insert([formData]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('produtos').update(formData).eq('id', editingId);
                if (error) throw error;
            }

            handleCancel();
            fetchProducts();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar produto.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeTab === 'Todas' || product.categoria === activeTab;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white">Loja Online</h1>
                    <p className="text-gray-400">Gerencie o inventário de produtos.</p>
                </div>

                {!isCreating && !editingId && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreate}
                        className="btn-primary px-5 py-2.5 font-bold flex items-center shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Novo Produto
                    </motion.button>
                )}
            </header>

            {!isCreating && !editingId && (
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar produto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                    </div>
                    <div className="flex p-1 bg-zinc-900/50 rounded-xl border border-white/10 overflow-x-auto max-w-full">
                        <button
                            onClick={() => setActiveTab('Todas')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'Todas' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setActiveTab('Cabelo')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'Cabelo' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Cabelo
                        </button>
                        <button
                            onClick={() => setActiveTab('Barba')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'Barba' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Barba
                        </button>
                        <button
                            onClick={() => setActiveTab('Acessórios')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'Acessórios' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Acessórios
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {(isCreating || editingId) ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-zinc-900/80 backdrop-blur-md p-8 rounded-2xl border border-primary/20 max-w-3xl mx-auto shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">{isCreating ? 'Novo Produto' : 'Editar Produto'}</h2>
                            <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Nome do Produto</label>
                                        <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Preço (€)</label>
                                        <input type="number" name="preco" value={formData.preco || ''} onChange={handleChange} step="0.01"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Stock Inicial</label>
                                        <input type="number" name="stock" value={formData.stock || ''} onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" required />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Categoria</label>
                                        <select name="categoria" value={formData.categoria || 'Cabelo'} onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all">
                                            <option value="Cabelo">Cabelo</option>
                                            <option value="Barba">Barba</option>
                                            <option value="Acessórios">Acessórios</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                    <div className="pt-2">
                                        <ImageUpload
                                            value={formData.imagem_url}
                                            onChange={(base64) => setFormData({ ...formData, imagem_url: base64 })}
                                            label="Imagem do Produto"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Descrição</label>
                                <textarea name="descricao" value={formData.descricao || ''} onChange={handleChange} rows={3}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" required />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button type="button" onClick={handleCancel} className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                                <button type="submit" className="btn-primary px-8 py-2.5 font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center">
                                    <Save className="w-4 h-4 mr-2" /> Salvar Produto
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {loading ? (
                            <div className="col-span-full flex justify-center py-20">
                                <Loader className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : (
                            <>
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        layout
                                        key={product.id}
                                        className="bg-zinc-900 border border-white/5 rounded-2xl p-4 hover:border-primary/30 transition-colors group relative flex flex-col h-full"
                                    >
                                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button onClick={() => handleEdit(product)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 backdrop-blur-md"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 backdrop-blur-md"><Trash className="w-4 h-4" /></button>
                                        </div>

                                        <div className="relative h-48 mb-4 overflow-hidden rounded-xl bg-zinc-800">
                                            {product.imagem_url ? (
                                                <img src={product.imagem_url} alt={product.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600"><ShoppingBag className="w-12 h-12" /></div>
                                            )}
                                            <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-primary px-2 py-1 rounded-lg">
                                                {product.categoria}
                                            </span>
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <h3 className="font-bold text-white text-lg mb-1 leading-tight">{product.nome}</h3>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{product.descricao}</p>

                                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
                                                <span className="text-xl font-bold text-primary">{product.preco.toFixed(2)}€</span>
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {product.stock} em stock
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminProducts;
