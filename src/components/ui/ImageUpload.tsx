import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabase';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
    placeholder?: string;
    bucket?: string; // Nome do bucket no Supabase Storage
    folder?: string; // Pasta dentro do bucket
    variant?: 'default' | 'avatar';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    label = "Imagem",
    className = "",
    placeholder = "Clique para carregar imagem",
    bucket = "imagens",
    folder = "produtos",
    variant = "default"
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        processFile(file);
    };

    const processFile = async (file?: File) => {
        setError(null);
        if (!file) return;

        // Validar tipo de ficheiro
        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecione um arquivo de imagem válido.');
            return;
        }

        // Limitar tamanho a 5MB
        if (file.size > 5 * 1024 * 1024) {
            setError('A imagem é muito grande. O tamanho máximo é 5MB.');
            return;
        }

        setLoading(true);

        try {
            // Gerar nome único para o ficheiro para evitar colisões
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

            // Fazer upload para o Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                // Se o bucket não existe, tentar criar ou mostrar erro claro
                if (uploadError.message.includes('Bucket not found')) {
                    setError('Bucket de armazenamento não encontrado. Cria o bucket "imagens" no Supabase Storage.');
                } else {
                    setError(`Erro no upload: ${uploadError.message}`);
                }
                return;
            }

            // Obter a URL pública do ficheiro
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            onChange(data.publicUrl);
        } catch (err) {
            setError('Erro ao fazer upload da imagem.');
            console.error(err);
        } finally {
            setLoading(false);
            // Limpar o input para permitir carregar o mesmo ficheiro novamente
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        // Se o valor atual é uma URL do Supabase Storage, apagar o ficheiro
        if (value && value.includes('supabase')) {
            try {
                // Extrair o caminho do ficheiro a partir da URL pública
                const urlParts = value.split(`/${bucket}/`);
                if (urlParts.length > 1) {
                    const filePath = urlParts[1];
                    await supabase.storage.from(bucket).remove([filePath]);
                }
            } catch (err) {
                console.error('Erro ao remover imagem do Storage:', err);
            }
        }
        onChange("");
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    if (variant === 'avatar') {
        return (
            <div className={`flex flex-col items-center space-y-2 ${className}`}>
                {label && <label className="text-sm text-gray-400 font-medium block text-center">{label}</label>}
                
                <div
                    className={`relative cursor-pointer transition-all duration-200 border-2 border-dashed rounded-full overflow-hidden w-28 h-28 flex items-center justify-center
                        ${dragActive ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/50 bg-black/40'}
                        ${error ? 'border-red-500/50' : ''}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-primary bg-black/60"
                            >
                                <Loader className="w-5 h-5 animate-spin" />
                            </motion.div>
                        ) : value ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative w-full h-full group"
                            >
                                <img src={value} alt="Avatar Preview" className="w-full h-full object-cover rounded-full" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-20"
                                    title="Remover imagem"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors p-4 text-center"
                            >
                                <ImageIcon className="w-6 h-6 mb-1" />
                                <span className="text-[10px] block opacity-60">Carregar</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {error && (
                    <p className="text-[11px] text-red-500 text-center max-w-[200px]">{error}</p>
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-sm text-gray-400 font-medium ml-1 block">{label}</label>

            <div
                className={`relative group cursor-pointer transition-all duration-200 border-2 border-dashed rounded-xl overflow-hidden
                    ${dragActive ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/50 bg-black/40'}
                    ${error ? 'border-red-500/50' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-48 flex flex-col items-center justify-center gap-3 text-primary"
                        >
                            <Loader className="w-8 h-8 animate-spin" />
                            <span className="text-sm font-medium">A fazer upload...</span>
                        </motion.div>
                    ) : value ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative h-48 w-full group-hover:opacity-90 transition-opacity"
                        >
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
                                <span className="flex items-center gap-2 text-white font-medium bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                    <Upload className="w-4 h-4" /> Alterar
                                </span>
                            </div>
                            <button
                                onClick={handleRemove}
                                className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors shadow-lg"
                                title="Remover imagem"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-48 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-primary transition-colors p-6 text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <span className="block font-medium text-sm">{placeholder}</span>
                                <span className="block text-xs opacity-60">ou arraste para aqui • máx. 5MB</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {error && (
                <p className="text-xs text-red-500 ml-1">{error}</p>
            )}
        </div>
    );
};

export default ImageUpload;
