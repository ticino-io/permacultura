<script lang="ts">
	import { Styles } from 'sveltestrap';
	import { Breadcrumb, BreadcrumbItem } from 'sveltestrap';
	import { page } from '$app/stores';

	$: crumbs = xxx($page.path.split('/'));

	function xxx(words): any[] {
		const links: any[] = [];
		let previous = '/';
		words.slice(1).forEach((word) => {
			links.push({
				label: word.charAt(0).toUpperCase() + word.slice(1),
				link: previous + word
			});
			previous = previous + word + '/';
		});
		return links;
	}
</script>

<Styles />

<svelte:head>
	<title>Permacultura Svizzera Italiana</title>
</svelte:head>

<div class="m-2">
	<div class="">
		<Breadcrumb class="d-flex justify-content-start">
			{#each crumbs as item, index}
			{#if index == crumbs.length - 1}
			<BreadcrumbItem>{item.label}</BreadcrumbItem>
			{:else}
			<BreadcrumbItem><a href={item.link}>/{item.label}</a></BreadcrumbItem>
			{/if}
			{/each}
		</Breadcrumb>
		<h1>Permablitz</h1>
	</div>
	<hr />
	<slot />
</div>
