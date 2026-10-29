'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    errorEmitter.on('permission-error', (error: FirestorePermissionError) => {
      // Em desenvolvimento, isso lançará um erro que aparece no overlay do Next.js
      // facilitando muito o debug das Regras de Segurança.
      throw error;
    });
  }, []);

  return null;
}
