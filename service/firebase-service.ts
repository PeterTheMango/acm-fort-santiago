import {
  collection,
  getDocs,
  addDoc,
  doc as docRef,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query as q,
  where,
  orderBy,
  limit as qLimit,
  startAfter,
  setDoc,
  onSnapshot,
  serverTimestamp,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData,
  WithFieldValue,
  GeoPoint,
  DocumentReference,
  Bytes,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase";

// --- Helpers ---------------------------------------------------------------

export type WithId<T> = T & { docId: string };

// Lightweight JSON-safe conversion only when needed
export function toPlain(value: any): any {
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof DocumentReference) return value.path;
  if (value instanceof GeoPoint)
    return { lat: value.latitude, lng: value.longitude };
  if (value instanceof Bytes) return value.toBase64(); // or value.toUint8Array()
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const k of Object.keys(value)) out[k] = toPlain(value[k]);
    return out;
  }
  return value;
}

// Generic Firestore converter
export const makeConverter = <T>() => ({
  toFirestore(data: WithFieldValue<T>): DocumentData {
    return data as DocumentData;
  },
  fromFirestore(snap: QueryDocumentSnapshot): WithId<T> {
    // Keep Firestore-native types; only call toPlain() at the UI boundary.
    return { docId: snap.id, ...(snap.data() as T) };
  },
});

// --- CRUD ------------------------------------------------------------------

export async function getOne<T>(
  collectionPath: string,
  id: string
): Promise<WithId<T> | null> {
  try {
    const snap = await getDoc(
      docRef(db, collectionPath, id).withConverter(makeConverter<T>())
    );
    return snap.exists() ? (snap.data()! as WithId<T>) : null;
  } catch (e) {
    throw new Error(
      `getOne(${collectionPath}/${id}) failed: ${(e as Error).message}`
    );
  }
}

type ListOptions = {
  filters?: Array<ReturnType<typeof where>>;
  orders?: Array<ReturnType<typeof orderBy>>;
  pageSize?: number;
  startAfterSnap?: QueryDocumentSnapshot; // supply last doc for pagination
};

export async function list<T>(
  collectionPath: string,
  opts: ListOptions = {}
): Promise<{ items: WithId<T>[]; last?: QueryDocumentSnapshot<unknown, DocumentData> }> {
  const constraints: QueryConstraint[] = [];
  if (opts.filters) constraints.push(...opts.filters);
  if (opts.orders) constraints.push(...opts.orders);
  if (opts.pageSize) constraints.push(qLimit(opts.pageSize));
  if (opts.startAfterSnap) constraints.push(startAfter(opts.startAfterSnap));

  try {
    const cq = q(collection(db, collectionPath), ...constraints).withConverter(
      makeConverter<T>()
    );
    const snap = await getDocs(cq);
    const items = snap.docs.map((d) => d.data()) as WithId<T>[];
    const last = snap.docs.at(-1);
    return { items, last };
  } catch (e) {
    throw new Error(`list(${collectionPath}) failed: ${(e as Error).message}`);
  }
}

export async function addOne<T>(
  collectionPath: string,
  data: WithFieldValue<T>,
  id?: string,
  {
    merge = false,
    touchTimestamps = true,
    failIfExists = false,
  }: { merge?: boolean; touchTimestamps?: boolean; failIfExists?: boolean } = {}
): Promise<string> {
  const payload = touchTimestamps
    ? {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(data as object),
      }
    : data;

  try {
    if (id) {
      const ref = docRef(db, collectionPath, id);
      if (failIfExists && (await getDoc(ref)).exists()) {
        throw new Error(
          `addOne: document already exists at ${collectionPath}/${id}`
        );
      }
      await setDoc(ref, payload as Record<string, unknown>, { merge });
      return id;
    }
    const ref = await addDoc(collection(db, collectionPath), payload as Record<string, unknown>);
    return ref.id;
  } catch (e) {
    throw new Error(
      `addOne(${collectionPath}) failed: ${(e as Error).message}`
    );
  }
}

export async function patchOne<T extends object>(
  collectionPath: string,
  id: string,
  data: Partial<T>,
  { touchUpdatedAt = true }: { touchUpdatedAt?: boolean } = {}
): Promise<void> {
  try {
    const body = touchUpdatedAt
      ? { ...data, updatedAt: serverTimestamp() }
      : data;
    await updateDoc(docRef(db, collectionPath, id), body as any);
  } catch (e) {
    throw new Error(
      `patchOne(${collectionPath}/${id}) failed: ${(e as Error).message}`
    );
  }
}

