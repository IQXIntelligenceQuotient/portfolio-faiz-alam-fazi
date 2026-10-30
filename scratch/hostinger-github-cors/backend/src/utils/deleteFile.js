const fs = require('fs');
const path = require('path');

/**
 * Safely delete uploaded image files from the uploads folder
 * @param {string} fileUrl - The file URL to delete (e.g., '/uploads/image.webp')
 * @returns {boolean} - Returns true if deleted successfully, false otherwise
 */
const deleteFile = (fileUrl) => {
  try {
    // 1. If fileUrl is empty, return safely
    if (!fileUrl || fileUrl.trim() === '') {
      return false;
    }

    // 2. Only delete files that start with /uploads/
    if (!fileUrl.startsWith('/uploads/')) {
      console.log('[deleteFile] Skipping: Not an uploads file');
      return false;
    }

    // 3. Do not delete external URLs like https://example.com/image.jpg
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      console.log('[deleteFile] Skipping: External URL');
      return false;
    }

    // 4. Convert /uploads/filename.webp into the correct server file path
    // Remove leading slash and construct path relative to project root
    const relativePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    const filePath = path.join(process.cwd(), relativePath);

    // 5. Check if the file exists before deleting
    if (!fs.existsSync(filePath)) {
      console.log('[deleteFile] File does not exist:', filePath);
      return false;
    }

    // 6. Delete the file
    fs.unlinkSync(filePath);
    console.log('[deleteFile] File deleted successfully:', filePath);
    return true;

  } catch (error) {
    // 7. Safe error handling - log but don't crash
    console.error('[deleteFile] Error deleting file:', error.message);
    return false;
  }
};

// 8. Export the function
module.exports = deleteFile;
