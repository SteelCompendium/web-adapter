import DnD5EAdapter from './DnD5EAdapter';

class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
    this.registerDefaultAdapters();
  }

  registerDefaultAdapters() {
    this.registerAdapter(new DnD5EAdapter());
    // Register more default adapters here
  }

  registerAdapter(adapter) {
    this.adapters.set(adapter.getName(), adapter);
  }

  getAdapter(name) {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`No adapter found for format: ${name}`);
    }
    return adapter;
  }

  getAvailableFormats() {
    return Array.from(this.adapters.keys());
  }

  convert(text, sourceFormat, targetFormat) {
    const sourceAdapter = this.getAdapter(sourceFormat);
    const targetAdapter = this.getAdapter(targetFormat);

    // Parse the input text into a standardized format
    const standardizedStatblock = sourceAdapter.parse(text);

    // Format the standardized statblock into the target format
    return targetAdapter.format(standardizedStatblock);
  }
}

// Create a singleton instance
const registry = new AdapterRegistry();
export default registry; 