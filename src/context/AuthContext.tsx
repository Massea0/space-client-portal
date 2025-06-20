// src/context/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
} from 'react';
import { User, LoginCredentials, AuthContextType } from '@/types/auth';
import { supabase } from '@/lib/supabaseClient';
import { AuthError, PostgrestError, Session } from '@supabase/supabase-js';

// Define a more specific type for Supabase query responses
interface SupabaseQueryDataResponse<DataType> {
    data: DataType | null;
    error: PostgrestError | null;
    status: number;
    count: number | null;
    statusText: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPABASE_REQUEST_TIMEOUT = 15000;

async function supabaseRequestWithTimeout<T>(
    builderFn: () => Promise<SupabaseQueryDataResponse<T>>,
    timeoutMs: number = SUPABASE_REQUEST_TIMEOUT
): Promise<SupabaseQueryDataResponse<T>> {
    let timeoutHandle: NodeJS.Timeout | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
            console.error(
                `[AuthContext] Supabase request timed out after ${timeoutMs}ms`
            );
            reject(new Error(`Supabase request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([builderFn(), timeoutPromise]);
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
        }
        return result;
    } catch (err: unknown) {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
        }
        console.error('[AuthContext] Supabase request failed or timed out:', err);
        if (err instanceof Error) {
            throw err;
        } else if (typeof err === 'object' && err !== null && 'message' in err) {
            throw new Error(String((err as { message: string }).message));
        } else {
            throw new Error('An unknown error occurred in Supabase request');
        }
    }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children,
                                                                      }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const lastSuccessfullyFetchedUserIdRef = useRef<string | null>(null);
    const activeSupabaseSessionRef = useRef<Session | null | undefined>(undefined);

    const fetchFullUserProfile = async (
        sessionUser: Session['user']
    ): Promise<User | null> => {
        try {
            type UserProfileDb = {
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
            };
            const { data: userProfile, error: profileError } =
                await supabaseRequestWithTimeout<UserProfileDb>(async () =>
                    supabase.from('users').select('*, companies(name)').eq('id', sessionUser.id).single()
                );

            if (profileError) {
                console.error('[AuthContext] fetchFullUserProfile: Error fetching profile:', profileError.message);
                return null;
            }
            if (userProfile) {
                const companyName = userProfile.companies?.name;
                return {
                    id: sessionUser.id,
                    email: userProfile.email || sessionUser.email || '',
                    firstName: userProfile.first_name,
                    lastName: userProfile.last_name,
                    role: userProfile.role,
                    companyId: userProfile.company_id,
                    phone: userProfile.phone,
                    companyName: companyName,
                    createdAt: new Date(userProfile.created_at),
                    isActive: userProfile.is_active,
                    deletedAt: userProfile.deleted_at ? new Date(userProfile.deleted_at) : null,
                };
            }
            console.warn('[AuthContext] fetchFullUserProfile: Profile not found for ID:', sessionUser.id);
            return null;
        } catch (e) {
            console.error('[AuthContext] fetchFullUserProfile: Exception:', e);
            return null;
        }
    };

    useEffect(() => {
        console.log('[AuthContext] Initializing AuthProvider.');
        setIsLoading(true);
        activeSupabaseSessionRef.current = undefined;
        lastSuccessfullyFetchedUserIdRef.current = null;

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, currentSupabaseSession) => {
                activeSupabaseSessionRef.current = currentSupabaseSession;
                console.log(
                    '[AuthContext] onAuthStateChange. Event:', event,
                    'Session User ID:', currentSupabaseSession?.user?.id
                );

                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    lastSuccessfullyFetchedUserIdRef.current = null;
                    setIsLoading(false);
                    return;
                }
                if (event === 'PASSWORD_RECOVERY') {
                    if (isLoading) setIsLoading(false);
                    return;
                }

                if (currentSupabaseSession?.user) {
                    const supabaseUserId = currentSupabaseSession.user.id;
                    let shouldFetchProfile = false;

                    if (event === 'INITIAL_SESSION' || event === 'USER_UPDATED' || lastSuccessfullyFetchedUserIdRef.current !== supabaseUserId) {
                        shouldFetchProfile = true;
                    } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && lastSuccessfullyFetchedUserIdRef.current === supabaseUserId) {
                        console.log(`[AuthContext] Event: ${event}. User ${supabaseUserId} already loaded. Skipping profile re-fetch.`);
                        shouldFetchProfile = false;
                        if (isLoading) setIsLoading(false);
                    } else {
                        shouldFetchProfile = true;
                    }

                    if (shouldFetchProfile) {
                        console.log(`[AuthContext] Fetching profile for ${supabaseUserId} (Event: ${event})`);
                        setIsLoading(true);
                        try {
                            const fetchedUser = await fetchFullUserProfile(currentSupabaseSession.user);
                            if (fetchedUser && (!fetchedUser.isActive || fetchedUser.deletedAt)) {
                                const reason = fetchedUser.deletedAt ? "in trash" : "inactive";
                                console.warn(`[AuthContext] User ${supabaseUserId} is ${reason}. Forcing sign out.`);
                                await supabase.auth.signOut();
                                setUser(null);
                                lastSuccessfullyFetchedUserIdRef.current = null;
                                setError(fetchedUser.deletedAt ? 'Your account has been deleted.' : 'Your account has been disabled. Please contact an administrator.');
                            } else {
                                setUser(fetchedUser);
                                if (fetchedUser) {
                                    lastSuccessfullyFetchedUserIdRef.current = supabaseUserId;
                                }
                                setError('');
                            }
                        } catch (e) {
                            console.error(`[AuthContext] Profile fetch exception for ${supabaseUserId}:`, e);
                            setUser(null);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                } else {
                    setUser(null);
                    lastSuccessfullyFetchedUserIdRef.current = null;
                    setIsLoading(false);
                }
            }
        );

        // MODIFIED: Simplified fallback initialization logic
        const initializeSession = async () => {
            if (activeSupabaseSessionRef.current === undefined) {
                console.log('[AuthContext] initializeSession: Manually checking session as a fallback.');
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        setIsLoading(false);
                        lastSuccessfullyFetchedUserIdRef.current = null;
                    }
                } catch (e) {
                    console.error('[AuthContext] initializeSession: Exception:', e);
                    setIsLoading(false);
                }
            }
        };

        // MODIFIED: Safer timeout logic to prevent race conditions
        const initTimer = setTimeout(() => {
            // This fallback only runs if the onAuthStateChange listener has not yet
            // fired. This handles edge cases where the listener is slow or fails,
            // preventing the app from being stuck in a loading state.
            if (activeSupabaseSessionRef.current === undefined) {
                initializeSession();
            }
        }, 1500); // Increased delay for more stability


        return () => {
            console.log('[AuthContext] Unsubscribing from onAuthStateChange.');
            authListener?.subscription.unsubscribe();
            clearTimeout(initTimer);
        };
    }, []);

    const login = async (credentials: LoginCredentials): Promise<void> => {
        setIsLoading(true);
        setError('');
        try {
            const { data: signInData, error: signInError } =
                await supabase.auth.signInWithPassword({
                    email: credentials.email,
                    password: credentials.password,
                });

            if (signInError) {
                setError(signInError.message || 'Login failed');
                setIsLoading(false);
                throw signInError;
            }

            if (signInData.user) {
                const fetchedUser = await fetchFullUserProfile(signInData.user);

                if (fetchedUser && (!fetchedUser.isActive || fetchedUser.deletedAt)) {
                    await supabase.auth.signOut();
                    const inactiveErrorMsg = fetchedUser.deletedAt ? 'Your account has been deleted.' : 'Your account has been disabled. Please contact an administrator.';
                    setError(inactiveErrorMsg);
                    setUser(null);
                    lastSuccessfullyFetchedUserIdRef.current = null;
                    setIsLoading(false);
                    throw new Error(inactiveErrorMsg);
                }
                setError('');
            } else {
                throw new Error("Authentication successful but no user object returned.");
            }
        } catch (err) {
            let errorMessage = 'An unexpected error occurred during login.';
            if (err instanceof AuthError) {
                errorMessage = err.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            const specificErrors = [
                'Your account has been disabled. Please contact an administrator.',
                'Your account has been deleted.'
            ];

            if (!(err instanceof Error && specificErrors.includes(err.message))) {
                if (errorMessage.toLowerCase().includes('invalid login credentials')) {
                    setError('Incorrect email or password.');
                } else {
                    setError(errorMessage);
                }
            } else {
                setError(errorMessage);
            }

            setUser(null);
            lastSuccessfullyFetchedUserIdRef.current = null;
            if(isLoading) setIsLoading(false);
            throw err;
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
                console.error('[AuthContext] logout: Supabase signOutError:', signOutError);
            }
        } catch (e) {
            console.error('[AuthContext] logout: Exception during sign out:', e);
        } finally {
            setUser(null);
            lastSuccessfullyFetchedUserIdRef.current = null;
            setError('');
            setIsLoading(false);
            console.log('[AuthContext] logout: User cleared and loading stopped in finally.');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
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