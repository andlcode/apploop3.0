
/**
 * Mock Frontend API function for Audio Uploads
 * Note: The actual Express.js backend implementation in `apps/api/` cannot be modified
 * in this environment as per system constraints. This frontend mock simulates the 
 * requested backend behavior (accepting files + rhythmName, returning paths) 
 * for demonstration purposes.
 */
export const uploadAudioFiles = async (files, rhythmName = 'POP ROCK 1') => {
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!files || files.length === 0) {
      return reject(new Error("Nenhum arquivo selecionado."));
    }
    if (!rhythmName || rhythmName.trim() === '') {
      return reject(new Error("Nome do ritmo é obrigatório."));
    }

    const cleanRhythmName = rhythmName.trim().toUpperCase();

    // Simulate network delay and processing time
    setTimeout(() => {
      try {
        const uploadedFiles = Array.from(files).map((file) => {
          // In a real app, this would be a server path (e.g., /public/loops/RHYTHM_NAME/file.mp3)
          // Here we use Blob URLs to make them immediately playable in the browser session.
          const blobUrl = URL.createObjectURL(file);
          
          return {
            name: file.name,
            originalName: file.name,
            url: blobUrl,
            status: 'success',
            rhythm: cleanRhythmName
          };
        });
        
        resolve({
          success: true,
          message: `Successfully uploaded ${uploadedFiles.length} files to ${cleanRhythmName}`,
          files: uploadedFiles,
          rhythmName: cleanRhythmName
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message
        });
      }
    }, 1200); // 1.2s simulated delay
  });
};
