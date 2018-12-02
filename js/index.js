var r = 100;
var padding = 10;
var inset = .7 ;
var pos_wheel_2 = 300;
var y_pos = 350;
var spin_speed = 1;
var rec_init_x = 150;
var rec_init_y = 0;

var dragOne = d3.behavior.drag()
	.on('drag', dragOne);

var dragTwo = d3.behavior.drag()
    .on('drag', dragTwo);

var g = d3.select('svg')
	.attr({
		width: 1000,
		height: 600
	})
	.append('g')
	.attr('transform', 'translate(' + (r + padding) + ',' + (r + padding) + ')');

g.append("svg:image")
    .attr("xlink:href", "imgs/xz_coords.png")
    .attr("height", 300)
    .attr("x", -150)
    .attr("y", -75);

var rec = g.append('rect')
	.attr({
		class: 'cutting_tool',
		height: 100,
		width: 100,
		x: rec_init_x,
		y: rec_init_y
	});



g.append('circle')
	.attr({
		class: 'outer1',
		r: r,
		cy: y_pos
	});

g.append('circle')
	.attr({
		class: 'rotatable1',
		r: 15,
		cx: inset * r * Math.cos(0),
		cy: y_pos + inset * r * Math.sin(0),
	})
	.call(dragOne);

g.append('circle')
    .attr({
        class: 'outer2',
        r: r,
		cx: pos_wheel_2,
		cy: y_pos
    });

g.append('circle')
    .attr({
        class: 'rotatable2',
        r: 15,
        cx: pos_wheel_2 + inset * r * Math.cos(0),
        cy: y_pos + inset * r * Math.sin(0),
    })
    .call(dragTwo);




// store initial points
var xInit1 = d3.select('.rotatable1').attr('cx');
var yInit1 = d3.select('.rotatable1').attr('cy');

var xInit2 = d3.select('.rotatable2').attr('cx');
var yInit2 = d3.select('.rotatable2').attr('cy');


// reset location of rotatable circle
function reset() {
	d3.select('.rotatable1')
		.attr({
			cx: xInit1,
			cy: yInit1
		});

    d3.select('.rotatable2')
        .attr({
            cx: xInit2,
            cy: yInit2
        });

    rec.attr({
		x: rec_init_x,
		y: rec_init_y
	})
}



function setTranslated(element) {
    var currentTranslation = getTranslation(element.attr("transform"));

    element.attr("transform", null)
}

function getTranslation(transform) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttributeNS(null, "transform", transform);
    var matrix = g.transform.baseVal.consolidate().matrix;
    return [matrix.e, matrix.f];
}


var box;
var box2;

window.addEventListener('DOMContentLoaded', function(){
    var canvas = document.getElementById('canvas');

    var engine = new BABYLON.Engine(canvas, true);
    var createScene = function(){
        var scene = new BABYLON.Scene(engine);

        scene.clearColor = new BABYLON.Color3.White();

        box = BABYLON.Mesh.CreateBox("Box",4.0,scene);
        box2 = BABYLON.Mesh.CreateBox("Box2",4.0,scene);
        var material = new BABYLON.StandardMaterial("material1",scene);
        material.wireframe = true;
        box2.material = material;
        box2.position = new BABYLON.Vector3(-5,0,-5);

        var light = new BABYLON.PointLight("pointlight",new BABYLON.Vector3(0,10,0),scene);
        light.parent = camera;
        light.diffuse = new BABYLON.Color3(1,1,1);

        var camera = new BABYLON.ArcRotateCamera("arcCam",
            BABYLON.Tools.ToRadians(45),
            BABYLON.Tools.ToRadians(45),
            20.0,box.position,scene);
        camera.attachControl(canvas,true);


        // Keyboard events
        var clickedObject = 'sphere';
        console.log(clickedObject);
        box.actionManager = new BABYLON.ActionManager(scene);
        box.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
            clickedObject = 'box';
            console.log(clickedObject);
        }));

        box2.actionManager = new BABYLON.ActionManager(scene);
        box2.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
            clickedObject = 'box2';
            console.log(clickedObject);
        }));

        var inputMap ={};
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            console.log("trigger");
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        // Game/Render loop
        scene.onBeforeRenderObservable.add(()=>{
            if(inputMap["w"] || inputMap["ArrowUp"]){
                console.log("action");
                if (clickedObject == 'box'){
                    box.position.z+=0.1;
                }
                else if (clickedObject == 'box2') {
                    box2.position.z+=0.1;
                }
            }
            if(inputMap["a"] || inputMap["ArrowLeft"]){
                if (clickedObject == 'box'){
                    box.position.x-=0.1
                }
                else if (clickedObject == 'box2') {
                    box2.position.x-=0.1
                }
            }
            if(inputMap["s"] || inputMap["ArrowDown"]){

                if (clickedObject == 'box'){
                    box.position.z-=0.1
                }
                else if (clickedObject == 'box2') {
                    box2.position.z-=0.1
                }
            }
            if(inputMap["d"] || inputMap["ArrowRight"]){
                if (clickedObject == 'box'){
                    box.position.x+=0.1
                }
                else if (clickedObject == 'box2') {
                    box2.position.x+=0.1
                }
            }
        })

        return scene;
    }

    var scene = createScene();
    engine.runRenderLoop(function(){
        <!-- scene.getMeshByName("Box").position.z+=0.01; -->
        scene.render();
    });

});



