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
	import { page } from '$app/stores';

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
	<NavbarBrand href="/permablitz">
		Permablitz
	</NavbarBrand>
	<NavbarToggler on:click={() => (isOpen = !isOpen)} />

	<Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
		<Nav class="ms-auto" navbar>
			<NavItem>
				<NavLink href="/permablitz/how">Come funziona</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/permablitz/calendar">I nostri eventi</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/permablitz/projects">Esempi</NavLink>
			</NavItem>
			<Dropdown nav inNavbar>
				<DropdownToggle nav caret>Persone</DropdownToggle>
				<DropdownMenu>
					<DropdownItem href="/permablitz/roles">I ruoli dei Permablitz</DropdownItem>
					<DropdownItem divider />
					<DropdownItem href="/permablitz/designers">Progettisti</DropdownItem>
					<DropdownItem href="/permablitz/wwoofers">Collaboratori</DropdownItem>
					<DropdownItem href="/permablitz/hosts">Host</DropdownItem>
					<DropdownItem href="/permablitz/craftwomen">Artigiani</DropdownItem>
					<DropdownItem href="/permablitz/shops">Negozi e Fornitori</DropdownItem>
				</DropdownMenu>
			</Dropdown>
			<NavItem>
				<NavLink href="/permablitz/tools" active>Gli Attrezzi</NavLink>
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
