<script lang="ts">
	import { Modal, Button, Icon } from 'sveltestrap';

	export let open = false;
	export let pdf;
	export let img;

	const toggle = () => (open = !open);
</script>

<Modal isOpen={open} {toggle} body size="lg" fullscreen>
	<div slot="external" class="text-end">
		<Button color="link" class="text-white" size="lg" on:click={toggle}>
			<Icon name="x" class="h1" />
		</Button>
	</div>
	<h4>Anteprima</h4>
	<div class="d-flex justify-content-center">
		{#if pdf}
			<embed src={pdf} width="80%" height="2100px" />
		{/if}
		{#if img}
			<img src={img} alt="_" width="80%" />
		{/if}
	</div>
</Modal>