var rot_one = 0;
var rad_prev_one = 0;

function dragOne() {
    // calculate delta for mouse coordinates
    var deltaX = d3.event.x;
    var deltaY = d3.event.y - y_pos;

    var rad = Math.atan2(deltaY, deltaX);

    if (rad_prev_one >= 2.7) {
        if (rad < -2.7) {
            if (rot_one === -1) rot_one = 0;
            else rot_one = rot_one !== 0 ? rot_one + 2 : rot_one + 1;
        }
    } else if (rad_prev_one <= -2.7) {
        if (rad > 2.7) {
            if (rot_one === 1) rot_one = 0;
            else rot_one = rot_one !== 0 ? rot_one - 2 : rot_one - 1;
        }
    }

    var rad_adj;

    if (rot_one > 0) rad_adj = Math.PI + rad;
    else if (rot_one < 0) rad_adj = rad - Math.PI;
    else rad_adj = rad;

    rad_prev_one = rad;


    d3.select(this)
        .attr({
            cx: inset * r * Math.cos(rad),
            cy: y_pos + inset * r * Math.sin(rad)
        });

    var rect_xfr = spin_speed * (rot_one * Math.PI + rad_adj);

    var calc = (rot_one * Math.PI + rad_adj);

    console.log('rad: ' + rad + ' | rot: ' + rot_one + ' | calc: ' + calc);


    // rec.attr("transform", "translate(" + 0 + "," + rect_xfr + ")");

    // setTranslated(rec);

    rec.attr("x", rec_init_x + rect_xfr);

    console.log(box.position.x);

    box.position.x=rect_xfr;
}

var rot_two = 0;
var rad_prev_two = 0;

function dragTwo() {
    // calculate delta for mouse coordinates
    var deltaX = d3.event.x-pos_wheel_2;
    var deltaY = d3.event.y - y_pos;

    var rad = Math.atan2(deltaY, deltaX);

    if (rad_prev_two >= 2.7) {
        if (rad < -2.7) {
            if (rot_two === -1) rot_two = 0;
            else rot_two = rot_two !== 0 ? rot_two + 2 : rot_two + 1;
        }
    } else if (rad_prev_two <= -2.7) {
        if (rad > 2.7) {
            if (rot_two === 1) rot_two = 0;
            else rot_two = rot_two !== 0 ? rot_two - 2 : rot_two - 1;
        }
    }

    var rad_adj;

    if (rot_two > 0) rad_adj = Math.PI + rad;
    else if (rot_two < 0) rad_adj = rad - Math.PI;
    else rad_adj = rad;

    rad_prev_two = rad;


    d3.select(this)
        .attr({
            cx: pos_wheel_2 + inset * r * Math.cos(rad),
            cy: y_pos + inset * r * Math.sin(rad)
        });

    var rect_xfr = - spin_speed * (rot_two * Math.PI + rad_adj);

    var calc = (rot_two * Math.PI + rad_adj);

    console.log('rad: ' + rad + ' | rot: ' + rot_two + ' | calc: ' + calc);


    // rec.attr("transform", "translate(" + rect_xfr + "," + 0 + ")");
    //
    // setTranslated(rec);

    rec.attr("y", rec_init_y + rect_xfr);

    console.log(box.position.z);

    box.position.z=rect_xfr;
}

