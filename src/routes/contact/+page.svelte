<script>
  // You can add form handling logic here if needed
  let name = '';
  let email = '';
  let message = '';
  
  function handleSubmit(e) {
    e.preventDefault();
    // Add your form submission logic here
    alert('Thank you for your message! We will get back to you soon.');
    name = '';
    email = '';
    message = '';
  }
</script>

<h1>Contact Us</h1>

<div class="contact-container">
  <div class="contact-info">
    <h2>Get in Touch</h2>
    <p>Have questions or feedback? We'd love to hear from you!</p>
    
    <div class="contact-method">
      <h3>Email</h3>
      <p>contact@humsurf.com</p>
    </div>
    
    <div class="contact-method">
      <h3>Follow Us</h3>
      <div class="social-links">
        <button type="button" class="link-btn" aria-label="Facebook">Facebook</button>
        <button type="button" class="link-btn" aria-label="Twitter">Twitter</button>
        <button type="button" class="link-btn" aria-label="Instagram">Instagram</button>
      </div>
    </div>
  </div>
  
  <form on:submit={handleSubmit} class="contact-form">
    <div class="form-group">
      <label for="name">Name</label>
      <input 
        type="text" 
        id="name" 
        bind:value={name} 
        required 
        placeholder="Your name"
      >
    </div>
    
    <div class="form-group">
      <label for="email">Email</label>
      <input 
        type="email" 
        id="email" 
        bind:value={email} 
        required 
        placeholder="your.email@example.com"
      >
    </div>
    
    <div class="form-group">
      <label for="message">Message</label>
      <textarea 
        id="message" 
        bind:value={message} 
        required 
        rows="5"
        placeholder="Your message here..."
      ></textarea>
    </div>
    
    <button type="submit" class="submit-btn">Send Message</button>
  </form>
</div>

<style>
  .contact-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .contact-info {
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .contact-method {
    margin-top: 1.5rem;
  }
  
  .social-links {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: #2563eb;
    text-decoration: none;
    font: inherit;
    cursor: pointer;
  }

  .link-btn:hover {
    text-decoration: underline;
  }
  
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 500;
    color: #1f2937;
  }
  
  input, textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  textarea {
    resize: vertical;
    min-height: 120px;
  }
  
  .submit-btn {
    background-color: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    align-self: flex-start;
  }
  
  .submit-btn:hover {
    background-color: #1d4ed8;
  }
  
  @media (max-width: 768px) {
    .contact-container {
      grid-template-columns: 1fr;
      padding: 1rem;
    }
  }
</style>
