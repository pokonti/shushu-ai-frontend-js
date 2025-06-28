/**
 * Uploads a file to the specified endpoint with optional options as query params.
 * @param {File} file - The file to upload
 * @param {string} fileType - 'audio' | 'video'
 * @param {object} [options] - Optional options for query params
 * @param {string} [endpoint] - Optional endpoint override
 * @returns {Promise<object>} - The response from the server
 */
// export async function uploadFile({ file, fileType, options = {}, endpoint }) {
//   const API_BASE_URL = 'http://localhost:8000';

//   // Default endpoint logic
//   let apiEndpoint = endpoint;
//   if (!apiEndpoint) {
//     apiEndpoint = fileType === 'video' ? '/upload-video' : '/upload-audio';
//   }

//   // Build query string from options
//   const params = new URLSearchParams();
//   if (options && typeof options === 'object') {
//     Object.entries(options).forEach(([key, value]) => {
//       if (value) params.append(key, value === true ? 'true' : value);
//     });
//   }

//   const url = `${API_BASE_URL}${apiEndpoint}${params.toString() ? '?' + params.toString() : ''}`;

//   const formData = new FormData();
//   formData.append('file', file);

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       body: formData,
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Upload failed');
//     }

//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.error('Upload error:', error);
//     throw error;
//   }
// } 
// In: src/services/uploadService.js

import AuthService from './authService';

const API_BASE_URL = 'http://localhost:8000'; // Or from your .env file

/**
 * The main function to handle the entire upload and processing workflow.
 * @param {object} params - The parameters object.
 * @param {File} params.file - The file object to upload.
 * @param {object} params.options - The processing options { denoise, removeFillers, summarize }.
 * @param {function} params.onUploadProgress - A callback function to report upload progress.
 * @returns {Promise<object>} - The final response from the server after processing.
 */
export async function uploadAndProcessFile({ file, options, onUploadProgress }) {
  const token = AuthService.getToken();
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }

  // --- Step 1: Get the secure presigned URL from our backend ---
  console.log('Step 1: Getting presigned URL from backend...');
  const generateUrlEndpoint = `${API_BASE_URL}/generate-upload-url?filename=${encodeURIComponent(file.name)}`;
  
  const presignResponse = await fetch(generateUrlEndpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!presignResponse.ok) {
    const errorData = await presignResponse.json();
    throw new Error(`Could not get upload URL: ${errorData.detail}`);
  }

  const { upload_url: uploadUrl, object_name: objectName } = await presignResponse.json();
  console.log('Step 1 Complete. Received presigned URL.');


  // --- Step 2: Upload the file directly to DigitalOcean Spaces ---
  console.log('Step 2: Uploading file directly to DigitalOcean Spaces...');
  
  // We use XMLHttpRequest instead of fetch here because it has better progress tracking.
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        if (onUploadProgress) {
          onUploadProgress(percentComplete);
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('Step 2 Complete. File uploaded to Spaces.');
        resolve(xhr.response);
      } else {
        console.error('Upload to Spaces failed:', xhr.responseText);
        reject(new Error(`Upload to cloud storage failed with status: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('A network error occurred during the file upload.'));
    };
    
    // Set required headers for DO Spaces PUT request
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    
    xhr.send(file);
  });


  // --- Step 3: Tell the backend to start processing the file ---
  console.log('Step 3: Asking backend to start processing...');
  const processEndpoint = `${API_BASE_URL}/process-file`;
  
  const processResponse = await fetch(processEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      object_name: objectName,
      options: options, // e.g., { "denoise": true, "summarize": false }
    }),
  });

  if (!processResponse.ok) {
    const errorData = await processResponse.json();
    throw new Error(`Processing failed: ${errorData.detail}`);
  }

  const finalResult = await processResponse.json();
  console.log('Step 3 Complete. Processing finished.');
  
  return finalResult;
}