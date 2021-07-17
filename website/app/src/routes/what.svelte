<script>
	import { Figure, Nav, NavLink } from 'sveltestrap';
</script>

<div class="row ">
	<h2 class="">La Prima Direttiva</h2>
	<h5 class=" text-muted">Assumersi la propria responsabilità.</h5>
	<p class="lead">
		In parole più semplici:
		<span class="text-muted">non lamentarsi ma dare il buon esempio</span>
	</p>
</div>

<Nav class="d-flex justify-content-end">
	<NavLink href="#v-and-p">Valori</NavLink>
	<NavLink href="#v-and-p">Principi</NavLink>
	<NavLink href="#applications">Applicazioni</NavLink>
</Nav>
<div class="">
	<div class="row featurette border-top">
		<div class="col-md-5 mt-3">
			<h2 class="featurette-heading">Definizione</h2>
			<p>
				La Permacultura è un approccio alla progettazione basato sul collegamento di elementi e
				persone attraverso varie discipline e strategie che collaborano con la natura.
			</p>
			<p>
				L'obiettivo che si pone è quello di creare ecosistemi e insediamenti umani e agricoli ricchi
				di biodiversità, stabili e resilienti (ossia capaci di adattarsi ai cambiamenti), in modo
				simile a come fanno gli ecosistemi naturali, quali ad esempio i boschi. Rendendoli quindi
				ecologicamente, economicamente e socialmente sostenibili.
			</p>
			<p class="text-muted">
				Quindi la Permacultura non è una disciplina o una tecnica da usare esclusivamente nell'orto
				;)
			</p>
		</div>
		<div class="col-md-7 mt-5">
			<img src="/images/garden1.webp" class="w-100 h-100" alt="" />
		</div>
	</div>
</div>

<span id="v-and-p" class="mt-5" />

<div class="row pt-3">
	<div class="row border-end col-md-6">
		<div class="col-md-5">
			<h2 class="">Valori</h2>
			<h5 class=" text-muted">prendersi cura</h5>
			<p class="lead">della terra</p>
			<p class="lead">delle persone</p>
			<h5 class="text-muted">condivisione del surplus</h5>
		</div>
		<div class="col-md-1">
			<Figure>
				<img src="/images/values.webp" alt="" />
				<caption>I valori della Permacultura</caption>
			</Figure>
		</div>
	</div>
	<div class="row border-end col-md-6 p-3">
		<div class="col-md-5">
			<h2 class="">Principi</h2>
			<h4 class=" text-muted">12 punti</h4>
			<p class="lead">di David Holmgren</p>
			<a target="_blank" href="https://it.wikipedia.org/wiki/Permacultura#Principi">
				per saperne di più
			</a>
		</div>
		<div class="col-md-1">
			<Figure>
				<img src="/images/principles.webp" alt="" />
				<caption>12 principi</caption>
			</Figure>
		</div>
	</div>
</div>

<div id="applications">
	<h2>Applicazioni</h2>
	<p>Questo approccio si presta ad esempio per essere applicato:</p>
	<ul>
		<li>alla coltivazione di piante</li>
		<li>l'utilizzo agroforestale del terreno</li>
		<li>all'accessibilità al pubblico come giardino aperto ai visitatori</li>
		<li>e/o ad un orto terapeutico</li>
		<li>alla comunicazione</li>
		<li>per allevare animali</li>
	</ul>
	<p>
		Applichiamo i principi base della Permacultura proprio per progettare i paesaggi in modo
		consapevole, imitando le relazioni e i modelli già presenti in natura (progettazione sistemica).
		Impariamo dai sistemi naturali, frutto di milioni di anni di evoluzione, allo scopo di produrre
		cibo, materiale ed energia per soddisfare i bisogni locali.
	</p>
	<p>
		Fondamentale é poi riuscire a trasformarci da consumatori dipendenti dalla grande industria in
		cittadini responsabili, consapevoli e produttivi.
	</p>
	<p>
		La Permacultura è stata sviluppata a partire dagli anni settanta, dagli australiani Bill
		Mollison e David Holmgren. Tocca varie aree, come l'agricoltura, l'architettura, la biologia, la
		selvicoltura e la zootecnica. Come pure la comunicazione non violenta, la sociocrazia,
		l'educazione, ecc.
	</p>
</div>

<style>
	img {
		width: 300px;
	}
	#v-and-p {
		scroll-margin-top: 100px;
		padding-top: 50px;
		margin-top: -50px;
	}
</style>
