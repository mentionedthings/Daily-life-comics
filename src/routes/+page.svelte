<script>
  export let form;

  let targetUrl = '';
  let imageFilename = '';
  let customTitle = '';
  let customDescription = '';
  let password = '';
  let generatedUrl = '';

  // Authenticated if login succeeded OR if a link was already generated this session
  $: isAuthenticated = form?.success === true;

  // Capture generated URL from the generate action response
  $: if (form?.generatedUrl) {
    generatedUrl = form.generatedUrl;
  }
</script>

<h1>Create Redirect Link</h1>

{#if isAuthenticated}
  <!-- Link generation form — submits to server-side action for signing -->
  <form method="POST" action="?/generate">
    <div>
      <label for="urlInput">Target Website URL:</label>
      <input id="urlInput" name="url" type="url" bind:value={targetUrl} required placeholder="https://example.com/your-post" />
    </div>
    <div>
      <label for="imageInput">Image Filename (must be in <code>static/images</code>):</label>
      <input id="imageInput" name="image" type="text" bind:value={imageFilename} placeholder="your-image.png" />
    </div>
    <div>
      <label for="titleInput">Custom Title (for link preview):</label>
      <input id="titleInput" name="title" type="text" bind:value={customTitle} placeholder="Optional: Custom Title Here" />
    </div>
    <div>
      <label for="descriptionInput">Custom Description (for link preview):</label>
      <textarea id="descriptionInput" name="description" bind:value={customDescription} placeholder="A catchy description of the content."></textarea>
    </div>

    {#if form?.generateError}
      <p class="error">{form.generateError}</p>
    {/if}

    <button type="submit">Generate Link</button>
  </form>

  {#if generatedUrl}
    <div class="generated-link">
      <p>Generated Link:</p>
      <input type="text" readonly value={generatedUrl} />
      <button on:click={() => navigator.clipboard.writeText(generatedUrl)}>Copy</button>
    </div>
  {/if}
{:else}
  <!-- Password form -->
  <form method="POST" action="?/login">
    <p>Please enter the password to access the generator:</p>
    <div>
      <label for="password">Password:</label>
      <input id="password" name="password" type="password" bind:value={password} required disabled={form?.rateLimited} />
    </div>
    {#if form?.incorrect}
      <p class="error">{form.message || 'Incorrect password. Please try again.'}</p>
    {/if}
    {#if form?.rateLimited}
      <p class="error">{form.message}</p>
    {/if}
    <button type="submit" disabled={form?.rateLimited}>Login</button>
  </form>
{/if}

<style>
/* Add some basic styling */
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  margin-bottom: 1rem;
}
div {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
label {
  font-weight: bold;
}
input[type="text"],
input[type="url"],
input[type="password"] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
button:hover {
  background-color: #0056b3;
}
.generated-link {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.generated-link input {
  flex-grow: 1;
}
.error {
    color: red;
    font-weight: bold;
}
</style>
