// /Users/a00/myspace/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, LoginCredentials, AuthContextType } from '@/types/auth';
import { supabase } from '@/lib/supabaseClient';
import { AuthError, Session } from '@supabase/supabase-js';
import { errorReporter } from '@/lib/errorReporter';

interface LocalSession {
    user_id: string;
    token: string;
    refreshToken: string;
    expires_at: number;
}

// Fonction pour vérifier si on a une session stockée localement
const getLocalSession = (): LocalSession | null => {
    try {
        const sessionStr = localStorage.getItem('supabase_auth_session');
        if (!sessionStr) return null;
        
        const session = JSON.parse(sessionStr);
        if (!session.user || !session.access_token) return null;
        
        return {
            user_id: session.user.id,
            token: session.access_token, 
            refreshToken: session.refresh_token,
            expires_at: session.expires_at
        };
    } catch (e) {
        console.error('[AuthContext] Error retrieving local session:', e);
        return null;
    }
};

// Fonction pour stocker la dernière URL visitée pour redirection après login
export const saveLastVisitedUrl = (url: string) => {
    if (url && !url.includes('/login') && !url.includes('/forgot-password')) {
        sessionStorage.setItem('redirectAfterLogin', url);
    }
};

// Fonction pour récupérer l'URL de redirection après login
export const getRedirectUrl = (): string | null => {
    return sessionStorage.getItem('redirectAfterLogin') || null;
};

// Fonction pour effacer l'URL de redirection après utilisation
export const clearRedirectUrl = () => {
    sessionStorage.removeItem('redirectAfterLogin');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_DURATION = 2000; // 2 secondes de debounce pour éviter les requêtes en cascade

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
    const profileRequestsInProgress = useRef<Map<string, number>>(new Map());

    const fetchFullUserProfile = useCallback(async (sessionUser: Session['user']): Promise<User | null> => {
        const now = Date.now();
        const cachedProfile = userProfileCache.current.get(sessionUser.id);

        if (cachedProfile && (now - cachedProfile.timestamp) < CACHE_DURATION) {
            return cachedProfile.data;
        }

        // Vérifier si une requête similaire est déjà en cours
        const lastRequestTime = profileRequestsInProgress.current.get(sessionUser.id);
        if (lastRequestTime && (now - lastRequestTime) < DEBOUNCE_DURATION) {
            console.log('[AuthContext] Duplicate profile request debounced');
            return cachedProfile ? cachedProfile.data : null;
        }

        // Marquer cette requête comme en cours
        profileRequestsInProgress.current.set(sessionUser.id, now);

        try {
            const { data: userProfile, error: profileError } = await supabase
                .from('users')
                .select('*, companies(name)')
                .eq('id', sessionUser.id)
                .single();

            if (profileError) {
                errorReporter.captureException(profileError, { 
                    component: 'AuthContext', 
                    action: 'fetchFullUserProfile',
                    userId: sessionUser.id
                });
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
            errorReporter.captureException(e, { 
                component: 'AuthContext', 
                action: 'fetchFullUserProfile',
                userId: sessionUser.id
            });
            return null;
        } finally {
            // Après un délai supplémentaire, supprimer l'entrée pour permettre de nouvelles requêtes
            setTimeout(() => {
                profileRequestsInProgress.current.delete(sessionUser.id);
            }, DEBOUNCE_DURATION);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);

        const processSession = async (session: Session | null) => {
            if (!mounted) return;

            if (!session?.user) {
                // Avant de déclarer qu'il n'y a pas d'utilisateur, vérifier s'il y a des informations dans localStorage
                // qui pourraient nous permettre de restaurer la session
                try {
                    const localSession = getLocalSession();
                    if (localSession) {
                        // Tenter de rafraîchir la session avec le refresh token
                        const { data: refreshResult, error: refreshError } = await supabase.auth.refreshSession();
                        if (refreshError) {
                            // La session ne peut pas être rafraîchie, on nettoie l'état
                            setUser(null);
                            setError('');
                            setIsLoading(false);
                        } else if (refreshResult?.session) {
                            // La session a été rafraîchie avec succès, on la traite
                            await processSession(refreshResult.session);
                            return;
                        }
                    }
                } catch (e) {
                    console.error('[AuthContext] Error refreshing session:', e);
                }
                // Si aucune session valide n'est trouvée, on met à jour l'état
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
        // Un flag pour éviter le traitement en double de la même session
        let sessionProcessed = false;
        
        // Récupérer la session initiale
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!sessionProcessed) {
                sessionProcessed = true;
                processSession(session);
            }
        });

        // Écoute les changements d'état d'authentification futurs.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // S'assurer que nous ne traitons pas la même session deux fois
            sessionProcessed = true;
            processSession(session);
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [fetchFullUserProfile]);

    const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
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
            errorReporter.captureException(err, { 
                component: 'AuthContext', 
                action: 'login',
                email: credentials.email
            });
            throw err;
        }
    }, [fetchFullUserProfile]);

    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
            errorReporter.captureException(signOutError, { 
                component: 'AuthContext', 
                action: 'logout',
                userId: user?.id
            });
            setError("La déconnexion a échoué.");
            setIsLoading(false);
        }
        // En cas de succès, onAuthStateChange s'occupera de la mise à jour de l'état.
    }, [user?.id]);

    const value = useMemo(() => ({
        user,
        login,
        logout,
        isLoading,
        error
    }), [user, login, logout, isLoading, error]);

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