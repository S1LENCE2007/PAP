import React, { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, Loader, Calendar, User, X, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/modals/ConfirmModal';

interface ContactMessage {
    id: string;
    nome: string;
    email: string;
    assunto: string;
    mensagem: string;
    lida: boolean;
    created_at: string;
}

const AdminMessages: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'todas' | 'lidas' | 'nao-lidas'>('todas');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('mensagens_contacto')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error: any) {
            console.error('Erro ao carregar mensagens:', error);
            // If table doesn't exist yet, help the admin understand
            if (error.message && error.message.includes('does not exist')) {
                toast.error('Tabela de mensagens não encontrada. Certifique-se de executar o script SQL de migração no painel do Supabase.', { duration: 8000 });
            } else {
                toast.error('Erro ao carregar mensagens de contacto.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRead = async (id: string, currentStatus: boolean) => {
        setIsActionLoading(true);
        try {
            const { error } = await supabase
                .from('mensagens_contacto')
                .update({ lida: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, lida: !currentStatus } : msg));
            
            // If the message is currently open in detail modal, update it there too
            if (selectedMessage && selectedMessage.id === id) {
                setSelectedMessage(prev => prev ? { ...prev, lida: !currentStatus } : null);
            }

            toast.success(currentStatus ? 'Mensagem marcada como não lida.' : 'Mensagem marcada como lida.');
        } catch (error) {
            console.error('Erro ao atualizar estado da mensagem:', error);
            toast.error('Erro ao atualizar mensagem.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setDeleteModal({ isOpen: true, id });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsActionLoading(true);
        try {
            const { error } = await supabase
                .from('mensagens_contacto')
                .delete()
                .eq('id', deleteModal.id);

            if (error) throw error;

            setMessages(prev => prev.filter(msg => msg.id !== deleteModal.id));
            if (selectedMessage && selectedMessage.id === deleteModal.id) {
                setSelectedMessage(null);
            }
            toast.success('Mensagem eliminada com sucesso.');
        } catch (error) {
            console.error('Erro ao eliminar mensagem:', error);
            toast.error('Erro ao eliminar a mensagem.');
        } finally {
            setIsActionLoading(false);
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const handleMarkAllRead = async () => {
        const unreadIds = messages.filter(m => !m.lida).map(m => m.id);
        if (unreadIds.length === 0) {
            toast('Não existem mensagens novas para marcar como lidas.');
            return;
        }

        setIsActionLoading(true);
        try {
            const { error } = await supabase
                .from('mensagens_contacto')
                .update({ lida: true })
                .in('id', unreadIds);

            if (error) throw error;

            setMessages(prev => prev.map(msg => ({ ...msg, lida: true })));
            toast.success('Todas as mensagens foram marcadas como lidas.');
        } catch (error) {
            console.error('Erro ao atualizar mensagens:', error);
            toast.error('Erro ao marcar mensagens como lidas.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredMessages = messages.filter(msg => {
        if (filter === 'lidas') return msg.lida;
        if (filter === 'nao-lidas') return !msg.lida;
        return true;
    });

    const unreadCount = messages.filter(m => !m.lida).length;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
                        Mensagens de Contacto
                        {unreadCount > 0 && (
                            <span className="bg-primary text-dark text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
                                {unreadCount} NOVAS
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-400">Gerencie e responda às mensagens de contacto enviadas pelos utilizadores.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchMessages}
                        disabled={loading}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white p-2.5 rounded-xl transition-all"
                        title="Atualizar mensagens"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            disabled={isActionLoading}
                            className="bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Marcar Todas como Lidas
                        </button>
                    )}
                </div>
            </header>

            {/* Filtros */}
            <div className="flex gap-2 border-b border-white/5 pb-4">
                {(['todas', 'nao-lidas', 'lidas'] as const).map((tab) => {
                    const count = tab === 'todas' 
                        ? messages.length 
                        : tab === 'nao-lidas' 
                            ? messages.filter(m => !m.lida).length 
                            : messages.filter(m => m.lida).length;

                    return (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                filter === tab
                                    ? 'bg-primary text-dark font-black shadow-lg shadow-primary/10'
                                    : 'bg-zinc-900/40 text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            {tab === 'todas' && 'Todas'}
                            {tab === 'nao-lidas' && 'Não Lidas'}
                            {tab === 'lidas' && 'Lidas'}
                            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${filter === tab ? 'bg-black/20 text-dark' : 'bg-white/5 text-gray-500'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Listagem */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader className="w-10 h-10 text-primary animate-spin" />
                </div>
            ) : filteredMessages.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredMessages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            layout
                            onClick={() => setSelectedMessage(msg)}
                            className={`
                                group relative bg-zinc-900/40 hover:bg-zinc-900 border rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4
                                ${!msg.lida ? 'border-primary/30 shadow-[0_0_15px_rgba(212,175,55,0.02)]' : 'border-white/5'}
                            `}
                        >
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className={`p-3 rounded-xl shrink-0 ${!msg.lida ? 'bg-primary/20 text-primary animate-pulse' : 'bg-white/5 text-gray-500'}`}>
                                    {msg.lida ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className={`font-bold truncate ${!msg.lida ? 'text-white text-base' : 'text-gray-300 text-sm'}`}>
                                            {msg.nome}
                                        </h3>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="text-xs text-gray-500 truncate">{msg.email}</span>
                                    </div>
                                    <h4 className={`font-semibold truncate ${!msg.lida ? 'text-primary' : 'text-gray-400'}`}>
                                        {msg.assunto}
                                    </h4>
                                    <p className="text-sm text-gray-400 line-clamp-1 pr-6">{msg.mensagem}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t border-white/5 md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                                <div className="flex items-center text-xs text-gray-500 gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(msg.created_at)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleRead(msg.id, msg.lida);
                                        }}
                                        className={`p-2 rounded-lg transition-colors border ${
                                            msg.lida 
                                                ? 'bg-zinc-800 text-gray-400 hover:text-white border-white/5' 
                                                : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
                                        }`}
                                        title={msg.lida ? "Marcar como não lida" : "Marcar como lida"}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(msg.id, e)}
                                        className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                        title="Eliminar mensagem"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-zinc-900/20 rounded-2xl border border-white/5 border-dashed">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                    <h3 className="text-xl font-bold text-white mb-2">Sem Mensagens</h3>
                    <p className="text-gray-500">
                        {filter === 'todas' && 'Não existem mensagens registadas no sistema.'}
                        {filter === 'lidas' && 'Não existem mensagens marcadas como lidas.'}
                        {filter === 'nao-lidas' && 'Não existem mensagens novas por responder.'}
                    </p>
                </div>
            )}

            {/* Janela Sobreposta (Modal) de Detalhes da Mensagem */}
            <AnimatePresence>
                {selectedMessage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMessage(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[101] shadow-2xl flex flex-col p-6 md:p-8"
                        >
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:text-primary rounded-full hover:bg-white/10 transition-colors z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="border-b border-white/5 pb-6 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                        selectedMessage.lida 
                                            ? 'bg-zinc-800 text-gray-400' 
                                            : 'bg-primary/20 text-primary'
                                    }`}>
                                        {selectedMessage.lida ? 'Lida' : 'Nova Mensagem'}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(selectedMessage.created_at)}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">{selectedMessage.assunto}</h2>
                                
                                <div className="flex flex-col gap-2 mt-4 text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="flex gap-2">
                                        <span className="text-gray-500 font-medium w-16">De:</span>
                                        <span className="text-white font-bold flex items-center gap-1.5">
                                            <User className="w-4 h-4 text-primary" /> {selectedMessage.nome}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-500 font-medium w-16">Email:</span>
                                        <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline font-medium">
                                            {selectedMessage.email}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-h-[150px] mb-8">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Mensagem</h3>
                                <p className="text-gray-200 leading-relaxed bg-black/10 p-6 rounded-2xl border border-white/5 whitespace-pre-wrap select-text">
                                    {selectedMessage.mensagem}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5 justify-between items-center">
                                <button
                                    onClick={() => handleDeleteClick(selectedMessage.id)}
                                    className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all text-sm font-bold flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Eliminar
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.lida)}
                                        className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all text-sm font-bold border border-white/5"
                                    >
                                        {selectedMessage.lida ? 'Marcar como Não Lida' : 'Marcar como Lida'}
                                    </button>
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Resposta: ${encodeURIComponent(selectedMessage.assunto)}`}
                                        className="px-6 py-3 bg-primary hover:bg-white text-dark rounded-xl transition-all text-sm font-black flex items-center gap-2"
                                    >
                                        Responder por Email <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="Eliminar Mensagem"
                message="Tem a certeza que deseja eliminar esta mensagem de contacto? Esta ação é irreversível."
                confirmText="Eliminar"
            />
        </div>
    );
};

export default AdminMessages;
