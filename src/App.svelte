<script>
  import { onMount } from "svelte";

  // get route data for the map
  async function getRoutes(debug = false) {
    let apiData = await fetch("https://api-v3.mbta.com/routes", {
      headers: {
        "x-api-key": "process.env.API_TOKEN",
      },
    });
    apiData = await apiData.json();
    if (debug) {
      console.group("Vehicle Route Data");
      console.log("Raw Data:");
      console.log(apiData);
    }
    let routeData = {};
    apiData.data.forEach((r) => {
      routeData[r.id] = {
        name: r.attributes.long_name,
        color: `#${r.attributes.color}`,
      };
    });
    if (debug) {
      console.log("Resulting Route Map:");
      console.log(routeData);
      console.groupEnd();
    }
    return routeData;
  }

  onMount(async () => {
    routeData = await getRoutes(false);
  });

  export let name;

  let count = 0;
  let showMap = false;
  let routeData;
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
  <Map lineName="MTBA System" {showMap} routes={routeData} />
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
