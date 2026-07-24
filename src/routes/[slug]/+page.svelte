<script>
  import RedirectPage from '$lib/RedirectPage.svelte';
  export let data;
</script>

<RedirectPage {data} redirectDelay={3} />
