/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { safeParseJSON, sanitizeInput } from '../utils/security';

const firebaseConfig = {
  apiKey: "AIzaSyBruQG9DmptbzG28DkHcWcVMYCMBU0JWUU",
  authDomain: "oval-aviary-kjkt0.firebaseapp.com",
  projectId: "oval-aviary-kjkt0",
  storageBucket: "oval-aviary-kjkt0.firebasestorage.app",
  messagingSenderId: "992361675954",
  appId: "1:992361675954:web:34474b55bb8b4d08cf9dab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, "ai-studio-07e28079-e88a-492f-98a8-8a2693d4951e");

// Helper: News Operations
export async function dbGetNews(): Promise<any[]> {
  try {
    const q = query(collection(db, 'news'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    console.error('Error fetching news from Firestore:', error);
    // Fallback to localStorage safely
    const stored = localStorage.getItem('forensic_news');
    return safeParseJSON<any[]>(stored, []);
  }
}

export async function dbSaveNewsArticle(article: any): Promise<void> {
  try {
    const articleId = sanitizeInput(article.id) || `news-${Date.now()}`;
    const cleanArticle = {
      ...article,
      id: articleId,
      title: sanitizeInput(article.title),
      category: sanitizeInput(article.category) || 'أخبار',
      content: sanitizeInput(article.content),
      summary: sanitizeInput(article.summary || ''),
      source: sanitizeInput(article.source || 'المركز'),
      date: sanitizeInput(article.date || new Date().toISOString().split('T')[0])
    };
    await setDoc(doc(db, 'news', articleId), cleanArticle);
  } catch (error) {
    console.error('Error saving news to Firestore:', error);
    throw error;
  }
}

export async function dbDeleteNewsArticle(id: string): Promise<void> {
  try {
    const safeId = sanitizeInput(id);
    await deleteDoc(doc(db, 'news', safeId));
  } catch (error) {
    console.error('Error deleting news from Firestore:', error);
    throw error;
  }
}

// Helper: Complaints Operations
export async function dbGetComplaints(): Promise<any[]> {
  try {
    const q = query(collection(db, 'complaints'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    console.error('Error fetching complaints from Firestore:', error);
    const stored = localStorage.getItem('forensic_complaints');
    return safeParseJSON<any[]>(stored, []);
  }
}

export async function dbSaveComplaint(complaint: any): Promise<void> {
  try {
    const complaintId = sanitizeInput(complaint.id) || `complaint-${Date.now()}`;
    const cleanComplaint = {
      ...complaint,
      id: complaintId,
      trackingCode: sanitizeInput(complaint.trackingCode),
      category: sanitizeInput(complaint.category),
      senderName: sanitizeInput(complaint.senderName),
      senderPhone: sanitizeInput(complaint.senderPhone),
      senderIdNumber: sanitizeInput(complaint.senderIdNumber),
      senderEmail: complaint.senderEmail ? sanitizeInput(complaint.senderEmail) : undefined,
      details: sanitizeInput(complaint.details),
      transactionCode: complaint.transactionCode ? sanitizeInput(complaint.transactionCode) : undefined,
      date: sanitizeInput(complaint.date || new Date().toISOString().split('T')[0]),
      status: sanitizeInput(complaint.status || 'قيد الدراسة والتحقق'),
      responseNotes: complaint.responseNotes ? sanitizeInput(complaint.responseNotes) : undefined
    };
    await setDoc(doc(db, 'complaints', complaintId), cleanComplaint);
  } catch (error) {
    console.error('Error saving complaint to Firestore:', error);
    throw error;
  }
}

export async function dbFindComplaintByCode(code: string): Promise<any | null> {
  try {
    const safeCode = sanitizeInput(code).trim();
    if (!safeCode) return null;
    const q = query(collection(db, 'complaints'), where('trackingCode', '==', safeCode));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error finding complaint by code in Firestore:', error);
    // Fallback search local
    const stored = localStorage.getItem('forensic_complaints');
    const list = safeParseJSON<any[]>(stored, []);
    const safeCode = sanitizeInput(code).trim().toLowerCase();
    return list.find((c: any) => c.trackingCode && c.trackingCode.trim().toLowerCase() === safeCode) || null;
  }
}

// Helper: Contact Us Messages Operations
export async function dbGetContacts(): Promise<any[]> {
  try {
    const q = query(collection(db, 'contacts'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    console.error('Error fetching contacts from Firestore:', error);
    const stored = localStorage.getItem('forensic_contacts');
    return safeParseJSON<any[]>(stored, []);
  }
}

export async function dbSaveContact(contact: any): Promise<void> {
  try {
    const contactId = sanitizeInput(contact.id) || `contact-${Date.now()}`;
    const cleanContact = {
      ...contact,
      id: contactId,
      name: sanitizeInput(contact.name),
      email: contact.email ? sanitizeInput(contact.email) : undefined,
      phone: sanitizeInput(contact.phone),
      subject: sanitizeInput(contact.subject),
      message: sanitizeInput(contact.message),
      date: sanitizeInput(contact.date || new Date().toISOString().split('T')[0]),
      status: sanitizeInput(contact.status || 'جديد / بانتظار الرد'),
      responseNotes: contact.responseNotes ? sanitizeInput(contact.responseNotes) : undefined
    };
    await setDoc(doc(db, 'contacts', contactId), cleanContact);
  } catch (error) {
    console.error('Error saving contact to Firestore:', error);
    throw error;
  }
}

// Helper: System Settings Operations
export async function dbGetSettings(docId: string, defaultData: any): Promise<any> {
  try {
    const safeDocId = sanitizeInput(docId);
    const docRef = doc(db, 'system_settings', safeDocId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Seed default on first fetch
      await setDoc(docRef, defaultData);
      return defaultData;
    }
  } catch (error) {
    console.error(`Error fetching settings for ${docId}:`, error);
    return defaultData;
  }
}

export async function dbSaveSettings(docId: string, data: any): Promise<void> {
  try {
    const safeDocId = sanitizeInput(docId);
    await setDoc(doc(db, 'system_settings', safeDocId), data, { merge: true });
  } catch (error) {
    console.error(`Error saving settings for ${docId}:`, error);
    throw error;
  }
}

// Real-time Listeners
export function dbListenNews(onUpdate: (news: any[]) => void): () => void {
  const q = query(collection(db, 'news'), orderBy('date', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    onUpdate(list);
  }, (error) => {
    console.error('Error listening to news from Firestore:', error);
  });
}

export function dbListenComplaints(onUpdate: (complaints: any[]) => void): () => void {
  const q = query(collection(db, 'complaints'), orderBy('date', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    onUpdate(list);
  }, (error) => {
    console.error('Error listening to complaints from Firestore:', error);
  });
}

export function dbListenContacts(onUpdate: (contacts: any[]) => void): () => void {
  const q = query(collection(db, 'contacts'), orderBy('date', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    onUpdate(list);
  }, (error) => {
    console.error('Error listening to contacts from Firestore:', error);
  });
}

export function dbListenSettings(docId: string, onUpdate: (data: any) => void): () => void {
  const safeDocId = sanitizeInput(docId);
  const docRef = doc(db, 'system_settings', safeDocId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data());
    }
  }, (error) => {
    console.error(`Error listening to settings for ${docId}:`, error);
  });
}
