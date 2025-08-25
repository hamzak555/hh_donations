// IndexedDB manager for large files (photos, documents)

const DB_NAME = 'HHDonationsDB';
const DB_VERSION = 1;
const PHOTOS_STORE = 'photos';
const DOCUMENTS_STORE = 'documents';

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create photos store
        if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
          const photosStore = db.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
          photosStore.createIndex('entityId', 'entityId', { unique: false });
          photosStore.createIndex('entityType', 'entityType', { unique: false });
        }

        // Create documents store
        if (!db.objectStoreNames.contains(DOCUMENTS_STORE)) {
          const documentsStore = db.createObjectStore(DOCUMENTS_STORE, { keyPath: 'id' });
          documentsStore.createIndex('entityId', 'entityId', { unique: false });
          documentsStore.createIndex('entityType', 'entityType', { unique: false });
        }
      };
    });
  }

  async savePhoto(entityId: string, entityType: 'bale' | 'container', photoData: string): Promise<string> {
    if (!this.db) await this.init();
    
    const photoId = `${entityType}_${entityId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const photoRecord = {
      id: photoId,
      entityId,
      entityType,
      data: photoData,
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PHOTOS_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTOS_STORE);
      const request = store.add(photoRecord);

      request.onsuccess = () => resolve(photoId);
      request.onerror = () => reject(request.error);
    });
  }

  async getPhotos(entityId: string, entityType: 'bale' | 'container'): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PHOTOS_STORE], 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const index = store.index('entityId');
      const request = index.getAll(entityId);

      request.onsuccess = () => {
        const photos = request.result
          .filter(photo => photo.entityType === entityType)
          .map(photo => photo.data);
        resolve(photos);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPhotosWithIds(entityId: string, entityType: 'bale' | 'container'): Promise<{id: string, data: string}[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PHOTOS_STORE], 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const index = store.index('entityId');
      const request = index.getAll(entityId);

      request.onsuccess = () => {
        const photos = request.result
          .filter(photo => photo.entityType === entityType)
          .map(photo => ({ id: photo.id, data: photo.data }));
        resolve(photos);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deletePhoto(photoId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PHOTOS_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTOS_STORE);
      const request = store.delete(photoId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveDocument(entityId: string, entityType: 'container', documentData: string): Promise<string> {
    if (!this.db) await this.init();
    
    const documentId = `${entityType}_${entityId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const documentRecord = {
      id: documentId,
      entityId,
      entityType,
      data: documentData,
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DOCUMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.add(documentRecord);

      request.onsuccess = () => resolve(documentId);
      request.onerror = () => reject(request.error);
    });
  }

  async getDocuments(entityId: string, entityType: 'container'): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DOCUMENTS_STORE], 'readonly');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const index = store.index('entityId');
      const request = index.getAll(entityId);

      request.onsuccess = () => {
        const documents = request.result
          .filter(doc => doc.entityType === entityType)
          .map(doc => doc.data);
        resolve(documents);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteEntityFiles(entityId: string, entityType: 'bale' | 'container'): Promise<void> {
    if (!this.db) await this.init();

    const stores = [PHOTOS_STORE, DOCUMENTS_STORE];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(stores, 'readwrite');
      let completed = 0;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const index = store.index('entityId');
        const request = index.openCursor(entityId);

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            if (cursor.value.entityType === entityType) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            completed++;
            if (completed === stores.length) {
              resolve();
            }
          }
        };

        request.onerror = () => reject(request.error);
      });
    });
  }

  async getStorageUsage(): Promise<{ photos: number; documents: number; total: number }> {
    if (!this.db) await this.init();

    const getStoreSize = (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const size = request.result.reduce((total, item) => {
            return total + (item.data ? item.data.length : 0);
          }, 0);
          resolve(size);
        };
        request.onerror = () => reject(request.error);
      });
    };

    const [photosSize, documentsSize] = await Promise.all([
      getStoreSize(PHOTOS_STORE),
      getStoreSize(DOCUMENTS_STORE)
    ]);

    return {
      photos: photosSize,
      documents: documentsSize,
      total: photosSize + documentsSize
    };
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PHOTOS_STORE, DOCUMENTS_STORE], 'readwrite');
      
      const clearStore = (storeName: string) => {
        return new Promise<void>((resolve, reject) => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      };

      Promise.all([
        clearStore(PHOTOS_STORE),
        clearStore(DOCUMENTS_STORE)
      ]).then(() => resolve()).catch(reject);
    });
  }
}

export const dbManager = new IndexedDBManager();