/**
 * Deletes the document at the specified collection path and document id.
 *
 * @throws Error if the delete operation fails; the error message includes the `collectionPath/id` and the underlying error message.
 */
export async function removeOne(
  collectionPath: string,
  id: string
): Promise<void> {
  try {
    await deleteDoc(docRef(db, collectionPath, id));
  } catch (e) {
    throw new Error(
      `removeOne(${collectionPath}/${id}) failed: ${(e as Error).message}`
    );
  }
}

/**
 * Retrieve the first document in a collection that matches the provided where filters.
 *
 * @param collectionPath - Path to the Firestore collection
 * @param filters - Array of `where` query constraints to filter results
 * @param options - Optional query options (e.g., `orders`) that modify sorting or other constraints
 * @returns The first matching document data (including `docId`) as `WithId<T>`, or `null` if no document matches
 * @throws Error if the query fails (error message includes the collection path)
 */
export async function queryOne<T>(
  collectionPath: string,
  filters: Array<ReturnType<typeof where>>,
  options: Omit<ListOptions, "filters" | "pageSize"> = {}
): Promise<WithId<T> | null> {
  try {
    const constraints: QueryConstraint[] = [...filters];

    // optional ordering or other query options
    if (options.orders) constraints.push(...options.orders);
    // limit to 1 since we only want the first match
    constraints.push(qLimit(1));

    const cq = q(collection(db, collectionPath), ...constraints).withConverter(
      makeConverter<T>()
    );

    const snap = await getDocs(cq);
    if (snap.empty) return null;

    return snap.docs[0].data() as WithId<T>;
  } catch (e) {
    throw new Error(
      `queryOne(${collectionPath}) failed: ${(e as Error).message}`
    );
  }
}

/**
 * Retrieves documents from a collection that match the given Firestore query filters.
 *
 * @param collectionPath - Path to the Firestore collection
 * @param filters - Array of Firestore `where` constraints to apply to the query
 * @param options - Optional query modifiers (e.g., ordering, pageSize, pagination cursor)
 * @returns An object with `items` — an array of matching documents (each includes `docId` and its data) — and `last` — the last query snapshot for pagination, if available
 */
export async function queryMany<T>(
  collectionPath: string,
  filters: Array<ReturnType<typeof where>>,
  options: Omit<ListOptions, "filters"> = {}
) {
  return list<T>(collectionPath, { ...options, filters });
}

// Subcollections
export async function listSub<T>(
  parentPath: string, // e.g. "users/abc"
  subcollection: string,
  opts?: ListOptions
) {
  return list<T>(`${parentPath}/${subcollection}`, opts);
}

// Does a specific document exist?
export async function existsDoc(
  collectionPath: string,
  id: string
): Promise<boolean> {
  const ref = docRef(db, collectionPath, id);
  const snap = await getDoc(ref);
  return snap.exists();
}

// Does any document matching filters exist? (fast count endpoint)
export async function existsWhere(
  collectionPath: string,
  filters: Array<ReturnType<typeof where>> = []
): Promise<boolean> {
  const cq = q(collection(db, collectionPath), ...filters);
  const agg = await getCountFromServer(cq);
  return agg.data().count > 0;
}

// Does a specific subcollection document exist?
export async function existsSubDoc(
  parentPath: string, // e.g. "users/abc"
  subcollection: string, // e.g. "readBy"
  id: string
): Promise<boolean> {
  const ref = docRef(db, `${parentPath}/${subcollection}`, id);
  const snap = await getDoc(ref);
  return snap.exists();
}

// Optional: throw if a doc is missing (handy in routes/services)
export async function assertDocExists(
  collectionPath: string,
  id: string,
  message?: string
): Promise<void> {
  if (!(await existsDoc(collectionPath, id))) {
    throw new Error(message ?? `Document not found: ${collectionPath}/${id}`);
  }
}

// Realtime (unsubscribe when done)
export function subscribe<T>(
  collectionPath: string,
  onChange: (items: WithId<T>[]) => void,
  opts: ListOptions = {}
) {
  const constraints: QueryConstraint[] = [];
  if (opts.filters) constraints.push(...opts.filters);
  if (opts.orders) constraints.push(...opts.orders);
  if (opts.pageSize) constraints.push(qLimit(opts.pageSize));

  const cq = q(collection(db, collectionPath), ...constraints).withConverter(
    makeConverter<T>()
  );
  return onSnapshot(cq, (snap) => onChange(snap.docs.map((d) => d.data()) as WithId<T>[]));
}

export function asJsonSafe<T>(record: WithId<T>): unknown {
  return toPlain(record);
}
