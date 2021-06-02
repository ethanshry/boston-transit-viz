<script>
  export let name;

  let count = 0;
  let showMap = false;

  $: document.title = `${name} ${count}`;

  import Map from "./Map.svelte";

  function getNewMapData() {
    console.log("fetching...");
    count++;
  }
</script>

<main>
  <h1>Hello {name}!</h1>
  <button on:click={getNewMapData}>Refresh Map</button>
  <button on:click={() => (showMap = true)}>Display</button>
  <Map lineName="MTBA System" {showMap} />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
