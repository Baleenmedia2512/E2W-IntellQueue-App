// utils/auth.js
export const storeCurrentUser = async (user) => {
    const db = await initDB();
    await db.put('user', user, 'currentUser');
  };
  
  export const getCurrentUser = async () => {
    const db = await initDB();
    return db.get('user', 'currentUser');
  };