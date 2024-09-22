const socket = io();

// Check if geolocation is available
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            // Full position object for debugging
            console.log("Position object: ", position);
            const { latitude, longitude } = position.coords;
            console.log("Sending location: ", latitude, longitude);  // Log the location being sent
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error: ", error);
        },
        {
            enableHighAccuracy: true,  // Use true for better accuracy
            timeout: 5000,  // Maximum time allowed for getting location
            maximumAge: 0,  // Prevent using cached location
        }
    );
} else {
    console.error("Geolocation is not supported by your browser.");
}

// Initialize the map and set a default center position (0,0)
const map = L.map("map").setView([0, 0], 16);

// Add the OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

// Object to store user markers by their socket ID
const markers = {};

// Handle location updates from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    console.log("Received location for user: ", id, latitude, longitude);  // Log received location

    // Verify setView with additional logging
    console.log("Setting map view to: ", latitude, longitude);
    map.setView([latitude, longitude]);

    // If a marker already exists for the user, update its position
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker for the user if it doesn't exist
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
    console.log("User disconnected: ", id);

    // If a marker exists for the disconnected user, remove it from the map
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
