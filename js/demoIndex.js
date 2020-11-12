let camera, scene, renderer,mesh,controls;
let width = window.innerWidth,height = window.innerHeight;

let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let lon = 90, // 屏幕横轴偏移量
    lat = 0,  // 屏幕纵轴偏移量
    phi = 0,  // 相机的横屏面 到y轴 的 偏移弧度
    theta = 0,// 相机的竖切面 到x轴 的 偏移弧度
    target = new THREE.Vector3(), // 用来表示相机的目标向量
    startX, // 记录鼠标按下的时候横轴位置
    startY, // 记录鼠标按下的时候纵轴位置
    startLon, // 记录移动时的鼠标横轴位置
    startLat; // 记录移动时的鼠标横轴位置

let objects = [];
let textureLoader;
let listener, audio, audioLoader;

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
    box.addEventListener('touchstart',onDocumentTouchStart,false);
    box.addEventListener('touchmove',onDocumentTouchMove,false);
    box.addEventListener('touchend',getMousePosition,false);

    controls = new THREE.DeviceOrientationControls( camera, renderer.domElement );
    controls.update();
    let point = new THREE.PointLight(0xffffff);
    point.position.set(200, 200, 300); //点光源位置
    scene.add(point); //点光源添加到场景中
    //环境光
    let ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);
    fistScene();
    // addBGM('./music/Chinese.mp3')
}

/**
 * 封装 创造网格的 函数
 */
function createMesh(url) {
    //前后上下左右
    mesh = new THREE.Mesh(
        new THREE.SphereGeometry(300, 100, 100),
        loadTexture(url + "1281604848584_.pic_hd.jpg"),

    );
    mesh.scale.x= -1;
    scene.add(mesh);
}


/**
 * 封装纹理贴图函数
 * @param d
 * @returns {MeshBasicMaterial}
 */
function loadTexture(d) {
    textureLoader = new THREE.TextureLoader();
    let texture = textureLoader.load(d);// 加载纹理贴图
    texture.needsUpdate = true;//将其设置为true，以便在下次使用纹理时触发一次更新。 这对于设置包裹模式尤其重要。
    // 基础网格材质 一个以简单着色（平面或线框）方式来绘制几何体的材质
    // 这种材质不受光照的影响。
    let material = new THREE.MeshBasicMaterial({
        map: texture// 设置颜色贴图属性值
    });
    material.side = THREE.DoubleSide;
    return material
}

/**
 * 描述图标
 * @param vector3
 */
function addMagnifier(vector3,name) {
    let texture = new THREE.TextureLoader().load("./imgs/magnifier.png");
    let spriteMaterial = new THREE.SpriteMaterial({
        map: texture,//设置精灵纹理贴图
    });
    // 创建精灵模型对象，不需要几何体geometry参数
    let sprite = new THREE.Sprite(spriteMaterial);
    scene.add(sprite);
    // 控制精灵大小，比如可视化中精灵大小表征数据大小
    sprite.scale.set(2, 2, 2); //// 只需要设置x、y两个分量就可以
    sprite.position.set(vector3.x, vector3.y,vector3.z);
    sprite.name = name;
    objects.push(sprite);
}

/**
 * 添加导向箭头
 * @param vector3
 */
function addArrow(vector3,sceneName,rotation) {
    let texture = new THREE.TextureLoader().load("./imgs/up_arrow.png");
    let spriteMaterial = new THREE.SpriteMaterial({
        rotation:rotation,//旋转精灵对象45度，弧度值
        map: texture,//设置精灵纹理贴图
    });
    let sprite = new THREE.Sprite(spriteMaterial);
    scene.add(sprite);
    // 控制精灵大小，比如可视化中精灵大小表征数据大小
    sprite.scale.set(2, 2, 2); //// 只需要设置x、y两个分量就可以
    sprite.position.set(vector3.x, vector3.y,vector3.z);
    sprite.name = sceneName;
    objects.push(sprite);
}


//封装 运动函数
function animate(){
    camera.lookAt(target);
    renderer.render(scene,camera)
    requestAnimationFrame(animate);
}

/**
 * 更新相机看向的位置
 */
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

/**
 * 事件绑定
 * @param a
 */
function onDocumentTouchStart(a) {
    a.preventDefault();
    startX = a.touches[0].pageX;
    startY = a.touches[0].pageY;
    startLon = lon;
    startLat = lat;
}
function onDocumentTouchMove(c) {
    c.preventDefault();
    lon = (startX - c.touches[0].pageX) * 0.2 + startLon;
    lat = (c.touches[0].pageY - startY) * 0.2 + startLat
    update()
}

/**
 * 获取鼠标点击的点
 * @param event
 */
function getMousePosition(event){
    let x, y;
    if(event.changedTouches){
        x=event.changedTouches[0].pageX;
        y=event.changedTouches[0].pageY;
    }else{
        x=event.clientX;
        y=event.clientY;
    }
    mouse.x = ( x / window.innerWidth ) * 2 - 1
    mouse.y = -( y / window.innerHeight ) * 2 + 1
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(objects);

    //点中了添加的元素
    if (intersects.length > 0){
        switch (intersects[0].object.name) {
            case 'chair':
                showTextDialog();
                break;
            case 'video':
                showVideoDialog();
                break;
            case 'scene':
                fistScene();
                break;
            case 'scene2':
                changeScene('scene2','./imgs/scene3/1301604848587_.pic_hd.jpg');
                break;
            default:
                break;
        }
    }
}
function test(){
    camera.position.set(500, 300, 0); //设置相机位置
    camera.lookAt(scene.position);
    renderer.render(scene, camera)
}

function showTextDialog(){
    layer.open({
        style: 'border:none;',
        content:'一段文本描述'
    })
}

function fistScene() {
    scene = new THREE.Scene();
    createMesh('./imgs/scene3/');
    addArrow(new THREE.Vector3(-20,-3,6),'scene2',- Math.PI / 3);
    renderer.render(scene,camera);
}

/**
 * 切换场景
 * @param sceneName
 */
function changeScene(sceneName,url) {
    textureLoader.load(url,function (texture) {
        mesh.material.map = texture;
        for (let item in objects){
            let object = objects.pop();
            scene.remove(object);
        }
        renderer.render(scene,camera);
    });
}

function showVideoDialog(){
    $("#shandow").show();
    $("#dplayer").show();

}


init();
animate();