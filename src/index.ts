import {
	ViewerApp,
	AssetManagerPlugin,
	GBufferPlugin,
	timeout,
	ProgressivePlugin,
	TonemapPlugin,
	SSRPlugin,
	SSAOPlugin,
	DiamondPlugin,
	FrameFadePlugin,
	GLTFAnimationPlugin,
	GroundPlugin,
	BloomPlugin,
	TemporalAAPlugin,
	AnisotropyPlugin,
	GammaCorrectionPlugin,
	addBasePlugins,
	ITexture,
	TweakpaneUiPlugin,
	AssetManagerBasicPopupPlugin,
	CanvasSnipperPlugin,
	IViewerPlugin,

	// Color, // Import THREE.js internals
	// Texture, // Import THREE.js internals
} from 'webgi';
import './styles.css';

import gsap from 'gsap';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let globalPosition: any;
let globalTarget: any;
let globalViewer:any;

async function setupViewer() {
	// Initialize the viewer
	const viewer = new ViewerApp({
		canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
	});

	// Add some plugins
	const manager = await viewer.addPlugin(AssetManagerPlugin);

	// Add a popup(in HTML) with download progress when any asset is downloading.
	// await viewer.addPlugin(AssetManagerBasicPopupPlugin);

	// Add plugins individually.
	await viewer.addPlugin(GBufferPlugin);
	await viewer.addPlugin(new ProgressivePlugin(32));
	await viewer.addPlugin(new TonemapPlugin(true));
	await viewer.addPlugin(GammaCorrectionPlugin);
	await viewer.addPlugin(SSRPlugin);
	await viewer.addPlugin(SSAOPlugin);
	// await viewer.addPlugin(DiamondPlugin)
	// await viewer.addPlugin(FrameFadePlugin)
	// await viewer.addPlugin(GLTFAnimationPlugin)
	// await viewer.addPlugin(GroundPlugin)
	await viewer.addPlugin(BloomPlugin);
	// await viewer.addPlugin(TemporalAAPlugin)
	// await viewer.addPlugin(AnisotropyPlugin)
	// and many more...

	// or use this to add all main ones at once.
	// await addBasePlugins(viewer)

	// Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
	// await viewer.addPlugin(CanvasSnipperPlugin);

	// This must be called once after all plugins are added.
	viewer.renderer.refreshPipeline();

	// Import and add a GLB file.
	await viewer.load('./assets/carro_3.glb');

	const plugin = viewer.getPlugin(TonemapPlugin);
	if (plugin && plugin.config) {
		plugin.config.clipBackground = true;
	}

	// viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false });

	globalPosition = viewer.scene.activeCamera.position;
	globalTarget = viewer.scene.activeCamera.target;
    globalViewer=viewer;

	viewer.scene.activeCamera.controls!.enabled = false;
	globalPosition.set(-6.96, 0.85, 4.55);
	globalTarget.set(0.7, -0.39, 1.54);


	viewer.addEventListener('preFrame', () => {
		//si debemos cambiar la posicion de la camara lo hacemos y ponemos nuestra variable bandera en false

		viewer.scene.activeCamera.positionUpdated(true);
	});

	console.log(viewer);

	// console.log(viewer.getPlugin(TonemapPlugin));

	// Load an environment map if not set in the glb file
	// await viewer.setEnvironmentMap((await manager.importer!.importSinglePath<ITexture>("./assets/environment.hdr"))!);

	// Add some UI for tweak and testing.
	// const uiPlugin = await viewer.addPlugin(TweakpaneUiPlugin)
	// Add plugins to the UI to see their settings.
	// uiPlugin.setupPlugins<IViewerPlugin>(TonemapPlugin, CanvasSnipperPlugin)
	scrollAnimate();
}

function scrollAnimate() {
	const tl = gsap.timeline();

	// empezamos la animacion de nuestro timeline
	//enviamos como primer argumento lo que queremos modificar, en este caso es la posicion de la cámara,
	// seguido del objeto con las propiedades que queremos modificar, en este caso son las coordenadas de la cámara

	tl.to(globalPosition, {
		// estos son los valores que cambiaremos
		//agregamos un ternario para verificar que nos encontramos en un dispositivo movil
		//y en caso afirmativo asignar unos valores, y en caso contrario asignar otros
		//para que el modelo se vea bien dentro de la ventana del navegador
        x: 0.70,
		y: 0.28,
		z: 3.96,
		// creamos nuestro scrolltrigger para configurarlo como el disparador de esta animación
		scrollTrigger: {
			//le indicamos que la animación inicia en sound section
			trigger: '#chido',
			// le indicamos que queremos que inicie cuando la parte superior
			// de la clase sound-section toque la parte inferior del viewport
			//dicho de otro modo podría decirse que empezará la animación cuando entre en el viewport el elemento
			//con la clase sound-section, con este comportamiento podemos eliminar el atributo start, pues ese es
			//el comportamiento por defecto de los elementos
			start: 'top bottom',
			// asignamos el final de la animacion como top top
			//es decir cuando la parte superior de nuestro elemento alcance la parte superior del viewport
			//es decir cuando el elemento y la parte superior del viewport colisionen
			end: 'top top',
			// scrub nos ayuda a que la posicion del elemento se mueva con el scroll, ya sea hacia adelante o hacia atrás, podemos tambien
			//agregar un pequeño delay a este movimiento, de modo que no se mueva de forma instantánea segun el valor del elemento
			//sino que le tome cierta cantidad de tiempo llegar a la nueva posición del scroll, en este caso la asignamos de 2
			//segundos
			scrub: 2,
			// desactivamos la renderización inmediata, al ser un elemento 3d que puede costar trabajo renderizar
			//con esto le indicamos que no intentará renderizar la animación hasta que sea disparada
			immediateRender: false,
		},
		// cuando la animación termine, queremos llamar la función onUpdate, dentro de esa fnción recordar que indicamos
		// en nuestra variable auxiliar que el elemento se necesita actualizar, y marcamos como dirty la camara
		//despues en nuestro event listener actualizamos la posicion de la camara y ponemos la variable de nuevo en false
		onUpdate:()=>{
            globalViewer.setDirty();
        },
		//copiamos y concatenamos para ahora modificar el target, tambien animando,
		// aqui no debemos ejecutar de nuevo onUpdate porque basta con ejecutarlo una vez
	}).to(globalTarget, {
		x: 0.06,
		y: -0.03,
		z: 1.16,

		scrollTrigger: {
			trigger: '#chido',
			start: 'top bottom',
			end: 'top top',
			scrub: 2,
			immediateRender: false,
		},
		// agregamos un fadeout
		//para la seccion de jumbotron, que se activará de igual forma cuando entremos a la sección sound,
		//aqui pasaremos la opacidad a 0 para que gradualmente se desvanezca
	});
}

setupViewer();

