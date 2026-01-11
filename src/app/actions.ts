'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { FormData } from './page';

export async function saveSurvey(data: FormData) {
  try {
    await addDoc(collection(db, 'pesquisas_baiano_burger'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: 'Ocorreu um erro ao enviar sua pesquisa. Tente novamente.' };
  }
}
