import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: string | null;
    isAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

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

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
    };

    const isAdmin = role === 'admin';

    return (
        <AuthContext.Provider value={{ session, user, role, isAdmin, loading, signOut }}>
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
