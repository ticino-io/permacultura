<script lang="ts">
	import {
		Carousel,
		CarouselControl,
		CarouselIndicators,
		CarouselItem,
		CarouselCaption,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader,
		Button,
		Icon
	} from 'sveltestrap';

	let isOpen = false;
	const toggle = () => {
		isOpen = !isOpen
		if (document.fullscreenEnabled) {
			document.documentElement.requestFullscreen();
		} else {
			console.log('Your browser cannot use fullscreen right now');
		}
	};

	const items = [
		{
			url: '/images/pexels-quang-nguyen-vinh-2132250.jpg',
			title: 'Paesaggio inesplorato lungo la Via del Ferro',
			founder: 'Giulia Valsani, dal 1997 in Val Morobbia',
			subTitle:
				'Già candidato, oscar mancato per poco, Giulia decide di intraprendere un percorso eco-sostenibile per aiutare i propri compaesani e gli anziani del paese.'
		},
		{
			url: '/images/pexels-mike-145685.jpg',
			title: 'Lo stagno riporta le rane nel deserto',
			founder: 'Scoproche Godo, dal 2011 sul Pian Magadino',
			subTitle:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos beatae eligendi ut reiciendis ab voluptas saepe eos quo! Illum, accusantium iste unde optio culpa cum tempore perferendis, perspiciatis ad soluta aspernatur dolorem delectus officiis corrupti velit tenetur excepturi. Perferendis exercitationem dicta tenetur tempora? Odio iure ut earum, voluptas illum suscipit.'
		},
		{
			url: '/images/pexels-bence-kondor-2259917.jpg',
			title: 'Casa degli hobbit',
			founder: 'Giulia Valsani, dal 1997 in Val Morobbia',
			subTitle: 'Un luogo creato nel 1976 da Barbara Fenice ad Olivone'
		}
	];
	let activeIndex = 0;
</script>

{#if !isOpen}
	<div class="m-3">
		{#each items as item, index}
			<div class="m-3">
				<div class="row featurette">
					<div class="col-md-5 {index % 2 ? 'order-md-5' : ''}">
						<h2 class="featurette-heading">{item.title}</h2>
						<h4 class="featurette-heading text-muted">{item.founder}</h4>
						<p class="lead h-100 d-inline-block">
							{item.subTitle}
							<a href="xxx" class="text-end">scopri di più</a>
              <br>
              <a href="xxx" class="text-end">voglio progettare</a>
              <br>
              <a href="xxx" class="text-end">voglio collaborare</a>
						</p>
            <p>
            </p>
					</div>
					<div
					class="col-md-7  {!(index % 2) ? 'd-flex justify-content-end' : ''}">
						<a
							href="#"
							on:click={() => {
								toggle();
								activeIndex = index;
							}}
						>
							<img src={item.url} alt="" width="500" />
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
<div >
	<Modal {isOpen} {toggle} fullscreen size="lg" scrollable={false} href="#bottom">
		<Carousel {items} bind:activeIndex ride interval={2000}>
			<div
				class="carousel-inner"
				style="width: 95%; height: 95%; margin: auto;
      border: 3px solid gold;
      padding: 10px;"
			>
				{#each items as item, index}
					<CarouselItem bind:activeIndex itemIndex={index}>
						<div id="bg">
							<img src={item.url} class="bg d-block w-100 100vh" alt={item.title} />
						</div>
					</CarouselItem>
				{/each}
			</div>
		</Carousel>
	</Modal>
</div>
<div class="bottom" />

<style>
	.bg {
		position: fixed;
		top: 0;
		left: 0;

		/* Preserve aspet ratio */
		min-width: 100%;
		min-height: 100%;
	}
	@media screen and (max-width: 1024px) {
		/* Specific to this particular image */
		img.bg {
			left: 50%;
			margin-left: -512px; /* 50% */
		}
	}
</style>
