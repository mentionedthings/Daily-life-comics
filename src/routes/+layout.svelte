<script>
  import '../app.css'; // Optional: for global styles
</script>

<header>
  <nav>
    <a href="/">Home</a>
    <a href="/contact">Contact</a>
  </nav>
</header>

<main>
  <slot /> <!-- Page content will be injected here -->
</main>

<style>
  header {
    background-color: #f0f0f0;
    padding: 1rem;
    border-bottom: 1px solid #ccc;
  }
  nav {
    display: flex;
    gap: 1rem;
    justify-content: center; /* Center links or adjust as needed */
  }
  nav a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
  }
  nav a:hover {
    color: #007bff;
  }
  main {
    padding: 1rem;
  }
</style>
