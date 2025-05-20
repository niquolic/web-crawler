<template>
  <div class="search-url">
    <h1>Web Crawler</h1>
    <form @submit.prevent="startCrawling" class="form-container">
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
        type="submit" 
        class="submit-button"
        :disabled="isCrawling"
      >
        Start Crawling
      </button>
      <div v-if="isCrawling" class="loading">
        <p>Crawling in progress...</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const url = ref('');
const isCrawling = ref(false);

const startCrawling = () => {
  if (url.value) {
    const crawlerUrl = `http://localhost:3000/api/crawler/download`;
    isCrawling.value = true;
    try {
      fetch(crawlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.value }),
      })
    } catch (error) {
      console.error('Error during crawling:', error);
    } finally {
      isCrawling.value = false;
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

.submit-button {
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #2563eb;
}
</style>