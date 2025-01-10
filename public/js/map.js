let mymap = document.getElementById("mymap");
const place = mymap.getAttribute("location");
// const cityName = "Amsterdam Netherlands";
const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(place)}.json?key=${APIKEY}`;
  fetch(`${url}`)
    .then(response => response.json())
    .then(data => {
      if (data && data.results && data.results.length > 0) {
        const location = data.results[0];
        const latitude = location.position.lat;
        const longitude = location.position.lon;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
              
        var map = tt.map({
          key: APIKEY,
          container: "mymap",
          center:[longitude,latitude],
          zoom:13,
        });
        map.addControl(new tt.FullscreenControl());
        map.addControl(new tt.NavigationControl());
        new tt.Marker({color:"red"})
        .setLngLat([longitude, latitude])
        .setPopup(new tt.Popup({ offset: 5 }).setText(`City : ${place}`)) // Optional: Add a popup with the city name
        .addTo(map);
      }else {
        console.log('No results found.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
