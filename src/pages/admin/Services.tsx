import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Save, Loader, Edit, Trash, X, Search, Plus, Scissors, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../../components/ui/ImageUpload';
import ConfirmModal from '../../components/modals/ConfirmModal';

interface Service {
    id: string;
    nome: string;
    descricao?: string;
    preco: number;
    duracao: number;
    imagem_url?: string;
    categoria: 'cabelo' | 'barba' | 'combo';
    disponivel: boolean;
}

const AdminServices: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentService, setCurrentService] = useState<Partial<Service>>({});
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('servicos')
                .select('*')
                .order('nome');

            if (error) throw error;
            setServices(data || []);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: Service) => {
        setCurrentService(service);
        setIsEditing(true);
    };

    const handleNew = () => {
        setCurrentService({ categoria: 'cabelo', disponivel: true });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setCurrentService({});
    };

    const handleDeleteClick = (id: string) => {
        setConfirmModal({ isOpen: true, id });
    };

    const handleConfirmDelete = async () => {
        if (!confirmModal.id) return;
        try {
            const { error } = await supabase.from('servicos').delete().eq('id', confirmModal.id);
            if (error) throw error;

            setServices(services.filter(s => s.id !== confirmModal.id));
            toast.success('Serviço removido com sucesso.');
        } catch (error: any) {
            console.error('Erro ao excluir:', error);
            toast.error('Erro ao excluir serviço: ' + error.message);
        } finally {
            setConfirmModal({ isOpen: false, id: null });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!currentService.nome || !currentService.preco || !currentService.duracao) {
                toast.error('Preencha todos os campos obrigatórios.');
                return;
            }

            const serviceData = {
                nome: currentService.nome,
                descricao: currentService.descricao || null,
                preco: parseFloat(currentService.preco.toString()),
                duracao: parseInt(currentService.duracao.toString()),
                imagem_url: currentService.imagem_url || null,
                categoria: currentService.categoria || 'cabelo',
                disponivel: currentService.disponivel !== undefined ? currentService.disponivel : true
            };

            if (currentService.id) {
                // Update
                const { error } = await supabase
                    .from('servicos')
                    .update(serviceData)
                    .eq('id', currentService.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('servicos')
                    .insert([serviceData]);
                if (error) throw error;
            }

            handleCancel();
            fetchServices();
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            toast.error('Erro ao salvar serviço: ' + error.message);
        }
    };

    const filteredServices = services.filter(service =>
        service.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white">Gestão de Serviços</h1>
                    <p className="text-gray-400">Gerencie os serviços oferecidos e seus preços.</p>
                </div>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={handleNew}
                        className="bg-primary text-black px-4 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Novo Serviço
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar serviço..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-primary/50 outline-none w-64"
                        />
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-zinc-900/80 backdrop-blur-md p-8 rounded-2xl border border-primary/20 max-w-2xl mx-auto shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">
                                {currentService.id ? 'Editar Serviço' : 'Novo Serviço'}
                            </h2>
                            <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Nome do Serviço</label>
                                    <div className="relative">
                                        <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={currentService.nome || ''}
                                            onChange={e => setCurrentService({ ...currentService, nome: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none"
                                            placeholder="Ex: Corte Degradê"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Descrição do Serviço (Opcional)</label>
                                    <textarea
                                        value={currentService.descricao || ''}
                                        onChange={e => setCurrentService({ ...currentService, descricao: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none min-h-[100px]"
                                        placeholder="Ex: Corte tradicional com tesoura e máquina..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Categoria <span className="text-red-500">*</span></label>
                                        <select
                                            value={currentService.categoria || 'cabelo'}
                                            onChange={e => setCurrentService({ ...currentService, categoria: e.target.value as 'cabelo' | 'barba' | 'combo' })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none appearance-none"
                                            required
                                        >
                                            <option value="cabelo">Cabelo</option>
                                            <option value="barba">Barba</option>
                                            <option value="combo">Combo</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center pt-8">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={currentService.disponivel !== false}
                                                onChange={e => setCurrentService({ ...currentService, disponivel: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-300">Serviço Disponível</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Preço (€)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={currentService.preco || ''}
                                                onChange={e => setCurrentService({ ...currentService, preco: parseFloat(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Duração (min)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="number"
                                                value={currentService.duracao || ''}
                                                onChange={e => setCurrentService({ ...currentService, duracao: parseInt(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none"
                                                placeholder="30"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <ImageUpload
                                    value={currentService.imagem_url}
                                    onChange={(url) => setCurrentService({ ...currentService, imagem_url: url })}
                                    label="Imagem do Serviço (Opcional)"
                                    placeholder="Clique para carregar a imagem do serviço"
                                    bucket="imagens"
                                    folder="servicos"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button type="button" onClick={handleCancel} className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                                <button type="submit" className="btn-primary px-8 py-2.5 font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center">
                                    <Save className="w-4 h-4 mr-2" /> Salvar Serviço
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
                        ) : filteredServices.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-500">Nenhum serviço encontrado.</div>
                        ) : (
                            filteredServices.map((service) => (
                                <motion.div layoutId={service.id} key={service.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group relative flex flex-col">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                                        <button onClick={() => handleEdit(service)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteClick(service.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"><Trash className="w-4 h-4" /></button>
                                    </div>

                                    {service.imagem_url ? (
                                        <div className="w-full h-40 rounded-xl mb-4 overflow-hidden bg-black/40 relative">
                                            <img src={service.imagem_url} alt={service.nome} className="w-full h-full object-cover" />
                                            <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                                                <span className="text-sm font-bold text-white">{service.preco}€</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                                <Scissors className="w-6 h-6" />
                                            </div>
                                            <span className="text-lg font-bold text-white">{service.preco}€</span>
                                        </div>
                                    )}

                                    <h3 className="font-bold text-white text-lg mb-1">
                                        {service.nome}
                                        {!service.disponivel && <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-lg">Indisponível</span>}
                                    </h3>
                                    {service.descricao && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{service.descricao}</p>}
                                    <div className="flex items-center text-sm text-gray-400 justify-between">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {service.duracao} minutos
                                        </div>
                                        <span className="capitalize bg-white/5 px-2 py-1 rounded-md text-xs">{service.categoria}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="Excluir Serviço"
                message="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita e pode afetar as marcações existentes."
                confirmText="Excluir Serviço"
            />
        </div>
    );
};

export default AdminServices;
