var map = L.map('map',{
  zoomControl:false,
  scrollWheelZoom: false
}).setView([-7.689736, -35.231984], 10);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  maxZoom: 18,
  id: 'mapbox/light-v10', // Estilo sem estradas
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiaHlsYW5zaWx2YWRldiIsImEiOiJjbHc1dmgzNzMxbHRuMnFucjkzOTBpYmVuIn0.LSao3QWFQM75CyQ9jB1ztw'
}).addTo(map);

// Evento de clique no botão para chamar a função resetZoom

// Carregue o arquivo cities.json
fetch('./src/js/cities.json')
.then(response => response.json())
.then(data => {
  var defaultStyle = {
    fillColor: 'orange',
    color: 'orange',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.25
  };
  
  var highlightedLayer = null; // Armazena a camada GeoJSON destacada atualmente
  
  // Função para aplicar estilo de destaque
  function highlightFeature(e) {
    if (highlightedLayer) {
      // Se houver um polígono destacado anteriormente, restaure seu estilo padrão
      highlightedLayer.setStyle(defaultStyle);
    }

    
    var layer = e.target;
    layer.setStyle({
      fillColor: 'transparent',
      color: 'red',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    });
    highlightedLayer = layer; // Atualize a camada destacada atualmente
    
    // Centralize e aplique zoom ao polígono clicado
    map.fitBounds(layer.getBounds(), { maxZoom: 13 });
  }
  
  // Adicione camadas GeoJSON para cada cidade com o estilo e o evento de clique definidos
  var citiesLayer = L.geoJSON(data.features, { 
    style: defaultStyle,
    onEachFeature: function(feature, layer) {
      if (feature.properties && feature.properties.name) {
        layer.bindTooltip(feature.properties.name, { permanent: false, direction: 'top' });
      }
      layer.on({
        click: highlightFeature
      });
    }
  }).addTo(map);
  
  // Adicione a barra de pesquisa
  var searchControl = new L.Control.Search({
    layer: citiesLayer,
    propertyName: 'name',
    position: 'topright',
    marker: false
  });
  map.addControl(searchControl);

  
});

function isHighlighted(feature) {
  return feature.properties.highlighted;
}

fetch('./src/js/bairros.json')
.then(response => response.json())
.then(data => {
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            // Verifique se o polígono está sendo destacado antes de adicionar o marcador
            if (isHighlighted(feature)) {
                return L.marker(latlng);
            }
            // Se não estiver destacado, não adicione o marcador
            return null;
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.name) {
                layer.bindPopup(feature.properties.name); // Adiciona uma popup com o nome do lugar
            }
        }
    }).addTo(map);
})
.catch(error => {
    console.error('Erro ao carregar o arquivo JSON:', error);
});

function resetZoom() {
  map.setView([-7.689736, -35.231984], 10);
}

document.getElementById('floating-button').addEventListener('click', resetZoom);