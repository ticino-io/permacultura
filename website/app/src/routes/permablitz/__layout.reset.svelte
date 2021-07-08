<script lang="ts">
	import { Styles } from 'sveltestrap';
	import Navbar from './_Navbar.svelte';

</script>

<Styles />

<svelte:head>
	<title>Permablitz per Permacultura Svizzera Italiana</title>
</svelte:head>
<header class="sticky-md-top pe-5">
	<Navbar />
</header>

<main class=" fixed-center container p-5">
	<slot />
</main>

<footer class="footer mt-auto fixed-bottom py-3 bg-light">
	<div class="container">
		<span class="text-muted">
			<i>Copyleft — Permacultura Svizzera Italiana — all rights reversed.</i>
		</span>
	</div>
</footer>
