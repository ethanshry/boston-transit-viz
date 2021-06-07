<script>
  export let lineName;
  export let showMap;
  export let routes;
  let canvas;

  let canvasDimensions = {
    minLat: 42,
    maxLat: 43,
    minLong: -70.5,
    maxLong: -71.5,
  };

  $: ctx = initCanvas(canvas);

  function initCanvas(cvs) {
    let ctx = cvs?.getContext("2d");
    // ctx?.translate(cvs?.width / 2, cvs?.height / 2);
    //ctx.scale(1, -1);
    return ctx;
  }

  async function getVehiclePositions(debug = false) {
    let apiData = await fetch("https://api-v3.mbta.com/vehicles", {
      headers: {
        "x-api-key": "process.env.API_TOKEN",
      },
    });
    apiData = await apiData.json();
    if (debug) {
      console.group("Vehicle Position Data");
      console.log("Raw Data:");
      console.log(apiData);
    }
    apiData =
      apiData.data?.map((v) => {
        return {
          id: v.id,
          route: v.relationships.route?.data?.id,
          latitude: v.attributes.latitude,
          longitude: v.attributes.longitude,
        };
      }) ?? [];
    if (debug) {
      console.log("Resulting Position Data:");
      console.log(apiData);
      console.groupEnd();
    }
    return apiData;
  }

  let data = {};

  setInterval(async () => {
    if (showMap) {
      let positionData = await getVehiclePositions();
      positionData.forEach((v) => {
        if (data[v.id] !== undefined) {
          data[v.id] = [...data[v.id], v];
        } else {
          data[v.id] = [v];
        }
      });
    } else {
      data = {};
    }
    // then we need to draw the map?
    for (let k in data) {
      let pos = data[k][data[k].length - 1];
      // color defaults to black
      let color = routes[pos.route]?.color;
      console.log(color);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(
        (pos.latitude - canvasDimensions.minLat) * 1000,
        (pos.longitude - canvasDimensions.minLong) * 1000 * -1,
        1,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();
    }
  }, 10000);
</script>

<map>
  {#if showMap}
    <h2>Map of the {lineName}</h2>
    <canvas bind:this={canvas} width="1000" height="1000" />
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
