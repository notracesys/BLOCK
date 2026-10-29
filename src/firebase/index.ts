
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './config';
import React, { createContext, useContext, useEffect, useState } from 'react';

let appInstance: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

export function initializeFirebase() {
  if (!appInstance) {
    appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
  }
  return { app: appInstance, auth: authInstance!, db: dbInstance! };
}

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
});

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<FirebaseContextType>({
    app: null,
    auth: null,
    db: null,
  });

  useEffect(() => {
    const { app, auth, db } = initializeFirebase();
    setServices({ app, auth, db });
  }, []);

  return React.createElement(FirebaseContext.Provider, { value: services }, children);
}

export const useFirebaseApp = () => useContext(FirebaseContext).app;
export const useAuth = () => useContext(FirebaseContext).auth;
export const useFirestore = () => useContext(FirebaseContext).db;

/**
 * HOOK DE USUÁRIO CENTRALIZADO
 * Garante que a Role seja verificada no Firestore antes de liberar o carregamento
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'owner' | 'manager' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) return;
    
    return onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      if (u) {
        setUser(u);
        try {
          // Busca o documento do usuário para validar a Role
          const userSnap = await getDoc(doc(db, 'users', u.uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.role === 'owner' || data.isAdmin === true) {
              setRole('owner');
            } else if (data.role === 'manager') {
              setRole('manager');
            } else {
              setRole('user');
            }
          } else {
            setRole('user');
          }
        } catch (e) {
          console.error("Erro ao ler cargo:", e);
          setRole('user');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
  }, [auth, db]);

  return { user, role, loading };
}
