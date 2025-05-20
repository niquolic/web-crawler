<template>
  <div class="search-url">
    <h1>Web Crawler</h1>
    <form class="form-container">
      <div>
        <input 
          type="text" 
          v-model="url" 
          placeholder="Enter URL" 
          required 
          class="input-field"
        />
      </div>
      <button 
        class="submit-button"
        @click="startCrawling"
        :disabled="isCrawling"
      >
        Start Crawling
      </button>
      <div v-if="isCrawling" class="loading">
        <p>Crawling in progress...</p>
      </div>
      <div v-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      <button 
        v-if="downloadFolder" 
        @click="downloadZip" 
        class="download-button"
      >
        Télécharger le site
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const url = ref('');
const isCrawling = ref(false);
const downloadFolder = ref('');
const error = ref('');

const startCrawling = async () => {
  if (url.value) {
    const crawlerUrl = `http://localhost:3000/api/crawler/download`;
    isCrawling.value = true;
    error.value = '';
    downloadFolder.value = '';
    try {
      const response = await fetch(crawlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.value }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du téléchargement');
      }

      downloadFolder.value = data.folderName;
    } catch (err) {
      console.error('Error during crawling:', err);
      error.value = err.message;
    } finally {
      isCrawling.value = false;
    }
  }
};

const downloadZip = async () => {
  if (downloadFolder.value) {
    try {
      const response = await fetch(`http://localhost:3000/api/crawler/download/${downloadFolder.value}`);
      if (!response.ok) throw new Error('Erreur lors du téléchargement du zip');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${downloadFolder.value}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      url.value = '';
    } catch (error) {
      console.error('Error downloading zip:', error);
      error.value = error.message;
    }
  }
};
</script>

<style scoped>
.search-url {
  padding-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.loading {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #3b82f6;
}
.error {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #ef4444;
}
.form-container {
  width: 100%;
  max-width: 28rem;
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);
}
.input-field {
  width: 88%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: box-shadow 0.3s, border-color 0.3s;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.submit-button, .download-button {
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
}

.submit-button:hover, .download-button:hover {
  background-color: #2563eb;
}

.download-button {
  background-color: #10b981;
}

.download-button:hover {
  background-color: #059669;
}
</style>