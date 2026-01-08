import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Save, Loader, Edit, Trash, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
    id: string;
    nome: string;
    email: string;
    role: string;
    telemovel?: string;
}

const AdminManage: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<UserProfile>>({});
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('perfis')
                .select('*')
                .order('nome');

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Erro ao buscar utilizadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: UserProfile) => {
        setEditingId(user.id);
        setFormData({
            nome: user.nome,
            email: user.email,
            role: user.role,
            telemovel: user.telemovel || ''
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este utilizador? Ao fazer isso, ele perderá o acesso.')) return;

        try {
            // Note: Deleting from auth.users usually cascades to profiles, but we can't delete auth.users from client easily 
            // without a secure RPC function. However, assuming we just want to remove the profile or if there's a trigger...
            // Standard practice: Delete from profiles? Or better, just delete profile and let Supabase handle auth if configured.
            // CAUTION: Client-side delete of 'auth.users' is not possible.
            // We will delete the profile row.
            const { error } = await supabase.from('perfis').delete().eq('id', id);
            if (error) throw error;

            fetchUsers();
            alert('Utilizador removido com sucesso.');
        } catch (error: any) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir utilizador: ' + error.message);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Perform the update using the secure RPC function
            const { error } = await supabase.rpc('admin_update_user_v2', {
                p_user_id: editingId,
                p_nome: formData.nome,
                p_role: formData.role,
                p_telemovel: formData.telemovel
            });

            if (error) {
                console.error('RPC Error:', error);

                // Fallback or detailed error message
                if (error.message?.includes('function admin_update_user_v2') && error.message?.includes('does not exist')) {
                    alert(
                        'Erro: A função de atualização não foi encontrada no banco de dados.\n\n' +
                        'Por favor, execute o script SQL "20251216_admin_update_user.sql" no Painel do Supabase para habilitar essa funcionalidade.'
                    );
                } else {
                    throw error;
                }
                return;
            }

            handleCancel();
            await fetchUsers();
            alert('Utilizador atualizado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar utilizador: ' + error.message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesTab = true;
        if (activeTab === 'clients') matchesTab = user.role === 'client' || user.role === 'cliente'; // Handle both English/Portuguese just in case
        else if (activeTab === 'barbers') matchesTab = user.role === 'barbeiro' || user.role === 'barber';
        else if (activeTab === 'admins') matchesTab = user.role === 'admin';

        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white">Gestão de Utilizadores</h1>
                    <p className="text-gray-400">Gerencie permissões e dados dos utilizadores.</p>
                </div>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => window.location.href = '/admin/criar-barbeiro'}
                        className="bg-primary text-black px-4 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        + Novo Barbeiro
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar utilizador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-primary/50 outline-none w-64"
                        />
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-zinc-900/50 rounded-xl border border-white/10 overflow-x-auto max-w-full w-fit mb-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setActiveTab('clients')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'clients' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    Clientes
                </button>
                <button
                    onClick={() => setActiveTab('barbers')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'barbers' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    Barbeiros
                </button>
                <button
                    onClick={() => setActiveTab('admins')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'admins' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    Administradores
                </button>
            </div>

            <AnimatePresence mode="wait">
                {editingId ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-zinc-900/80 backdrop-blur-md p-8 rounded-2xl border border-primary/20 max-w-2xl mx-auto shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">Editar Utilizador</h2>
                            <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Email (Apenas leitura)</label>
                                    <input type="text" value={formData.email || ''} disabled
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Nome</label>
                                    <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Telemóvel</label>
                                    <input type="text" name="telemovel" value={formData.telemovel || ''} onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 font-medium ml-1 block mb-2">Função (Role)</label>
                                    <select name="role" value={formData.role || 'client'} onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none">
                                        <option value="client">Cliente</option>
                                        <option value="barbeiro">Barbeiro</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                    <p className="text-xs text-yellow-500/80 mt-2 ml-1">
                                        ⚠️ Atenção: "Barbeiro" dá acesso à agenda e "Administrador" dá acesso total ao sistema.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button type="button" onClick={handleCancel} className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                                <button type="submit" className="btn-primary px-8 py-2.5 font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center">
                                    <Save className="w-4 h-4 mr-2" /> Salvar Alterações
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
                        ) : filteredUsers.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-500">Nenhum utilizador encontrado.</div>
                        ) : (
                            filteredUsers.map((user) => (
                                <motion.div layoutId={user.id} key={user.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors group relative">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        {currentUserId !== user.id && (
                                            <>
                                                <button onClick={() => handleEdit(user)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><Trash className="w-4 h-4" /></button>
                                            </>
                                        )}
                                    </div>

                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 font-bold text-lg shrink-0">
                                        {user.nome ? user.nome.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-white truncate">{user.nome || 'Sem Nome'}</h3>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                user.role === 'barbeiro' || user.role === 'barber' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                            {user.telemovel && <span className="text-xs text-gray-600">{user.telemovel}</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminManage;
