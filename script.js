// Coordonnées approximatives de Polytech Tours
const LAT_POLYTECH = 47.364604;
const LNG_POLYTECH = 0.684748;

let currentLat = LAT_POLYTECH;
let currentLon = LNG_POLYTECH;
let fingerDown = false;

let lastCountry = null;
let lastCheckTime = 0;


setInterval(() => {
    console.log(fingerDown);
    if (fingerDown){
        handlePosition(currentLat, currentLon);
    }

}, 1000);


// Initialisation de la carte centrée sur Paris
let map = L.map('map', {
    dragging: false,
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    touchZoom: false
}).setView([LAT_POLYTECH, LNG_POLYTECH], 6); // Zoom initial

// Tuile OpenStreetMap /!\ à usage policy
const maxZoom = 20
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: maxZoom,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



map.getContainer().addEventListener('touchstart', (e) => {
    if(e.touches.length == 1){
        fingerDown = true;
        const touch = e.touches[0];
        const latlng = map.containerPointToLatLng([touch.clientX, touch.clientY]);
        currentLat = latlng.lat;
        currentLon = latlng.lng;
    }
    else if(e.touches.length >= 2){
        fingerDown = false;
    }
});

map.getContainer().addEventListener('touchmove', async (e) => {
    //console.log('cc');
    if(e.touches.length == 1){
        fingerDown = true;
        const touch = e.touches[0];
        const latlng = map.containerPointToLatLng([touch.clientX, touch.clientY]);
        currentLat = latlng.lat;
        currentLon = latlng.lng;
    
    }
    else if (e.touches.length >= 2){
        fingerDown = false;
        // Deux doigts : pan fluide

    }


    // handlePosition(latlng.lat, latlng.lng);
});


map.getContainer().addEventListener('touchend', () => {
    fingerDown = false;
});


async function handlePosition(lat, lon) {
    const now = Date.now();
    if (now - lastCheckTime < 1000) return; // limite à 2 requêtes/sec
    lastCheckTime = now;

    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    console.log(res);
    const data = await res.json();
    console.log(data);
    try {
        const country = data.address.country;

    if (country !== lastCountry) {
        const message = `Tu rentres dans ${country}`;
        console.log(message);
        speak(`${country}`);
        lastCountry = country;
    }
    else{
        const subdivision =  data.address.state || data.address.county || data.address.region ||data.address.district || "région non spécifiée";
        console.log(`Tu es dans ${subdivision}`);
        speak(`${subdivision}`);
    }
    } catch (error) {
        console.log('coucou');
        //const marineRes = await fetch(`https://www.marineregions.org/rest/getGazetteerRecordsByLatLong.json?lat=${lat}&lon=${lon}`);
        // océan ou mer
    }

}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR'; // ou 'en-US' si tu veux en anglais
    speechSynthesis.cancel(); // stop toute parole en cours
    speechSynthesis.speak(utterance);
}
