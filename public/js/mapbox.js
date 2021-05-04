//this file is used for serving mapbox as a client file to the rendered html page
// for this, we use the particular id named map of the rendered html page, to which we added the script

export const displayMap = (locations) => {
  // Initally, we need to set the mapboxgl token
  mapboxgl.accessToken =
    'pk.eyJ1Ijoic3VqYXk5OTk5OSIsImEiOiJja2w5b3UwY2cwcG0wMnJuMHBiaGJjNDl6In0.yfquw7he_HyCEkqKfeWcew';

  //create a new map instance
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/sujay99999/cklaitatp1y9b17pnpcwcnuf5',
    zoom: 4,
    scrollZoom: false,
  });

  //now we create a bounds variable to store all the location points of the tour
  const bounds = new mapboxgl.LngLatBounds();

  //now, for each of the locations, we adda marker to the assigned map
  locations.forEach((loc) => {
    // we add a marker for each loc and add to the map created

    //to use a specially created pointer, we create a new html element using js and replace it with the default pointer of the mapbox
    const markerIcon = document.createElement('div');
    markerIcon.classList.add('marker');

    new mapboxgl.Marker({
      element: markerIcon,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //we also need to add a popup to each of the location and finally add them to the map
    new mapboxgl.Popup({
      anchor: 'top-left',
      closeOnClick: false,
    })
      .setLngLat(loc.coordinates)
      .setHTML(
        `<p style= 'font-size: 12px;'>DAY: ${loc.day} <br>${loc.description}</p>`
      )
      .addTo(map);
    //we extend the bounds variable by adding a new coordinate
    bounds.extend(loc.coordinates);
  });

  // this instance method, extends the map only to view the points of the locations present in the bounds variable
  map.fitBounds(bounds, {
    padding: {
      top: 150,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
