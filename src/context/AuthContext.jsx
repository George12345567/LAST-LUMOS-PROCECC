/**
 * ═══════════════════════════════════════════════════════════════════
 * AuthContext.jsx - THE BRAIN (Single Source of Truth)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * This is the MASTER authentication system for Lumos Agency.
 * All authentication logic flows through this context.
 * 
 * CRITICAL FEATURES:
 * 1. MASTER KEY BYPASS: george30610@compit.aun.edu.eg is ALWAYS admin
 * 2. Profile fetching with graceful fallback
 * 3. Fail-safe error handling
 * 4. Session persistence across refreshes
 * 
 * STATE STRUCTURE:
 * - user: Supabase user object (id, email, etc.)
 * - role: 'admin' | 'customer' | 'guest'
 * - profile: Full profile from DB (full_name, avatar_url, etc.)
 * - loading: Initialization state
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════
// MASTER KEY - Hardcoded Admin Email
// ═══════════════════════════════════════════════════════════════════
const MASTER_ADMIN_EMAIL = 'george30610@compit.aun.edu.eg';

// Create Context
const AuthContext = createContext({});

// Custom Hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// ═══════════════════════════════════════════════════════════════════
// AUTH PROVIDER - The Brain
// ═══════════════════════════════════════════════════════════════════
export const AuthProvider = ({ children }) => {
    // ═══ STATE: Single Source of Truth ═══
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('guest');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // ═══════════════════════════════════════════════════════════════
    // HELPER: Get User Role (with Master Key Check) - BULLETPROOF
    // ═══════════════════════════════════════════════════════════════
    const getUserRole = async (userEmail, userId) => {
        if (!userEmail) {
            console.warn('⚠️ No email provided to getUserRole');
            return 'customer';
        }

        // ═══ STEP A: MASTER KEY - HARDCODED ADMIN BYPASS (ALWAYS FIRST) ═══
        if (userEmail.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
            console.log('🔑 MASTER KEY ACTIVATED - Admin access granted IMMEDIATELY');
            return 'admin';
        }

        // ═══ STEP B: Database Lookup with TIMEOUT ═══
        try {
            // Timeout protection: 5 seconds max
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Database timeout')), 5000);
            });

            const dbPromise = supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            const { data, error } = await Promise.race([dbPromise, timeoutPromise]);

            if (error || !data) {
                console.warn('⚠️ Profile not found in database, defaulting to customer role');
                return 'customer';
            }

            console.log('✅ Role retrieved from database:', data.role);
            return data.role || 'customer';
        } catch (err) {
            console.warn('⚠️ Database query failed or timed out, defaulting to customer:', err.message);
            return 'customer';
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // HELPER: Fetch User Profile - BULLETPROOF with TIMEOUT
    // ═══════════════════════════════════════════════════════════════
    const fetchUserProfile = async (userId) => {
        if (!userId) return null;

        try {
            // Timeout protection: 5 seconds max
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
            });

            const dbPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const { data, error } = await Promise.race([dbPromise, timeoutPromise]);

            if (error || !data) {
                console.warn('⚠️ Profile not found, using fallback data');
                return null;
            }

            console.log('✅ Profile loaded:', data.full_name || data.email);
            return data;
        } catch (err) {
            console.warn('⚠️ Profile fetch failed or timed out, continuing without profile:', err.message);
            return null;
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION: Check Session on Mount
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                console.log('🔄 Initializing Auth System...');
                
                // Get active session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('❌ Session error:', error);
                    setUser(null);
                    setRole('guest');
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                // No session found
                if (!session || !session.user) {
                    console.log('👤 No active session - User is guest');
                    setUser(null);
                    setRole('guest');
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                // Session exists - Process user
                const currentUser = session.user;
                console.log('👤 Session found for:', currentUser.email);

                // Step A: Master Key Check
                const userRole = await getUserRole(currentUser.email, currentUser.id);
                
                // Step B: Fetch Profile
                const userProfile = await fetchUserProfile(currentUser.id);

                // Step C: Update State
                setUser(currentUser);
                setRole(userRole);
                setProfile(userProfile);
                
                console.log('✅ Auth initialized successfully:', {
                    email: currentUser.email,
                    role: userRole,
                    hasProfile: !!userProfile
                });

            } catch (err) {
                console.error('❌ Fatal error in auth initialization:', err);
                setUser(null);
                setRole('guest');
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔔 Auth state changed:', event);

            if (event === 'SIGNED_OUT') {
                setUser(null);
                setRole('guest');
                setProfile(null);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    const userRole = await getUserRole(session.user.email, session.user.id);
                    const userProfile = await fetchUserProfile(session.user.id);
                    
                    setUser(session.user);
                    setRole(userRole);
                    setProfile(userProfile);
                }
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // FUNCTION: Login
    // ═══════════════════════════════════════════════════════════════
    const login = async (email, password) => {
        try {
            console.log('🔐 Attempting login for:', email);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) {
                console.error('❌ Login error:', error.message);
                toast.error('خطأ في تسجيل الدخول: ' + error.message);
                return { success: false, error: error.message };
            }

            if (!data.user) {
                console.error('❌ No user returned from login');
                toast.error('خطأ غير متوقع في تسجيل الدخول');
                return { success: false, error: 'No user returned' };
            }

            // Get role and profile
            const userRole = await getUserRole(data.user.email, data.user.id);
            const userProfile = await fetchUserProfile(data.user.id);

            // Update state
            setUser(data.user);
            setRole(userRole);
            setProfile(userProfile);

            console.log('✅ Login successful:', {
                email: data.user.email,
                role: userRole
            });

            toast.success('تم تسجيل الدخول بنجاح!');
            return { success: true, user: data.user, role: userRole };

        } catch (err) {
            console.error('❌ Unexpected login error:', err);
            toast.error('حدث خطأ غير متوقع');
            return { success: false, error: err.message };
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // FUNCTION: Logout
    // ═══════════════════════════════════════════════════════════════
    const logout = async () => {
        try {
            console.log('🚪 Logging out...');

            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('❌ Logout error:', error);
                toast.error('خطأ في تسجيل الخروج');
                return;
            }

            // Clear state
            setUser(null);
            setRole('guest');
            setProfile(null);

            console.log('✅ Logout successful');
            toast.success('تم تسجيل الخروج بنجاح');

        } catch (err) {
            console.error('❌ Unexpected logout error:', err);
            toast.error('حدث خطأ غير متوقع');
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // FUNCTION: Sign Up (NEW - With Phone Support)
    // ═══════════════════════════════════════════════════════════════
    const signUp = async (email, password, fullName, phone = null) => {
        try {
            console.log('📝 Attempting sign up for:', email);

            // Prepare metadata
            const metadata = { full_name: fullName };
            if (phone) {
                metadata.phone = phone;
            }

            // Step 1: Sign up the user with metadata
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: metadata
                }
            });

            if (error) {
                console.error('❌ Sign up error:', error.message);
                toast.error('خطأ في التسجيل: ' + error.message);
                return { success: false, error: error.message };
            }

            if (!data.user) {
                console.error('❌ No user returned from sign up');
                toast.error('خطأ غير متوقع في التسجيل');
                return { success: false, error: 'No user returned' };
            }

            console.log('✅ User created in Auth system');

            // The database trigger should auto-create the profile
            // But we add a fallback just in case
            setTimeout(async () => {
                try {
                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('id', data.user.id)
                        .single();

                    if (!existingProfile) {
                        console.log('📝 Creating profile manually (trigger may have failed)');
                        
                        await supabase
                            .from('profiles')
                            .insert({
                                id: data.user.id,
                                email: email.trim(),
                                full_name: fullName,
                                role: 'customer'
                            });
                        
                        console.log('✅ Profile created successfully');
                    }
                } catch (profileErr) {
                    console.warn('⚠️ Profile check/creation error:', profileErr);
                }
            }, 1000);

            toast.success('تم إنشاء الحساب بنجاح!');
            return { success: true, user: data.user };

        } catch (err) {
            console.error('❌ Unexpected sign up error:', err);
            toast.error('حدث خطأ غير متوقع');
            return { success: false, error: err.message };
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // FUNCTION: Register (Legacy - Kept for Compatibility)
    // ═══════════════════════════════════════════════════════════════
    const register = async (email, password, fullName) => {
        // Call the new signUp function
        return await signUp(email, password, fullName);
    };

    // ═══════════════════════════════════════════════════════════════
    // CONTEXT VALUE
    // ═══════════════════════════════════════════════════════════════
    const value = {
        // State
        user,
        role,
        profile,
        loading,

        // Functions
        login,
        logout,
        register,
        signUp,  // NEW: Sign Up with phone support

        // Utilities
        isAuthenticated: !!user,
        isAdmin: role === 'admin',
        isCustomer: role === 'customer',
        isGuest: role === 'guest'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
