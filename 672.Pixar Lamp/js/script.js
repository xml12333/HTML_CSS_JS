// JS - only for GUI!!!

import { GUI } from "https://cdn.skypack.dev/dat.gui"

const scene = document.querySelector('.scene')
const gui = new GUI();

const data = {
  sceneAngleX: -10,
  sceneAngleY: -30,
  angle1: 0,
  angle2: 0,
  angle3: 40,
  jump: false,
  lightOn: true,
}

const resetData = { Reset:function() {
  for (var i = 0; i < gui.__controllers.length; i++) {
    const initialValue = gui.__controllers[i].initialValue;
    
    if (typeof initialValue !== 'function') {
      gui.__controllers[i].setValue(initialValue);
    }
  }
}};

gui.add(data, 'sceneAngleX', -60, 0, 1).name('Scene angle X').onChange(updateData);
gui.add(data, 'sceneAngleY', -180, 180, 1).name('Scene angle Y').onChange(updateData);
gui.add(data, 'angle1', -20, 20, 1).name('Lamp base').onChange(updateData);
gui.add(data, 'angle2', -30, 15, 1).name('Lamp body').onChange(updateData);
gui.add(data, 'angle3', -60, 60, 1).name('Lamp top').onChange(updateData);
gui.add(data, 'jump', 0, 1, 1).name('Jump animation').onChange(updateData);
gui.add(data, 'lightOn', 0, 1, 1).name('Light on').onChange(updateData);
gui.add(resetData, 'Reset');

function updateData() {
  
  for (var i = 0; i < gui.__controllers.length; i++) {
    if (gui.__controllers[i].property.includes('angle')) {
      gui.__controllers[i].domElement.style.display = data.jump ? 'none' : 'revert';
    }
  }

  scene.style.setProperty('--sceneAngleX', data.sceneAngleX);
  scene.style.setProperty('--sceneAngleY', data.sceneAngleY);
  scene.style.setProperty('--angle1', data.angle1);
  scene.style.setProperty('--angle2', data.angle2);
  scene.style.setProperty('--angle3', data.angle3);
  scene.style.setProperty('--stopAnimation', data.jump ? 'unset' : 'true');
  scene.style.setProperty('--lightColorBase', data.lightOn ? "#ff0": "#770");
  scene.style.setProperty('--lightColorBeam', data.lightOn ? "#ff0": "#ff00");
}

updateData();