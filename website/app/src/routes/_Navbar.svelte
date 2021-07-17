<script lang="ts">
	import {
		Collapse,
		Navbar,
		NavbarToggler,
		NavbarBrand,
		Nav,
		NavItem,
		NavLink,
		Dropdown,
		DropdownToggle,
		DropdownMenu,
		DropdownItem
	} from 'sveltestrap';

	let isOpen = false;

	function handleUpdate(event) {
		isOpen = event.detail.isOpen;
	}

	function requestFullScreen() {
		if (document.fullscreenEnabled) {
			document.documentElement.requestFullscreen();
		} else {
			console.log('Your browser cannot use fullscreen right now');
		}
	}

</script>

<Navbar color="light" light expand="md" class="border-bottom">
	<NavbarBrand href="/">
		Permacultura <br /><spam class="text-muted">Svizzera Italiana</spam>
	</NavbarBrand>
	<NavbarToggler on:click={() => (isOpen = !isOpen)} />

	<Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
		<Nav class="ms-auto" navbar>
			<NavItem>
				<NavLink href="/what">Cos'è<br />la Permacultura</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/calendar">Eventi</NavLink>
			</NavItem>
			<Dropdown nav inNavbar>
				<DropdownToggle nav caret>Chi siamo</DropdownToggle>
				<DropdownMenu>
					<DropdownItem href="/people">I volontari</DropdownItem>
					<DropdownItem href="/goals">Obiettivi</DropdownItem>
					<DropdownItem href="/whattheysay">Dicono di noi</DropdownItem>
					<DropdownItem href="/thankyou">Ringraziamenti</DropdownItem>
					<DropdownItem divider />
					<DropdownItem>Entra</DropdownItem>
				</DropdownMenu>
			</Dropdown>
			<NavItem>
				<NavLink target="_blank" href="http://scuolapermacultura.ch">Scuola</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/permablitz">Permablitz</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/board">Bacheca</NavLink>
			</NavItem>
			<Dropdown nav inNavbar>
				<DropdownToggle nav caret>Profilo</DropdownToggle>
				<DropdownMenu>
					<DropdownItem on:click={() => {
						requestFullScreen();
					}}>schermo intero</DropdownItem>
					<DropdownItem divider />
					<DropdownItem>Esci</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</Nav>
	</Collapse>
</Navbar>
