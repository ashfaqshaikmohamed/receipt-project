import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check for redirect result on mount
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        // If result is null, no redirect happened. If result exists, login was successful.
        if (result) {
          setAuthError(null);
        }
      } catch (error: any) {
        // Ignore "no redirect operation" errors which are common on normal load
        if (error.code !== 'auth/no-auth-event') {
          console.error("Redirect auth error:", error);
          setAuthError("Failed to complete Google Sign-In. Please try again.");
        }
      }
    };

    checkRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        setAuthError(null);
        try {
          const userRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.paymentProfile) {
              const existingProfile = localStorage.getItem('receipt_payment_profile');
              // Only update local storage if it's different to avoid loops/excessive events
              if (JSON.stringify(data.paymentProfile) !== existingProfile) {
                localStorage.setItem('receipt_payment_profile', JSON.stringify(data.paymentProfile));
                window.dispatchEvent(new Event('paymentProfileUpdated'));
              }
            }
          } else {
            // First time user initialization
            const defaultProfile = {
              venmoUsername: '',
              zelleContact: '',
              cryptoWallet: '',
              squareMerchantId: '',
              ownerName: authUser.displayName || ''
            };
            
            // Use setDoc for first-time profile creation
            await setDoc(userRef, {
              paymentProfile: defaultProfile,
              createdAt: serverTimestamp()
            }, { merge: true });

            localStorage.setItem('receipt_payment_profile', JSON.stringify(defaultProfile));
          }
        } catch (error) {
          console.error("Error syncing user profile:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Robust attempt: use popup, but handle environment constraints
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-blocked') {
        setAuthError("Sign-in popup was blocked. Please allow popups or try again.");
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, ignore or show subtle hint
      } else if (error.code === 'auth/operation-not-supported-in-this-environment' || error.code === 'auth/auth-domain-config-required') {
        // Fallback to redirect in environments where popup isn't working well
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          setAuthError("Sign-in failed. Please check your browser settings.");
        }
      } else {
        setAuthError("Google Sign-In failed. Please try again.");
      }
    }
  };

  const signOut = () => {
    setAuthError(null);
    return firebaseSignOut(auth);
  };

  return { user, loading, authError, signInWithGoogle, signOut, setAuthError };
};
