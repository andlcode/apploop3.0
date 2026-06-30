
export const buildAudioPath = (rhythmName, category, audioFile) => {
  const normRhythm = rhythmName ? rhythmName.toLowerCase().replace(/\s+/g, '-') : 'pop-rock-1';
  // Note: in Vite, the public folder is served at the root, so the URL is /audios/...
  return `/audios/${normRhythm}/${category}/${audioFile}`;
};

export const recalcularDuracaoAudio = (novoArquivo, rhythmName) => {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(novoArquivo);
      const audio = new Audio(url);
      
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(url);
      };
      
      audio.onerror = () => {
        resolve(0);
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Erro ao recalcular duração:', e);
      resolve(0);
    }
  });
};

export const substituirAudio = async (rhythmName, tipoAudio, numeroAudio, novoArquivo) => {
  try {
    if (!novoArquivo) throw new Error('Nenhum arquivo fornecido.');
    
    const duracao = await recalcularDuracaoAudio(novoArquivo, rhythmName);
    
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(novoArquivo);
    });

    const normRhythm = rhythmName ? rhythmName.toLowerCase().replace(/\s+/g, '-') : 'pop-rock-1';
    const numSuffix = numeroAudio ? `_${numeroAudio}` : '';
    
    localStorage.setItem(`audio_${normRhythm}_${tipoAudio}${numSuffix}_data`, dataUrl);
    localStorage.setItem(`audio_${normRhythm}_${tipoAudio}${numSuffix}_meta`, JSON.stringify({
      originalName: novoArquivo.name,
      uploadDate: new Date().toISOString(),
      duration: duracao,
      rhythm: rhythmName
    }));

    const displayName = `${tipoAudio.charAt(0).toUpperCase() + tipoAudio.slice(1)} ${numeroAudio || ''}`.trim();
    return { success: true, message: `${displayName} substituída com sucesso no ritmo ${rhythmName}` };
  } catch (err) {
    return { success: false, error: err.message || 'Erro ao substituir áudio' };
  }
};

export const excluirAudio = (rhythmName, tipoAudio, numeroAudio) => {
  try {
    const normRhythm = rhythmName ? rhythmName.toLowerCase().replace(/\s+/g, '-') : 'pop-rock-1';
    const numSuffix = numeroAudio ? `_${numeroAudio}` : '';
    const keyData = `audio_${normRhythm}_${tipoAudio}${numSuffix}_data`;
    const keyMeta = `audio_${normRhythm}_${tipoAudio}${numSuffix}_meta`;
    
    if (!localStorage.getItem(keyData)) {
      throw new Error('Áudio não encontrado no armazenamento local para este ritmo.');
    }
    
    localStorage.removeItem(keyData);
    localStorage.removeItem(keyMeta);
    
    const displayName = `${tipoAudio.charAt(0).toUpperCase() + tipoAudio.slice(1)} ${numeroAudio || ''}`.trim();
    return { success: true, message: `${displayName} excluída com sucesso do ritmo ${rhythmName}` };
  } catch (err) {
    return { success: false, error: err.message || 'Erro ao excluir áudio' };
  }
};
