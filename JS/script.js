let map;
let userMarker;
let ewasteCenters = [
    { name: "E-Waste Center 1", location: { lat: 28.463408, lng: 77.508118 } },
    { name: "E-Waste Center 2", location: { lat: 28.446378, lng: 77.520681 } },
    { name: "E-Waste Center 3", location: { lat: 26.673200, lng: 82.029649 } },
];
let directionsService;
let directionsRenderer;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 28.463408, lng: 77.508118 },
        zoom: 10,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    ewasteCenters.forEach((center) => {
        addMarker(center.location, center.name);
    });

    // Automatically get user's current location when they allow location access
    if (navigator.geolocation) {
        currentLoc(); // Automatically find nearest location
    } else {
        console.log("Error: Your browser doesn't support geolocation.");
    }
}

function addMarker(location, title) {
    new google.maps.Marker({
        position: location,
        map: map,
        title: title,
        icon: {
            url: "../images/icon/ewaste_icon.png",
            scaledSize: new google.maps.Size(10, 10),
        },
    });
}

function addUserMarker(location) {
    userMarker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Your Location",
    });
}

function findNearestEwasteCenter(userLocation) {
    let nearestCenter = null;
    let nearestDistance = Infinity;

    ewasteCenters.forEach((center) => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(userLocation.lat, userLocation.lng),
            new google.maps.LatLng(center.location.lat, center.location.lng)
        );

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestCenter = center;
        }
    });

    return nearestCenter;
}

// Automatically get and use the user's current location
function currentLoc() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            map.setCenter(userLocation);
            addUserMarker(userLocation);

            const nearestCenter = findNearestEwasteCenter(userLocation);
            if (nearestCenter) {
                calculateAndDisplayRoute(userLocation, nearestCenter.location);
            } else {
                alert("No e-waste centers found.");
            }
        },
        () => {
            console.log("Error: The Geolocation service failed.");
        }
    );
}

// Function to calculate and display the route from user's location to the nearest e-waste center
function calculateAndDisplayRoute(origin, destination) {
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        }
    );
}

// Allow manual input as fallback
document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const location = document.getElementById("locationInput").value;
    const geocoder = new google.maps.Geocoder();

    if (location === "") {
        currentLoc(); // Fallback to current location if no location is entered
    } else {
        geocoder.geocode({ address: location }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                const userLocation = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng(),
                };

                map.setCenter(userLocation);
                if (userMarker) userMarker.setMap(null); 
                addUserMarker(userLocation);

                const nearestCenter = findNearestEwasteCenter(userLocation);
                if (nearestCenter) {
                    calculateAndDisplayRoute(userLocation, nearestCenter.location);
                } else {
                    alert("No e-waste centers found.");
                }
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }
});
