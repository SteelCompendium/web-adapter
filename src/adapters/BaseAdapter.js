/**
 * Base class for all statblock adapters
 */
class BaseAdapter {
  /**
   * Parse the input text into a standardized format
   * @param {string} text - The input statblock text
   * @returns {Object} - The parsed statblock in a standardized format
   */
  parse(text) {
    throw new Error('parse() method must be implemented by adapter');
  }

  /**
   * Format the standardized statblock into the target format
   * @param {Object} statblock - The standardized statblock object
   * @returns {string} - The formatted statblock text
   */
  format(statblock) {
    throw new Error('format() method must be implemented by adapter');
  }

  /**
   * Get the name of this adapter
   * @returns {string} - The adapter name
   */
  getName() {
    throw new Error('getName() method must be implemented by adapter');
  }
}

export default BaseAdapter; 