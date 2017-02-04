(function() {

    var width = 640, height = 480;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 50, width / height, 0.1, 1000 );
    var rayCaster = new THREE.Raycaster();
    var mousePosition = new THREE.Vector2();    
    var container = document.getElementById( 'container' );
    var renderer = webglAvailable() ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
    var geometry = new THREE.SphereGeometry(3, 30, 30, 0, Math.PI * 2, 0, Math.PI * 2);
    var material = new THREE.MeshNormalMaterial({wireframe:true});
    var sphere = new THREE.Mesh(geometry, material);
    var controls = new THREE.OrbitControls( camera );
    
    function webglAvailable() {
        try {
            var canvas = document.createElement("canvas");
            return !!
                window.WebGLRenderingContext && 
                (canvas.getContext("webgl") || 
                    canvas.getContext("experimental-webgl"));
        } catch(e) { 
            return false;
        } 
    }

    function info(text) {
        var e = document.getElementById('infotext');
        e.innerHTML = text;
    }

    document.body.addEventListener('click', function(event){
        event.preventDefault();

        // 0,0 are canvas left, top
        mousePosition.x = ((event.clientX - 0) / width) * 2 - 1;
        mousePosition.y = - ((event.clientY - 0) / height) * 2 + 1;

        rayCaster.setFromCamera(mousePosition, camera);

        var intersects = rayCaster.intersectObjects(sphere.children, true);


        if (intersects.length > 0)
            info(intersects[0].point);
        else info('fail')
    });

    controls.minDistance = 5;
    controls.maxDistance = 15;
    controls.enablePan = false;
    
    scene.add(sphere);

    renderer.setSize(width, height);
    camera.position.z = 10;
    //camera.position.y = 1;

    var render = function () {
        requestAnimationFrame(render);

        //sphere.rotation.y += 0.005;

        //info(Math.random());
        renderer.render(scene, camera);
    };

    document.body.appendChild(renderer.domElement);
    render();


//    render();
})();
