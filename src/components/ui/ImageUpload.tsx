import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
    value?: string;
    onChange: (base64: string) => void;
    label?: string;
    className?: string;
    placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
    value, 
    onChange, 
    label = "Imagem", 
    className = "",
    placeholder = "Clique para carregar imagem"
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

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecione um arquivo de imagem válido.');
            return;
        }

        // Validate file size (max 5MB initial check, we will compress it)
        if (file.size > 5 * 1024 * 1024) {
            setError('A imagem é muito grande. O tamanho máximo é 5MB.');
            return;
        }

        setLoading(true);

        try {
            const compressedBase64 = await compressImage(file);
            onChange(compressedBase64);
        } catch (err) {
            setError('Erro ao processar imagem.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }

                    // Calculate new dimensions (max 800px width/height)
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.8 quality
                    const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(base64);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
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
                            <span className="text-sm font-medium">Processando imagem...</span>
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange("");
                                }}
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
                                <span className="block text-xs opacity-60">ou arraste para aqui</span>
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
