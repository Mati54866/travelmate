const cache = new Map();

export const readResourceCache = (key) => cache.get(key);

export const writeResourceCache = (key, value) => {
  cache.set(key, value);
  return value;
};

export const updateResourceCache = (key, updater) => {
  const nextValue = updater(cache.get(key));
  cache.set(key, nextValue);
  return nextValue;
};

export const clearResourceCache = (key) => {
  cache.delete(key);
};
