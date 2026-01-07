import React, { useState, useEffect } from 'react';
import { Plus, Trash, Save, Loader, Image as ImageIcon, X, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../../components/ui/ImageUpload';

interface GalleryItem {
    id: string;
    url: string;
    descricao?: string;
    visible?: boolean;
    created_at: string;
}

const AdminGallery: React.FC = () => {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ url: '', descricao: '', visible: true });

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('galeria')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao buscar galeria:', error);
            } else {
                setImages(data || []);
            }
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({ url: '', descricao: '', visible: true });
        setIsCreating(true);
    };

    const handleEdit = (item: GalleryItem) => {
        setEditingId(item.id);
        setFormData({
            url: item.url,
            descricao: item.descricao || '',
            visible: item.visible ?? true // Default to true if undefined
        });
        setIsCreating(true);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData({ url: '', descricao: '', visible: true });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) return;

        try {
            const { error } = await supabase.from('galeria').delete().eq('id', id);
            if (error) throw error;
            fetchImages();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir imagem.');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Basic validation
            if (!formData.url) return;

            const payload = {
                url: formData.url,
                descricao: formData.descricao,
                visible: formData.visible
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('galeria')
                    .update(payload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('galeria')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            handleCancel();
            fetchImages();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar imagem. Verifique se a coluna "visible" existe na tabela.');
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white">Galeria</h1>
                    <p className="text-gray-400">Gerencie as fotos exibidas na galeria do site.</p>
                </div>

                {!isCreating && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreate}
                        className="btn-primary px-5 py-2.5 font-bold flex items-center shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Nova Imagem
                    </motion.button>
                )}
            </header>

            <AnimatePresence mode="wait">
                {isCreating ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-zinc-900/80 backdrop-blur-md p-8 rounded-2xl border border-primary/20 max-w-2xl mx-auto shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">{editingId ? 'Editar Imagem' : 'Adicionar Imagem'}</h2>
                            <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-primary uppercase tracking-wider ml-1 block">Imagem da Galeria</label>
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <ImageUpload
                                            value={formData.url}
                                            onChange={(base64) => setFormData({ ...formData, url: base64 })}
                                            label=""
                                            placeholder="Clique para carregar ou arraste"
                                            className="h-64"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-bold text-primary uppercase tracking-wider ml-1 block mb-2">Descrição</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.descricao}
                                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                                placeholder="Ex: Corte degradê moderno..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                                            />
                                            <p className="text-xs text-gray-500 mt-2 ml-1">Uma breve descrição ajuda no SEO e acessibilidade.</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <label className="text-sm font-bold text-primary uppercase tracking-wider ml-1 block mb-3">Visibilidade</label>
                                        <div
                                            onClick={() => setFormData({ ...formData, visible: !formData.visible })}
                                            className={`
                                                relative w-full p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between group
                                                ${formData.visible
                                                    ? 'bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(239,212,31,0.1)]'
                                                    : 'bg-black/40 border-white/10 hover:border-white/20'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg transition-colors ${formData.visible ? 'bg-primary text-dark' : 'bg-white/5 text-gray-400'}`}>
                                                    {formData.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <span className={`block font-bold text-lg transition-colors ${formData.visible ? 'text-primary' : 'text-gray-400'}`}>
                                                        {formData.visible ? 'Visível na Galeria' : 'Oculto na Galeria'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 block mt-0.5">
                                                        {formData.visible ? 'Os clientes poderão ver esta foto.' : 'Esta foto ficará guardada mas invisível.'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`
                                                w-14 h-7 rounded-full p-1 transition-colors duration-300 relative
                                                ${formData.visible ? 'bg-primary' : 'bg-zinc-700'}
                                            `}>
                                                <div className={`
                                                    w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300
                                                    ${formData.visible ? 'translate-x-7' : 'translate-x-0'}
                                                `} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button type="button" onClick={handleCancel} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                                <button type="submit" className="btn-primary px-8 py-3 font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    <Save className="w-5 h-5 mr-2" /> {editingId ? 'Salvar Alterações' : 'Adicionar à Galeria'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {loading ? (
                            <div className="col-span-full flex justify-center py-20">
                                <Loader className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : images.length > 0 ? (
                            images.map((item) => (
                                <motion.div
                                    layout
                                    key={item.id}
                                    className={`group relative bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${!item.visible ? 'border-red-500/30 opacity-75' : 'border-white/5 hover:border-primary/30'}`}
                                >
                                    <div className="aspect-square overflow-hidden bg-zinc-800">
                                        <img
                                            src={item.url}
                                            alt={item.descricao || 'Galeria'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {!item.visible && (
                                            <div className="absolute top-2 left-2 bg-red-500/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                                Oculto
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white/10 text-white rounded-full hover:bg-primary hover:text-dark transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {item.descricao && (
                                        <div className="p-3 border-t border-white/5 bg-zinc-900/50">
                                            <p className="text-sm text-gray-400 truncate">{item.descricao}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5 border-dashed">
                                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                                <h3 className="text-xl font-bold text-white mb-2">Galeria Vazia</h3>
                                <p className="text-gray-500 mb-6">Adicione fotos para aparecerem na galeria do site.</p>
                                <button onClick={handleCreate} className="btn-primary px-6 py-2 rounded-lg text-sm font-bold">
                                    Adicionar Primeira Foto
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminGallery;
