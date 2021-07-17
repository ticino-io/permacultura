<script>
	import { Modal, Nav, NavLink, ModalHeader, ModalBody, Button, Icon, NavItem } from 'sveltestrap';
	import Board from '../board.svelte';
	import Preview from '../_preview.svelte';

	let open = false;
	let pdf;
	let img;

	const water = [
		{
			title: "Estratto dal libro di Bill Mollison sul tema dell'acqua",
			pdf: '/docs/acqua mollison.pdf'
		},
		{
			title: "Dettagli sull'irrigazione",
			pdf: '/docs/irrigazione_ perchè, quando, quanto e come.pdf'
		},
		{
			title: 'Allearsi con le forme del paesaggio',
			pdf: '/docs/allearsi con le forme del paesaggio.pdf'
		},
		{
			title: 'Gestione acqua in pieno capo e in collina',
			url: 'https://sites.google.com/view/gestionedellacquaincollinaaor/1-introduzione'
		},
		{
			title: 'Gestione acqua su piccola scala',
			url: 'https://sites.google.com/view/acqua-raccolta-e-irrigazione/'
		}
	];

	const soil = [
		{
			title: 'Biochar',
			pdf: '/docs/biochar.pdf'
		},
		{
			title: 'Ciclo Ossigeno-Etilene (1)',
			img: '/docs/Ciclo_ossigeno_etilene (2016_04_06 07_14_34 UTC).png'
		},
		{
			title: 'Ciclo Ossigeno-Etilene (2)',
			img: '/docs/CICLO-OSSIGENO-ETILENE (2016_04_06 07_14_34 UTC).jpg'
		},
		{
			title: 'Fosforo',
			img: '/docs/fosforo (2016_04_06 07_14_34 UTC).jpg'
		},
		{
			title: 'Il suolo in Permacultura',
			pdf: '/docs/il suolo in pc2.pdf'
		},
		{
			title: 'Ricettario ABC Le pannocchie di mais erano così grandi',
			pdf: '/docs/Ricettario ABC Le pannocchie di mais erano così grandi.pdf'
		},
		{
			title: 'Ricettario per la cura del suolo',
			pdf: '/docs/ricette per la cura del suolo.pdf'
		},
	];

	function openDoc(doc) {
		open = true;
		pdf = doc.pdf;
		img = doc.img;
	}
</script>

<Preview {pdf} {img} bind:open />

<h1 id="top">La cassetta degli attrezzi</h1>

<p>Qui trovi tutti gli strumenti utili per progettare in permacultura.</p>
<p id="acqua"></p>
<br>
<Nav class="d-flex justify-content-end">
  <NavLink disabled href="#">Acqua</NavLink>
  <NavLink href="#suolo">Suolo</NavLink>
</Nav>
<div class="m-3">
	<div class="row featurette border-top">
		<div class="col-md-5 mt-3">
			<h2 class="featurette-heading">Acqua</h2>
			<h5 class="featurette-heading text-muted">
				<i>L'acqua è la forza motrice della natura</i>
			</h5>
      <p class="d-flex justify-content-end">Leonardo Da Vinci</p>
      <p>Le risorse idriche influenzano profondamente il tipo di permacultura praticabile in un
				determinato luogo</p>
      <p>La disponibilità d'acqua dipende dai seguenti fattori:</p>
			<ul>
				<li>distribuzione e affidabilità delle precipitazioni;</li>
				<li>drenaggio e ritenzione idrica del terreno;</li>
				<li>copertura del suolo (vegetazione, pacciamatura);</li>
				<li>animali (densità di allevamento, specie);</li>
				<li>piante coltivate (specie, fabbisogno).</li>
			</ul>
		</div>
		<div class="col-md-7 mt-5">
			<h5>Documenti e estratti:</h5>
			{#each water as doc}
				{#if doc.pdf}
					<Button color="link" on:click={() => openDoc(doc)}>{doc.title}</Button>
				{:else if doc.img}
					<Button color="link" on:click={() => openDoc(doc)}>{doc.title}</Button>
				{:else}
					<Button color="link" target="_blank" href={doc.url}>{doc.title}</Button>
				{/if}
				<br />
			{/each}
		</div>
	</div>
</div>

<p id="suolo"></p>
<br>
<Nav class="d-flex justify-content-end">
  <NavLink href="#acqua">Acqua</NavLink>
  <NavLink disabled href="#suolo">Suolo</NavLink>
</Nav>
<div class="m-3 border-top" >
	<div class="row featurette">
		<div class="col-md-5 mt-3">
			<h2 class="featurette-heading">Suolo</h2>
			<h5 class="featurette-heading text-muted">
        <i>Preparare dei terreni può essere considerato un'arte liberale,
        una specie di poesia e pittura.</i>
			</h5>
      <p class="d-flex justify-content-end">William Wordsworth</p>
      <p>Idee e strategie per collaborare una matrice in continuo cambiamento</p>
		</div>
		<div class="col-md-7 mt-5">
			<h5>Documenti e estratti:</h5>
			{#each soil as doc}
				{#if doc.pdf}
					<Button color="link" on:click={() => openDoc(doc)}>{doc.title}</Button>
				{:else if doc.img}
					<Button color="link" on:click={() => openDoc(doc)}>{doc.title}</Button>
				{:else}
					<Button color="link" target="_blank" href={doc.url}>{doc.title}</Button>
				{/if}
				<br />
			{/each}
		</div>
	</div>
</div>
