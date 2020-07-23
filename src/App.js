import React, { Component } from 'react';
import './App.css';
import mapboxgl from 'mapbox-gl';
import key from './key';

  mapboxgl.accessToken = key;

  class App extends Component{
    constructor(props) {
      super(props);
      this.state = {
      lng: 0,
      lat: 0,
      zoom: 5
      };
    }

    

    componentDidMount() {
      fetch('http://api.open-notify.org/iss-now.json').then(res => res.json()).then(r => this.setState({lng: r.iss_position.longitude,lat: r.iss_position.latitude}));
      const map = new mapboxgl.Map({
        container: this.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [this.state.lng, this.state.lat],
        zoom: this.state.zoom
      });
      map.on('move', () => {
        this.setState({
        zoom: map.getZoom().toFixed(2)
        });
        });
    }

    componentDidUpdate(prevProps,prevState){
      if(prevState.lng !== this.state.lng){
        const map = new mapboxgl.Map({
          container: this.mapContainer,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [this.state.lng, this.state.lat],
          zoom: this.state.zoom
        });
        map.on('move', () => {
          this.setState({
          zoom: map.getZoom().toFixed(2)
          });
        });




        let size = 200;

        let pulsingDot = {
          width: size,
          height: size,
          data: new Uint8Array(size * size * 4),

          onAdd: function() {
            let canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
          },

          render: function() {
            let duration = 1000;
            let t = (performance.now() % duration) / duration;

            let radius = (size / 5) * 0.3;
            let outerRadius = (size / 5) * 0.7 * t + radius;
            let context = this.context;

            // draw outer circle
            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                outerRadius,
                0,
                Math.PI * 2
            );
            context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
            context.fill();

            // draw inner circle
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                radius,
                0,
                Math.PI * 2
            );
            context.fillStyle = 'rgba(255, 100, 100, 1)';
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();

            // update this image's data with data from the canvas
            this.data = context.getImageData(
                0,
                0,
                this.width,
                this.height
            ).data;

            // continuously repaint the map, resulting in the smooth animation of the dot
            map.triggerRepaint();

            // return `true` to let the map know that the image was updated
            return true;
          }
        };

        map.on('load', () => {
            map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
    
            map.addSource('points', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [this.state.lng, this.state.lat]
                            }
                        }
                    ]
                }
            });
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'points',
                'layout': {
                    'icon-image': 'pulsing-dot'
                }
            });
        });
      }
    }
    render() {
      
      return (
        <div>
          <div className='sidebarStyle'>
            <div>International Space Station is currently at:</div>
            <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
          </div>
          <div ref={el => this.mapContainer = el} className='mapContainer' />
        </div>
      )
    }
}

export default App;
