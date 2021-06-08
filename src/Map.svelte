<script>
  export let lineName;
  export let showMap;
  export let routes;
  let canvas;

  export let canvasDimensions = {
    x: 800,
    y: 800,
  };

  let canvasMapCoordinates = {
    //minLat: 42,
    //maxLat: 42.8,
    //minLong: -70.6,
    //maxLong: -71.4,
    minLat: 42.3,
    maxLat: 42.5,
    minLong: -70.9,
    maxLong: -71.1,
  };

  let positionFetchDelayMillis = 5000;
  $: animationUpdateDelayMillis = (positionFetchDelayMillis / 1000) * 60;

  function getCanvasPosition(position) {
    let x =
      ((position.latitude - canvasMapCoordinates.minLat) /
        (canvasMapCoordinates.maxLat - canvasMapCoordinates.minLat)) *
      canvasDimensions.x;
    let y =
      ((position.longitude - canvasMapCoordinates.minLong) /
        (canvasMapCoordinates.maxLong - canvasMapCoordinates.minLong)) *
      canvasDimensions.y;
    return { x, y };
  }

  function getAnimationSteps(pointA, pointB, steps) {
    let minSegmentDist = 1;
    if (!pointA || !pointB) return;
    // Else, interpolate points along the line
    let deltaX = pointB.latitude - pointA.latitude;
    let deltaY = pointB.longitude - pointA.longitude;
    let distTotal = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    let propX = deltaX / distTotal;
    let propY = deltaY / distTotal;
    let segmentDist =
      distTotal / steps > minSegmentDist ? distTotal / steps : minSegmentDist;

    let waypoints = [];
    while (
      Math.abs(pointA.latitude - pointB.latitude) +
        Math.abs(pointA.longitude - pointB.longitude) >
      0
    ) {
      let point = {
        latitude: pointA.latitude + segmentDist * propX,
        longitude: pointA.longitude + segmentDist * propY,
      };
      if (
        (pointA.latitude > pointB.latitude &&
          point.latitude < pointB.latitude) ||
        point.latitude >= pointB.latitude
      ) {
        point.latitude = pointB.latitude;
      }
      if (
        (pointA.longitude > pointB.longitude &&
          point.longitude < pointB.longitude) ||
        point.longitude >= pointB.longitude
      ) {
        point.longitude = pointB.longitude;
      }
      waypoints.push(point);
      pointA = point;
    }
    return waypoints;
  }

  $: ctx = initCanvas(canvas);

  function initCanvas(cvs) {
    let ctx = cvs?.getContext("2d");
    if (ctx) {
      // TODO maybe fix the blur??
      //ctx.imageSmoothingEnabled = false;
    }
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
      // Get most recent vehicle position data
      let positionData = await getVehiclePositions();
      positionData.forEach((v) => {
        if (data[v.id] !== undefined) {
          data[v.id].points = [
            ...data[v.id].points,
            { latitude: v.latitude, longitude: v.longitude },
          ];
          data[v.id].animationTargets = getAnimationSteps(
            data[v.id].points[data[v.id].points.length - 1],
            data[v.id].points[data[v.id].points.length - 2],
            animationUpdateDelayMillis
          );
        } else {
          data[v.id] = {
            route: v.route,
            points: [{ latitude: v.latitude, longitude: v.longitude }],
            animationTargets: [],
          };
        }
      });
    } else {
      // We don't want to show the map, so clear the data
      data = {};
    }
    console.log(data);
  }, positionFetchDelayMillis);

  // Map Drawing Loop
  setInterval(() => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasDimensions.x, canvasDimensions.y);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasDimensions.x, canvasDimensions.y);
    for (let key in data) {
      let vehicle = data[key];
      let color = routes[vehicle.route]?.color;
      let pos = getCanvasPosition(vehicle.points[data[key].points.length - 1]);
      // draw the line up to the endpoint
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.beginPath();
      if (vehicle.points.length < 1) {
        continue;
      }
      ctx.moveTo(pos.x, pos.y);
      for (let i = 1; i < vehicle.points.length; i++) {
        if (i == vehicle.points.length - 1) {
          let pos = getCanvasPosition(vehicle.points[i]);
          // if we are currently animating to the last point, draw the animation step instead
          if (vehicle.animationTargets.length > 0) {
            pos = getCanvasPosition(vehicle.animationTargets.shift());
          }
          ctx.arc(pos.x, pos.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          // draw the next line segment
          let pos = getCanvasPosition(vehicle.points[i]);
          ctx.lineTo(pos.x, pos.y);
        }
      }
      ctx.stroke();
    }
  }, 16.67);
</script>

<map>
  {#if showMap}
    <h2>Map of the {lineName}</h2>
    <canvas
      bind:this={canvas}
      width={canvasDimensions.x}
      height={canvasDimensions.y}
    />
  {:else}
    <h2>Click to display the map</h2>
  {/if}
</map>

<style>
  canvas {
    width: 100%;
    max-width: 100vh;
  }
  canvas:after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
</style>
