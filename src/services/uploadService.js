import AuthService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

// Polling interval presets
export const POLLING_INTERVALS = {
  FAST: 30000,    // 30 seconds - for quick testing
  NORMAL: 60000,  // 1 minute - good balance (default)
  SLOW: 120000,   // 2 minutes - less server load
  VERY_SLOW: 300000 // 5 minutes - minimal server impact
};

/**
 * The main function to handle the entire upload and processing workflow.
 * @param {object} params - The parameters object.
 * @param {File} params.file - The file object to upload.
 * @param {string} params.fileType - The type of the file ('audio' or 'video'). THIS IS THE NEW PARAMETER.
 * @param {object} params.options - The processing options { denoise, removeFillers, summarize }.
 * @param {function} params.onUploadProgress - A callback function to report upload progress.
 * @param {function} params.onProcessingUpdate - A callback function to report processing status updates.
 * @param {boolean} params.useBackendUpload - Whether to upload through backend (avoids CORS issues).
 * @param {number} params.pollingIntervalMs - How often to poll job status in milliseconds (default: 60000ms = 1 minute).
 * @param {string} params.endpointPrefix - Optional prefix for endpoints (e.g., 'shorts' for '/shorts/generate-upload-url').
 * @returns {Promise<object>} - The final response from the server after processing.
 */
export async function uploadAndProcessFile({ 
  file, 
  fileType, 
  options, 
  onUploadProgress, 
  onProcessingUpdate, 
  pollingIntervalMs = 60000,
  endpointPrefix = ''
}) {
  const token = AuthService.getToken();
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }

  let objectName = await uploadDirectToSpaces(file, token, onUploadProgress, endpointPrefix);

  // --- Step 3: Start background processing and get job_id ---
  console.log('Step 3: Starting background processing...');
  
  const startProcessingEndpoint = endpointPrefix 
    ? `${API_BASE_URL}/${endpointPrefix}/start-processing`
    : `${API_BASE_URL}/start-processing`;
  
  const startProcessingResponse = await fetch(startProcessingEndpoint, {
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

  if (!startProcessingResponse.ok) {
    const errorData = await startProcessingResponse.json();
    throw new Error(`Failed to start processing: ${errorData.detail}`);
  }

  const { job_id: jobId } = await startProcessingResponse.json();
  console.log('Step 3 Complete. Background processing started with job_id:', jobId);

  // --- Step 4: Poll job status until completion ---
  console.log('Step 4: Polling job status...');
  const finalResult = await pollJobStatus(jobId, fileType, token, onProcessingUpdate, pollingIntervalMs);
  
  return finalResult;
}

/**
 * Upload file directly to DigitalOcean Spaces (original method)
 */
async function uploadDirectToSpaces(file, token, onUploadProgress, endpointPrefix = '') {
  // --- Step 1: Get the secure presigned URL ---
  console.log('Step 1: Getting presigned URL from backend...');
  const generateUrlEndpoint = endpointPrefix 
    ? `${API_BASE_URL}/${endpointPrefix}/generate-upload-url?filename=${encodeURIComponent(file.name)}`
    : `${API_BASE_URL}/generate-upload-url?filename=${encodeURIComponent(file.name)}`;
  
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

  return objectName;
}


/**
 * Polls the job status endpoint until the job is completed or failed.
 * @param {number} jobId - The job ID returned from start-processing.
 * @param {string} fileType - The type of file ('audio' or 'video').
 * @param {string} token - The authentication token.
 * @param {function} onProcessingUpdate - Callback to report processing status updates.
 * @param {number} pollingIntervalMs - How often to poll in milliseconds.
 * @returns {Promise<object>} - The final job result.
 */
async function pollJobStatus(jobId, fileType, token, onProcessingUpdate, pollingIntervalMs = 60000) {
  const mediaType = fileType === 'video' ? 'video' : 'audio';
  const statusEndpoint = `${API_BASE_URL}/jobs/${jobId}/status?media_type=${mediaType}`;
  
  let pollCount = 0;
  const maxPolls = Math.ceil(3600000 / pollingIntervalMs); // Maximum 1 hour of polling
  
  return new Promise((resolve, reject) => {
    const pollInterval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`Polling job status... (attempt ${pollCount}, interval: ${pollingIntervalMs}ms)`);
        
        const statusResponse = await fetch(statusEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!statusResponse.ok) {
          clearInterval(pollInterval);
          const errorData = await statusResponse.json();
          reject(new Error(`Failed to get job status: ${errorData.detail}`));
          return;
        }

        const jobStatus = await statusResponse.json();
        console.log('Job status:', jobStatus);

        // Update UI with current status
        if (onProcessingUpdate) {
          onProcessingUpdate({
            status: jobStatus.status,
            jobId: jobStatus.job_id
          });
        }

        // Handle different status states
        switch (jobStatus.status) {
          case 'COMPLETED':
            clearInterval(pollInterval);
            console.log('Step 4 Complete. Processing finished successfully.');
            resolve({
              success: true,
              job_id: jobStatus.job_id,
              status: jobStatus.status,
              public_url: jobStatus.public_url,
              summary: jobStatus.summary,
              download_url: jobStatus.public_url // For backward compatibility
            });
            break;
            
          case 'FAILED':
            clearInterval(pollInterval);
            console.error('Processing failed:', jobStatus.error);
            reject(new Error(`Processing failed: ${jobStatus.error || 'Unknown error occurred'}`));
            break;
            
          case 'PENDING':
          case 'PROCESSING':
          case 'ASSEMBLING':
          case 'DOWNLOADING_BROLL':
          case 'ANALYZING':
            // Continue polling
            console.log(`Job is ${jobStatus.status.toLowerCase()}...`);
            break;
            
          default:
            console.warn('Unknown job status:', jobStatus.status);
            // Continue polling for unknown statuses
            break;
        }

        // Safety check to prevent infinite polling
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          reject(new Error('Job processing timeout. Please check your job status manually.'));
        }
        
      } catch (error) {
        clearInterval(pollInterval);
        console.error('Error while polling job status:', error);
        reject(error);
      }
    }, pollingIntervalMs);
  });
}

/**
 * Get the current status of a specific job.
 * @param {number} jobId - The job ID.
 * @param {string} fileType - The type of file ('audio' or 'video').
 * @returns {Promise<object>} - The current job status.
 */
export async function getJobStatus(jobId, fileType) {
  const token = AuthService.getToken();
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }

  const mediaType = fileType === 'video' ? 'video' : 'audio';
  const statusEndpoint = `${API_BASE_URL}/jobs/${jobId}/status?media_type=${mediaType}`;
  
  const response = await fetch(statusEndpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to get job status: ${errorData.detail}`);
  }

  return await response.json();
}