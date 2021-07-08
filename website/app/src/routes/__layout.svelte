<script lang="ts">
	import Navbar from './_Navbar.svelte';
  import { Styles } from 'sveltestrap';
</script>
<Styles />

<svelte:head>
	<title>Permacultura Svizzera Italiana</title>
</svelte:head>

<header class="sticky-md-top pe-5">
  <Navbar />
</header>

<main class=" fixed-center container px-5 pb-5">
    <slot />
</main>

<footer class="footer mt-auto fixed-bottom py-3 bg-light">
  <div class="container">
    <span class="text-muted">
      <i>Copyleft — Permacultura Svizzera Italiana — all rights reversed.</i>
  </div>
</footer>

<style>
  main{
    /* background-image: url("/images/garden1.webp"); */
    /* opacity: 0.2; */
    width: 100%;
    height: 100%;
    background-size: cover;
  }
</style>
