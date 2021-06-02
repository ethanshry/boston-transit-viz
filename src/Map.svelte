<script>
  export let lineName;
  export let showMap;
</script>

<map>
  {#if showMap}
    <h2>Map of the {lineName}</h2>
    <canvas width="500" height="500" />
  {:else}
    <h2>Click to display the map</h2>
  {/if}
</map>

<style>
  canvas {
    width: 100%;
    height: 100%;
  }
</style>
