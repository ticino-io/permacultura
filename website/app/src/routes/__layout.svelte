<script lang="ts">
	import Navbar from './_Navbar.svelte';
  import { Styles } from 'sveltestrap';
</script>
<Styles />

<svelte:head>
	<title>Permacultura Svizzera Italiana</title>
</svelte:head>

<Navbar />
<div class="m-3">
  <slot />
</div>

<!-- <footer>copyleft</footer> -->
