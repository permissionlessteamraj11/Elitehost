const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

/**
 * Service to communicate with the Python backend
 */
class PythonService {
  /**
   * Validates Python code syntax using the Python backend
   * @param {string} code - The Python code to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateCode(code) {
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/validate`, { code });
      return response.data;
    } catch (error) {
      console.error('Error communicating with Python service:', error.message);
      return {
        success: false,
        message: 'Could not connect to Python validation service',
        error: error.message
      };
    }
  }

  /**
   * Checks the health of the Python service
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${PYTHON_SERVICE_URL}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

module.exports = new PythonService();
