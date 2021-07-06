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
</script>

<Navbar color="light" light expand="md">
	<NavbarBrand href="/">
		Permacultura <br /><spam class="text-muted">Svizzera Italiana</spam>
	</NavbarBrand>
	<NavbarToggler on:click={() => (isOpen = !isOpen)} />

	<Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
		<Nav class="ms-auto" navbar>
			{#if $page.path.startsWith('/permablitz')}
				<NavItem>
					<NavLink href="/permablitz/calendar">Come funziona</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/permablitz/calendar">I nostri eventi</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/permablitz/projects" active>Progetti</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/permablitz/values">Valori</NavLink>
				</NavItem>
				<Dropdown nav inNavbar>
					<DropdownToggle nav caret>Persone</DropdownToggle>
					<DropdownMenu>
						<DropdownItem>I ruoli dei Permablitz</DropdownItem>
						<DropdownItem divider />
						<DropdownItem>Progettisti</DropdownItem>
						<DropdownItem href="values">Collaboratori</DropdownItem>
						<DropdownItem href="values">Host</DropdownItem>
						<DropdownItem href="values">Artigiani</DropdownItem>
						<DropdownItem href="values">Negozi e Fornitori</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<NavItem>
					<NavLink href="/tools" active>Gli Attrezzi</NavLink>
				</NavItem>
			{:else}
				<NavItem>
					<NavLink href="/what">Cos'è</NavLink>
				</NavItem>
        <NavItem>
          <NavLink href="/values">Valori</NavLink>
        </NavItem>
				<NavItem>
					<NavLink href="/calendar">Calendario</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/permablitz" active>Permablitz</NavLink>
				</NavItem>
        <NavItem>
          <NavLink href="/values">Bacheca</NavLink>
        </NavItem>
				<Dropdown nav inNavbar>
					<DropdownToggle nav caret>Chi siamo</DropdownToggle>
					<DropdownMenu>
						<DropdownItem href="values">Il Gruppo</DropdownItem>
            <DropdownItem href="values">I volontari</DropdownItem>
						<DropdownItem href="values">Obiettivi</DropdownItem>
						<DropdownItem href="hosts">Dicono di noi</DropdownItem>
						<DropdownItem href="hosts">Ringraziamenti</DropdownItem>
						<DropdownItem divider />
						<DropdownItem>Entra</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<NavItem>
					<NavLink href="who">Login</NavLink>
				</NavItem>
			{/if}
		</Nav>
	</Collapse>
</Navbar>
