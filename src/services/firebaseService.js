const storage = {
  get: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (error) {
      return null;
    }
  },
  delete: (key) => {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch (error) {
      return null;
    }
  }
};

export default storage;
