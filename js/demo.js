let camera, scene, renderer,mesh;
let width = window.innerWidth,height = window.innerHeight;
let lon = 90, // 屏幕横轴偏移量
    lat = 0,  // 屏幕纵轴偏移量
    phi = 0,  // 相机的横屏面 到y轴 的 偏移弧度
    theta = 0,// 相机的竖切面 到x轴 的 偏移弧度
    target = new THREE.Vector3(), // 用来表示相机的目标向量
    startX, // 记录鼠标按下的时候横轴位置
    startY, // 记录鼠标按下的时候纵轴位置
    startLon, // 记录移动时的鼠标横轴位置
    startLat; // 记录移动时的鼠标横轴位置

function init() {
    let box;
    box = document.getElementById("app")

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1100);

    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    box.appendChild(renderer.domElement);
    renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
   // box.addEventListener('touchstart',onDocumentTouchStart,false);
   //  box.addEventListener('touchmove',onDocumentTouchMove,false);
    //环境光
    var ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);
    createMesh()
}

/**
 * 封装 创造网格的 函数
 */
function createMesh() {
    let url = './imgs/'
    if (!mesh) {
        //前后上下左右
        let a = [
            loadTexture(url + "pano_f.jpg"),
            loadTexture(url + "pano_b.jpg"),
            loadTexture(url + "pano_u.jpg"),
            loadTexture(url + "pano_d.jpg"),
            loadTexture(url + "pano_l.jpg"),
            loadTexture(url + "pano_r.jpg")
        ];
        mesh = new THREE.Mesh(
            new THREE.BoxGeometry(300, 300, 300),

            a
        );
        // mesh.scale.x= -1;
    }
    scene.add(mesh);
}

/**
 * 封装纹理贴图函数
 * @param d
 * @returns {MeshBasicMaterial}
 */
function loadTexture(d) {
    let textureLoader = new THREE.TextureLoader();
    let texture = textureLoader.load(d);// 加载纹理贴图
    texture.rotation = Math.PI;
    texture.needsUpdate = true;//将其设置为true，以便在下次使用纹理时触发一次更新。 这对于设置包裹模式尤其重要。
    console.log(texture)
    // 基础网格材质 一个以简单着色（平面或线框）方式来绘制几何体的材质
    // 这种材质不受光照的影响。
    let material = new THREE.MeshBasicMaterial({
        map: texture// 设置颜色贴图属性值
    });

    return material
}



/**
 * 检测效果函数
 */
function test(){
    camera.position.set(500, 300, 0); //设置相机位置
    camera.lookAt(scene.position);
    renderer.render(scene, camera)
}

// 封装更新渲染函数
function update(){
    lon += 0.05;
    lat  = Math.max(-85,Math.min(85,lat));
    phi = THREE.Math.degToRad(90-lat);
    theta = THREE.Math.degToRad(lon);
    target.x = 500 * Math.sin(phi) * Math.cos(theta)
    target.y = 500 * Math.cos(phi)
    target.z = 500 * Math.sin(phi) * Math.sin(theta)
    camera.lookAt(target);
    renderer.render(scene,camera)
}

//封装 运动函数
function animate(){
    requestAnimationFrame(animate);
    update();
}

/**
 * 事件绑定
 * @param a
 */
function onDocumentTouchStart(a) {
    a.preventDefault();
    startX = a.touches[0].pageX;
    startY = a.touches[0].pageY;
    startLon = lon;
    startLat = lat
}
function onDocumentTouchMove(c) {
    c.preventDefault();
    lon = (startX - c.touches[0].pageX) * 0.2 + startLon;
    lat = (c.touches[0].pageY - startY) * 0.2 + startLat
    update()
}