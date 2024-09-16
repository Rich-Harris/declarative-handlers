<script>
	import { page } from '$app/stores';
</script>

<nav>
	<a href="/">home</a>
	<a href="/alpha">alpha</a>
	<a href="/bravo">bravo</a>
	<a href="/charlie">charlie</a>
	<a href="/delta">delta</a>
	<a href="/echo">echo</a>
</nav>

<slot />

<p>{JSON.stringify($page.data)}</p>
