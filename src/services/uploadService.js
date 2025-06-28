// import AuthService from './authService';

// const API_BASE_URL = 'http://localhost:8000'; // Or from your .env file

// /**
//  * The main function to handle the entire upload and processing workflow.
//  * @param {object} params - The parameters object.
//  * @param {File} params.file - The file object to upload.
//  * @param {object} params.options - The processing options { denoise, removeFillers, summarize }.
//  * @param {function} params.onUploadProgress - A callback function to report upload progress.
//  * @returns {Promise<object>} - The final response from the server after processing.
//  */
// export async function uploadAndProcessFile({ file, options, onUploadProgress }) {
//   const token = AuthService.getToken();
//   if (!token) {
//     throw new Error('Authentication token not found. Please log in.');
//   }

//   // --- Step 1: Get the secure presigned URL from our backend ---
//   console.log('Step 1: Getting presigned URL from backend...');
//   const generateUrlEndpoint = `${API_BASE_URL}/generate-upload-url?filename=${encodeURIComponent(file.name)}`;
  
//   const presignResponse = await fetch(generateUrlEndpoint, {
//     method: 'GET',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });

//   if (!presignResponse.ok) {
//     const errorData = await presignResponse.json();
//     throw new Error(`Could not get upload URL: ${errorData.detail}`);
//   }

//   const { upload_url: uploadUrl, object_name: objectName } = await presignResponse.json();
//   console.log('Step 1 Complete. Received presigned URL.');


//   // --- Step 2: Upload the file directly to DigitalOcean Spaces ---
//   console.log('Step 2: Uploading file directly to DigitalOcean Spaces...');
  
//   // We use XMLHttpRequest instead of fetch here because it has better progress tracking.
//   await new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     xhr.open('PUT', uploadUrl, true);
    
//     xhr.upload.onprogress = (event) => {
//       if (event.lengthComputable) {
//         const percentComplete = (event.loaded / event.total) * 100;
//         if (onUploadProgress) {
//           onUploadProgress(percentComplete);
//         }
//       }
//     };

//     xhr.onload = () => {
//       if (xhr.status >= 200 && xhr.status < 300) {
//         console.log('Step 2 Complete. File uploaded to Spaces.');
//         resolve(xhr.response);
//       } else {
//         console.error('Upload to Spaces failed:', xhr.responseText);
//         reject(new Error(`Upload to cloud storage failed with status: ${xhr.status}`));
//       }
//     };

//     xhr.onerror = () => {
//       reject(new Error('A network error occurred during the file upload.'));
//     };
    
//     // Set required headers for DO Spaces PUT request
//     xhr.setRequestHeader('Content-Type', file.type);
//     xhr.setRequestHeader('x-amz-acl', 'public-read');
    
//     xhr.send(file);
//   });


//   // --- Step 3: Tell the backend to start processing the file ---
//   console.log('Step 3: Asking backend to start processing...');
//   const processEndpoint = `${API_BASE_URL}/process-file`;
  
//   const processResponse = await fetch(processEndpoint, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       object_name: objectName,
//       options: options, // e.g., { "denoise": true, "summarize": false }
//     }),
//   });

//   if (!processResponse.ok) {
//     const errorData = await processResponse.json();
//     throw new Error(`Processing failed: ${errorData.detail}`);
//   }

//   const finalResult = await processResponse.json();
//   console.log('Step 3 Complete. Processing finished.');
  
//   return finalResult;
// }
import AuthService from './authService';

const API_BASE_URL = 'http://localhost:8000'; 

/**
 * The main function to handle the entire upload and processing workflow.
 * @param {object} params - The parameters object.
 * @param {File} params.file - The file object to upload.
 * @param {string} params.fileType - The type of the file ('audio' or 'video'). THIS IS THE NEW PARAMETER.
 * @param {object} params.options - The processing options { denoise, removeFillers, summarize }.
 * @param {function} params.onUploadProgress - A callback function to report upload progress.
 * @returns {Promise<object>} - The final response from the server after processing.
 */
export async function uploadAndProcessFile({ file, fileType, options, onUploadProgress }) {
  const token = AuthService.getToken();
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }

  // --- Step 1: Get the secure presigned URL (No changes here) ---
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


  // --- Step 2: Upload the file directly to DigitalOcean Spaces (No changes here) ---
  console.log('Step 2: Uploading file directly to DigitalOcean Spaces...');
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
        reject(new Error(`Upload to cloud storage failed with status: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('A network error occurred during the file upload.'));
    
    // Set required headers for DO Spaces PUT request
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.send(file);
  });


  // --- Step 3: Tell the backend to start processing the file (THIS IS THE KEY CHANGE) ---
  console.log('Step 3: Asking backend to start processing...');
  
  // Conditionally choose the endpoint based on the fileType parameter
  const processEndpoint = fileType === 'video'
    ? `${API_BASE_URL}/process-video`
    : `${API_BASE_URL}/process-audio`;
  
  console.log(`Sending request to: ${processEndpoint}`);

  const processResponse = await fetch(processEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      object_name: objectName,
      options: options,
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