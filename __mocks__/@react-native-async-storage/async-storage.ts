// Simple object to simulate the storage
let storage = {};

export default {
  setItem: jest.fn((key, value) => {
    return new Promise((resolve) => {
      storage[key] = value;
      resolve(null);
    });
  }),
  getItem: jest.fn((key) => {
    return new Promise((resolve) => {
      if (key in storage) {
        resolve(storage[key]);
      } else {
        resolve(null);
      }
    });
  }),
  removeItem: jest.fn((key) => {
    return new Promise((resolve) => {
      delete storage[key];
      resolve(null);
    });
  }),
  clear: jest.fn(() => {
    return new Promise((resolve) => {
      storage = {};
      resolve(null);
    });
  }),
  // Mock other methods as needed (mergeItem, getAllKeys, etc.)
};