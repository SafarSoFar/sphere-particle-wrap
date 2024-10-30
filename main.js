import * as THREE from 'three';
import { FBXLoader, GLTFLoader, OrbitControls, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { clamp, normalize, randFloat, randInt } from 'three/src/math/MathUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'; 
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'; 

class Dot{
     constructor(pivot){
          // let dotMaterial =  new THREE.MeshPhongMaterial();
          // dotMaterial.color = new THREE.Color(dotColors[randInt(0,1)]);
          // dotMaterial.emissive = dotMaterial.color;
          // dotMaterial.emissiveIntensity = 5;
          let dotMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

          this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.07), dotMaterial);
          this.pivot = pivot;
          this.isAvoiding = false;
          this.lerpFactor = 0.0;
          this.velocityX = 0;
          this.velocityY = 0;
          this.lerpSpeed = 0.1;
          this.isAvoiding = false;
          this.targetPos = new THREE.Vector3(); 
     }

     avoidMouse(mousePos){
          
          let dotGlobalPos = new THREE.Vector3();
          let pivotGlobalPos = new THREE.Vector3();
          this.mesh.getWorldPosition(dotGlobalPos);
          this.pivot.getWorldPosition(pivotGlobalPos);
          let distance = pivotGlobalPos.distanceTo(mousePos);
          // console.log(distance);
          
          if(distance < 20.0){

               let dir = new THREE.Vector2(dotGlobalPos.x-mousePos.x, dotGlobalPos.y-mousePos.y);
               dir.normalize();


               this.targetPos.x = dir.x * 10;
               this.targetPos.y = dir.y * 10;
               if(!this.isAvoiding){
                    this.lerpFactor = 0.0;
                    this.isAvoiding = true;
               }
          }
          if(distance > 25.0){
               if(this.isAvoiding){
                    this.isAvoiding = false;
                    this.lerpFactor = 0.0;
               }
               this.targetPos.copy(new THREE.Vector3());
               
          }
     }

     
     controlMovement(){
          // this.mesh.position.x += this.velocityX;
          // this.mesh.position.y += this.velocityY;
          this.mesh.position.lerp(this.targetPos, this.lerpFactor);

          if(this.lerpFactor < 1.0){
               this.lerpFactor += this.lerpSpeed;
          }
          
     }
     
     

}

// function randomInt(min, max){
//      return Math.floor(Math.random() * (max-min+1)+min);
// }


const scene = new THREE.Scene(); 
const renderer = new THREE.WebGLRenderer(); 

var mousePos = new THREE.Vector2();

// renderer.setClearColor(0x010328);


// scene.add(new THREE.AmbientLight(0xffffff));
scene.add(new THREE.DirectionalLight(0xffffff));

// renderer.setClearColor(0xffffff);
renderer.setSize( window.innerWidth, window.innerHeight ); 

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 

const controls = new OrbitControls(camera, renderer.domElement );


// by default no ascii effect
document.body.appendChild( renderer.domElement );

// let directionalLight = new THREE.DirectionalLight(0xffffff, 100);
// scene.add(directionalLight);




const composer = new EffectComposer(renderer);

const renderPass = new RenderPass( scene, camera ); 
composer.addPass( renderPass ); 
const glowPass = new UnrealBloomPass();
composer.addPass( glowPass ); 


document.addEventListener("mousemove", onDocumentMouseMove, false);
function onDocumentMouseMove(event){
     
     event.preventDefault();

     mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
     mousePos.y = - (event.clientY / window.innerHeight) * 2 + 1;

     var vector = new THREE.Vector3(mousePos.x, mousePos.y, 0.5);
     vector.unproject( camera );
     var dir = vector.sub( camera.position ).normalize();
     var distance = - camera.position.z / dir.z;
     mousePos = camera.position.clone().add( dir.multiplyScalar( distance ) );
     // console.log("x" + mousePos.x);
     // console.log("y" + mousePos.y);

}

window.addEventListener("resize", onWindowResize,false);

function onWindowResize() {

     camera.aspect = window.innerWidth / window.innerHeight;
     camera.updateProjectionMatrix();


     renderer.setSize( window.innerWidth, window.innerHeight ); 
     

}

let outerSphereDots = [];
let outerSpherePivots = new THREE.Group();

var outerSphere = new THREE.Mesh(new THREE.SphereGeometry(10,64,64), new THREE.MeshBasicMaterial());
let outerPositionAttribute = outerSphere.geometry.attributes.position;

for(let i = 0; i < outerPositionAttribute.count; i++){
     const vertex = new THREE.Vector3();
     vertex.fromBufferAttribute(outerPositionAttribute, i);
     const globalPos = vertex.clone().applyMatrix4(outerSphere.matrixWorld);

     let pivot = new THREE.Group();
     pivot.position.copy(globalPos);
     let dot = new Dot(pivot);
     dot.mesh.material = new THREE.MeshBasicMaterial({color:0xf9a66c});
     outerSphereDots.push(dot);

     pivot.add(dot.mesh);
     dot.mesh.position.copy(new THREE.Vector3());
     outerSpherePivots.add(pivot); 
}

scene.add(outerSpherePivots);

let innerSphereDots = [];
let innerSpherePivots = new THREE.Group();

var innerSphere = new THREE.Mesh(new THREE.SphereGeometry(9,64,64), new THREE.MeshBasicMaterial());
let positionAttribute = innerSphere.geometry.attributes.position;

for(let i = 0; i < positionAttribute.count; i++){
     const vertex = new THREE.Vector3();
     vertex.fromBufferAttribute(positionAttribute, i);
     const globalPos = vertex.clone().applyMatrix4(innerSphere.matrixWorld);

     let pivot = new THREE.Group();
     pivot.position.copy(globalPos);
     let dot = new Dot(pivot);
     dot.mesh.material = new THREE.MeshBasicMaterial({color:0xd83f87});
     innerSphereDots.push(dot);

     pivot.add(dot.mesh);
     dot.mesh.position.copy(new THREE.Vector3());
     innerSpherePivots.add(pivot); 
}


// scene.add(innerSpherePivots);

// let cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1,20,20, 20), new THREE.MeshBasicMaterial({wireframe: true}));
// scene.add(cube);


camera.position.z = 35;





// let cube = new THREE.Mesh(new THREE.BoxGeometry(3,3,3));
// scene.add(cube);

function animate() {
     // outerSpherePivots.rotation.x += 0.01;
     // outerSpherePivots.rotation.y += 0.01;
     // outerSpherePivots.rotation.z += 0.01;
     for(let i = 0; i < outerSphereDots.length; i++){
          outerSphereDots[i].avoidMouse(mousePos);
          outerSphereDots[i].controlMovement();

     }

     // innerSpherePivots.rotation.x -= 0.01;
     // innerSpherePivots.rotation.y -= 0.01;
     // for(let i = 0; i < innerSphereDots.length; i++){
     //      innerSphereDots[i].avoidMouse(mousePos);
     //      innerSphereDots[i].controlMovement();

     // }

     // if (mixer) mixer.update(0.2);

     composer.render();
     // renderer.render( scene, camera ); 

     controls.update();

} 

renderer.setAnimationLoop( animate );

