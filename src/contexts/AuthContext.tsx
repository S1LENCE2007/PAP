import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: string | null;
    isAdmin: boolean;
    isProfessionalAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isProfessionalAdmin, setIsProfessionalAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchUserRole = async (userId: string) => {
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                // Check 'perfis' table
                const { data, error } = await supabase
                    .from('perfis')
                    .select('role')
                    .eq('id', userId)
                    .single();

                if (data) {
                    console.log('Role fetched:', data.role);
                    setRole(data.role);
                    if (data.role === 'admin') {
                        const { data: barber } = await supabase
                            .from('barbeiros')
                            .select('disponivel')
                            .eq('id', userId)
                            .maybeSingle();
                        setIsProfessionalAdmin(barber?.disponivel ?? false);
                    } else {
                        setIsProfessionalAdmin(false);
                    }
                    break;
                }

                if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned, which we want to retry on
                    console.error('Error fetching user role:', error);
                    break; // Don't retry on other errors
                }

                // If we're here, no data found yet or acceptable error
                console.log(`Attempt ${attempts + 1}: Profile not found yet, retrying...`);
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error('Unexpected error fetching role:', error);
                break;
            }
        }

        setLoading(false);
    };

    const refreshRole = async () => {
        if (user) {
            await fetchUserRole(user.id);
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setRole(null);
                setIsProfessionalAdmin(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Erro ao terminar sessão no Supabase:', error);
        } finally {
            setRole(null);
            setIsProfessionalAdmin(false);
            setUser(null);
            setSession(null);
        }
    };

    const isAdmin = role === 'admin';

    return (
        <AuthContext.Provider value={{ session, user, role, isAdmin, isProfessionalAdmin, loading, signOut, refreshRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
