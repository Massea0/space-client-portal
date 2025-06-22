// /Users/a00/myspace/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User, LoginCredentials, AuthContextType } from '@/types/auth';
import { supabase } from '@/lib/supabaseClient';
import { AuthError, Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedUser {
    data: User;
    timestamp: number;
}

interface UserProfileDb {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'client' | 'admin';
    company_id?: string;
    phone?: string;
    created_at: string;
    is_active: boolean;
    deleted_at?: string | null;
    companies?: { name: string } | null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const userProfileCache = useRef<Map<string, CachedUser>>(new Map());

    const fetchFullUserProfile = useCallback(async (sessionUser: Session['user']): Promise<User | null> => {
        const now = Date.now();
        const cachedProfile = userProfileCache.current.get(sessionUser.id);

        if (cachedProfile && (now - cachedProfile.timestamp) < CACHE_DURATION) {
            return cachedProfile.data;
        }

        try {
            const { data: userProfile, error: profileError } = await supabase
                .from('users')
                .select('*, companies(name)')
                .eq('id', sessionUser.id)
                .single();

            if (profileError) {
                console.error('[AuthContext] Error fetching profile:', profileError.message);
                return null;
            }

            if (userProfile) {
                const typedProfile = userProfile as UserProfileDb;
                const mappedUser: User = {
                    id: sessionUser.id,
                    email: typedProfile.email || sessionUser.email || '',
                    firstName: typedProfile.first_name,
                    lastName: typedProfile.last_name,
                    role: typedProfile.role,
                    companyId: typedProfile.company_id,
                    phone: typedProfile.phone,
                    companyName: typedProfile.companies?.name,
                    isActive: typedProfile.is_active,
                    deletedAt: typedProfile.deleted_at ? new Date(typedProfile.deleted_at) : null,
                };

                userProfileCache.current.set(sessionUser.id, {
                    data: mappedUser,
                    timestamp: now
                });

                return mappedUser;
            }
            return null;
        } catch (e) {
            console.error('[AuthContext] fetchFullUserProfile:', e);
            return null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);

        const processSession = async (session: Session | null) => {
            if (!mounted) return;

            if (!session?.user) {
                setUser(null);
                setError('');
                setIsLoading(false);
                return;
            }

            try {
                const fetchedUser = await fetchFullUserProfile(session.user);
                if (!mounted) return;

                if (fetchedUser && (!fetchedUser.isActive || fetchedUser.deletedAt)) {
                    await supabase.auth.signOut();
                    setError(fetchedUser.deletedAt ? 'Votre compte a été supprimé.' : 'Votre compte a été désactivé.');
                    // Le signOut déclenchera onAuthStateChange qui nettoiera l'état.
                } else {
                    setUser(fetchedUser);
                    setError('');
                    setIsLoading(false);
                }
            } catch (e) {
                console.error('[AuthContext] Error processing session:', e);
                if (mounted) {
                    setUser(null);
                    setError('Impossible de traiter la session utilisateur.');
                    setIsLoading(false);
                }
            }
        };

        // Vérifie la session au chargement initial. Crucial pour les nouveaux onglets.
        supabase.auth.getSession().then(({ data: { session } }) => {
            processSession(session);
        });

        // Écoute les changements d'état d'authentification futurs.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            processSession(session);
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [fetchFullUserProfile]);

    const login = async (credentials: LoginCredentials): Promise<void> => {
        setIsLoading(true);
        setError('');
        try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(credentials);

            if (signInError) throw signInError;

            if (signInData.user) {
                // Pré-vérification du profil pour une réactivité immédiate en cas de compte inactif.
                const fetchedUser = await fetchFullUserProfile(signInData.user);
                if (fetchedUser && (!fetchedUser.isActive || fetchedUser.deletedAt)) {
                    await supabase.auth.signOut();
                    throw new Error(fetchedUser.deletedAt ? 'Votre compte a été supprimé.' : 'Votre compte a été désactivé.');
                }
                // Si l'utilisateur est valide, onAuthStateChange s'occupera de la mise à jour de l'état.
            } else {
                throw new Error("Authentification réussie mais aucune donnée utilisateur retournée.");
            }
        } catch (err) {
            let errorMessage = 'Une erreur inattendue est survenue lors de la connexion.';
            if (err instanceof AuthError || err instanceof Error) {
                errorMessage = err.message;
            }
            if (errorMessage.toLowerCase().includes('invalid login credentials')) {
                errorMessage = 'Email ou mot de passe incorrect.';
            }
            setError(errorMessage);
            setIsLoading(false);
            throw err;
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
            console.error('[AuthContext] Logout error:', signOutError);
            setError("La déconnexion a échoué.");
            setIsLoading(false);
        }
        // En cas de succès, onAuthStateChange s'occupera de la mise à jour de l'état.
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isLoading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};