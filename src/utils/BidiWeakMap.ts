export class BidiWeakMap<K extends object, V> {
  #weakMap = new WeakMap<K, V>();
  #reverseMap = new Map<V, WeakRef<K>>();
  #heldValues: Record<string, V> = {};

  #registry = new FinalizationRegistry<string>((heldValueIndex) => {
    const heldValue = this.#heldValues[heldValueIndex];
    if (heldValue) {
      this.deleteByValue(heldValue);
    }
  });

  set(key: K, value: V) {
    this.#weakMap.set(key, value);
    this.#reverseMap.set(value, new WeakRef<K>(key));
    const heldValueIndex = Object.keys(this.#heldValues).length.toString();
    this.#heldValues = {
      [heldValueIndex]: value,
    };
    this.#registry.register(key, heldValueIndex);
    return this;
  }

  get(key: K): V | undefined {
    return this.#weakMap.get(key);
  }

  getByValue(value: V): K | undefined {
    const valueRef = this.#reverseMap.get(value);
    if (valueRef) {
      const value = valueRef.deref();
      if (value) {
        return value;
      }
    }
    return undefined;
  }

  delete(key: K) {
    const value = this.#weakMap.get(key);
    if (value) {
      this.#heldValues = Object.entries(this.#heldValues).reduce(
        (acc, [heldValueIndex, heldValue]) => {
          if (value !== heldValue) {
            acc[heldValueIndex] = heldValue;
          }
          return acc;
        },
        {} as Record<string, V>,
      );
      return this.#reverseMap.delete(value) && this.#weakMap.delete(key);
    }
    return false;
  }

  deleteByValue(value: V) {
    const keyRef = this.#reverseMap.get(value);
    if (keyRef) {
      const key = keyRef.deref();
      if (key) {
        return this.delete(key);
      }
    }
    return false;
  }

  clear() {
    this.#weakMap = new WeakMap();
    this.#reverseMap = new Map();
    this.#heldValues = {};
  }
}
