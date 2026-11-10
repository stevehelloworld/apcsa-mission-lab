/* Lightweight Three.js worlds for the city grid, memory trace, and night market. */
(function () {
  var CDN = 'https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js';
  var mounts = new Map();
  var THREE = null;

  function reportUnavailable() {
    document.querySelectorAll('.game-load-status').forEach(function (status) {
      status.textContent = '3D view unavailable. Use the controls below; your mission still works.';
    });
  }

  function isReduced() {
    return matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'minimal';
  }

  function load() {
    import(CDN).then(function (module) {
      THREE = module;
      mountAll();
      observeStages();
    }).catch(reportUnavailable);
  }

  function observeStages() {
    var observer = new MutationObserver(function () {
      mountAll();
      cleanRemoved();
    });
    observer.observe(document.querySelector('#mission-main'), { childList: true, subtree: true });
    document.addEventListener('visibilitychange', syncAll);
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', syncAll);
    new MutationObserver(syncAll).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    new MutationObserver(function () { mounts.forEach(updateCanvasLabel); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    document.addEventListener('mission:power-values', function (event) {
      mounts.forEach(function (world) {
        if (world.type !== 'grid') return;
        world.values = event.detail;
        updateGrid(world);
        drawOnce(world);
      });
    });
    document.addEventListener('mission:power-attempt', function (event) {
      mounts.forEach(function (world) {
        if (world.type !== 'grid') return;
        world.attempt = event.detail.ok ? 1 : -1;
        world.pulseUntil = performance.now() + 900;
        updateGrid(world);
        drawOnce(world);
        if (!event.detail.ok) {
          setTimeout(function () {
            if (!world.stage.isConnected || world.attempt >= 0) return;
            world.attempt = 0;
            updateGrid(world);
            drawOnce(world);
          }, 950);
        }
      });
    });
    document.addEventListener('mission:power-run', function () {
      mounts.forEach(function (world) {
        if (world.type !== 'grid') return;
        world.restored = true;
        world.pulseUntil = performance.now() + 1900;
        drawOnce(world);
      });
    });
    document.addEventListener('mission:trace-start', function () {
      mounts.forEach(function (world) {
        if (world.type !== 'trace') return;
        world.activeStep = 0;
        world.running = true;
        drawOnce(world);
      });
    });
    document.addEventListener('mission:trace-step', function (event) {
      mounts.forEach(function (world) {
        if (world.type !== 'trace') return;
        world.activeStep = event.detail.index;
        world.frame = event.detail.frame;
        world.pulseUntil = performance.now() + 800;
        drawOnce(world);
      });
    });
    document.addEventListener('mission:trace-reset', function () {
      mounts.forEach(function (world) {
        if (world.type !== 'trace') return;
        world.activeStep = 0;
        world.frame = null;
        world.running = false;
        drawOnce(world);
      });
    });
    document.addEventListener('mission:world-reset', function (event) {
      mounts.forEach(function (world) {
        if (world.type !== event.detail.scene) return;
        world.root.rotation.set(0, 0, 0);
        world.camera.position.set(10, 8, 11);
        world.camera.lookAt(0, 0, 0);
        drawOnce(world);
      });
    });
    document.addEventListener('mission:market-beat', function (event) {
      mounts.forEach(function (world) {
        if (world.type !== 'market') return;
        world.marketBeat = event.detail.success ? 1 : -1;
        world.pulseUntil = performance.now() + 1100;
        drawOnce(world);
      });
    });
  }

  function mountAll() {
    if (!THREE) return;
    document.querySelectorAll('.game-world[data-game-stage]').forEach(function (stage) {
      if (!mounts.has(stage)) {
        try {
          mounts.set(stage, buildWorld(stage));
          var status = stage.querySelector('.game-load-status');
          if (status) status.hidden = true;
        } catch (error) {
          var fallback = stage.querySelector('.game-load-status');
          if (fallback) fallback.textContent = '3D view unavailable. Use the controls below; your mission still works.';
        }
      }
    });
    syncAll();
  }

  function cleanRemoved() {
    mounts.forEach(function (world, stage) {
      if (stage.isConnected) return;
      cancelAnimationFrame(world.raf);
      world.renderer.dispose();
      world.resize.disconnect();
      mounts.delete(stage);
    });
  }

  function syncAll() {
    mounts.forEach(syncWorld);
  }

  function buildWorld(stage) {
    var renderer = new THREE.WebGLRenderer({
      canvas: stage.querySelector('canvas'),
      antialias: true,
      alpha: true,
      powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x071a22, 14, 34);
    if (stage.dataset.gameStage === 'market') scene.fog = new THREE.Fog(0x160f22, 15, 38);
    var camera = new THREE.PerspectiveCamera(37, 1, 0.1, 80);
    camera.position.set(10, 8, 11);
    camera.lookAt(0, 0, 0);
    var root = new THREE.Group();
    scene.add(root);
    scene.add(new THREE.HemisphereLight(0xb7d8cf, 0x0c1e24, 2.0));
    var key = new THREE.DirectionalLight(0xd6f1d3, 2.4);
    key.position.set(7, 12, 6);
    scene.add(key);
    var rim = new THREE.PointLight(0x53d7c4, 20, 24);
    rim.position.set(-5, 5, -5);
    scene.add(rim);

    var world = {
      stage: stage,
      type: stage.dataset.gameStage,
      renderer: renderer,
      scene: scene,
      camera: camera,
      root: root,
      resize: new ResizeObserver(function () { resizeWorld(world); }),
      raf: 0,
      visible: true,
      drag: null,
      reduced: false,
      startTime: performance.now(),
      values: { energy: 100, used: 35, balance: 65, stored: 65 },
      pulses: [],
      windows: [],
      buildings: [],
      traceNodes: [],
      attempt: 0,
      restored: false,
      marketBeat: 0,
      running: false,
      activeStep: Number(stage.dataset.traceStep) || 0,
      frame: null
    };

    addGround(world);
    if (world.type === 'grid') buildGrid(world);
    else if (world.type === 'market') buildMarket(world);
    else buildTrace(world);
    if (world.type === 'grid') {
      var energy = document.querySelector('#energy');
      var used = document.querySelector('#used');
      var stored = document.querySelector('#stored');
      var phase = document.querySelector('#power-phase');
      if (energy && used) world.values = {
        energy: Number(energy.value),
        used: Number(used.value),
        balance: Number(energy.value) - Number(used.value),
        stored: stored ? Number(stored.textContent) : 0
      };
      world.restored = !!phase && phase.textContent === 'Grid signal restored';
      updateGrid(world);
    }
    addPointerControls(world);
    world.resize.observe(stage);
    resizeWorld(world);
    drawOnce(world);
    syncWorld(world);
    return world;
  }

  function addGround(world) {
    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 22),
      new THREE.MeshStandardMaterial({ color: world.type === 'market' ? 0x21162d : 0x10252a, roughness: 0.88, metalness: 0.12 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.14;
    world.root.add(floor);
    var grid = new THREE.GridHelper(26, 26, world.type === 'market' ? 0x835a74 : 0x39736e, world.type === 'market' ? 0x382640 : 0x1c4548);
    grid.position.y = -0.1;
    grid.material.transparent = true;
    grid.material.opacity = 0.42;
    world.root.add(grid);
  }

  function standard(color, emissive, intensity, roughness) {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: emissive || 0x000000,
      emissiveIntensity: intensity || 0,
      roughness: roughness === undefined ? 0.68 : roughness,
      metalness: 0.18
    });
  }

  function buildGrid(world) {
    var pad = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.65, 0.32, 12), standard(0x254443, 0x0b2c30, 0.8));
    pad.position.y = 0.03;
    world.root.add(pad);
    var reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.82, 2.05, 8), standard(0x315951, 0x16685c, 0.9));
    reactor.position.set(0, 1.16, 0);
    world.root.add(reactor);
    var coreMaterial = standard(0xcdfb8a, 0x94f271, 2.8, 0.35);
    var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.52, 1), coreMaterial);
    core.position.set(0, 2.32, 0);
    world.root.add(core);
    world.core = core;
    world.coreMaterial = coreMaterial;
    var ring = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.055, 8, 40), standard(0x79d9b1, 0x41d8b0, 1.8));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.66;
    world.root.add(ring);
    world.ring = ring;

    var points = [];
    var places = [
      [-7.2, -3.2, 1.7, 2.2], [-5.0, 3.4, 2.0, 2.8], [-2.4, -5.4, 1.4, 3.0],
      [2.7, -5.2, 1.8, 2.4], [5.2, 3.8, 2.2, 3.4], [7.0, -2.3, 1.6, 2.2],
      [-7.6, 1.0, 1.4, 1.8], [7.8, 1.1, 1.4, 2.6], [0.4, 6.4, 1.8, 2.4]
    ];
    places.forEach(function (place, index) {
      var x = place[0], z = place[1], width = place[2], height = place[3];
      var building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, width),
        standard(index % 3 === 0 ? 0x385958 : 0x27494b, 0x102d31, 0.8)
      );
      building.position.set(x, height / 2, z);
      world.root.add(building);
      var windowMaterial = standard(0x83c9a1, 0x4abf8c, 1.6);
      for (var row = 0; row < Math.max(2, Math.floor(height / 0.52)); row++) {
        for (var col = 0; col < 2; col++) {
          var window = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.18, 0.035), windowMaterial.clone());
          window.position.set(x + (col ? 0.29 : -0.29), 0.35 + row * 0.42, z + width / 2 + 0.021);
          world.root.add(window);
          world.windows.push(window.material);
        }
      }
      var node = new THREE.Vector3(x * 0.73, 0.14, z * 0.73);
      points.push(new THREE.Vector3(node.x, 0.22, node.z));
      var pin = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), standard(0xccee89, 0x9def6c, 2.6));
      pin.position.copy(node);
      world.root.add(pin);
    });

    var route = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, 0.28, 1), new THREE.Vector3(-5.5, 0.32, -0.7),
      new THREE.Vector3(-2.8, 0.35, 1), new THREE.Vector3(0, 0.38, 0),
      new THREE.Vector3(3.0, 0.32, -1), new THREE.Vector3(5.4, 0.34, 1.4),
      new THREE.Vector3(8, 0.28, 0.2)
    ]);
    world.route = route;
    world.root.add(new THREE.Mesh(new THREE.TubeGeometry(route, 56, 0.045, 5, false), standard(0x4a8274, 0x1d574f, 1.0)));
    for (var i = 0; i < 5; i++) {
      var pulse = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), standard(0xd7ff98, 0x8df57b, 3.0));
      world.root.add(pulse);
      world.pulses.push(pulse);
    }
    for (var n = 0; n < 4; n++) {
      var signal = new THREE.Mesh(new THREE.TorusGeometry(0.55 + n * 0.19, 0.025, 5, 36), standard(0x7fe6c4, 0x30cfa9, 1.4));
      signal.rotation.x = Math.PI / 2;
      signal.position.y = 2.32;
      world.root.add(signal);
      (world.signalRings || (world.signalRings = [])).push(signal);
    }
    world.core.rotation.set(0.2, 0.1, 0.15);
  }

  function buildTrace(world) {
    var routePoints = [];
    for (var i = 0; i < 8; i++) {
      var x = -7 + i * 2;
      var z = Math.sin(i * 0.83) * 1.45;
      routePoints.push(new THREE.Vector3(x, 0.26, z));
    }
    var curve = new THREE.CatmullRomCurve3(routePoints);
    world.traceRoute = curve;
    world.root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.055, 6, false), standard(0x468077, 0x17685c, 1.3)));
    routePoints.forEach(function (position, index) {
      var platform = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.2, 8), standard(0x213f41, 0x133936, 0.6));
      platform.position.set(position.x, 0.04, position.z);
      world.root.add(platform);
      var post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.85 + (index % 3) * 0.18, 6), standard(0x315c55, 0x164c45, 1.0));
      post.position.set(position.x, 0.54 + (index % 3) * 0.09, position.z);
      world.root.add(post);
      var material = standard(index === 5 || index === 7 ? 0x9beab0 : 0x8ed9c4, 0x33ad91, 1.6);
      var orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), material);
      orb.position.set(position.x, 1.15 + (index % 3) * 0.18, position.z);
      world.root.add(orb);
      var halo = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.035, 6, 28), standard(0x5dc8aa, 0x237f68, 1.1));
      halo.position.copy(orb.position);
      halo.rotation.x = Math.PI / 2;
      world.root.add(halo);
      world.traceNodes.push({ orb: orb, material: material, halo: halo, point: position });
    });
    var pulse = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), standard(0xd7ff98, 0x9ef676, 3.5));
    world.root.add(pulse);
    world.tracePulse = pulse;
    var consolePod = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.55, 1.0), standard(0x234847, 0x0e5b50, 1.2));
    consolePod.position.set(7.6, 0.8, 3.2);
    world.root.add(consolePod);
    var consoleLight = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 10), standard(0xd7ff98, 0x9ef676, 2.5));
    consoleLight.position.set(7.6, 1.85, 3.2);
    world.root.add(consoleLight);
    world.consoleLight = consoleLight;
  }

  function buildMarket(world) {
    world.scene.fog = new THREE.Fog(0x160f22, 15, 38);
    world.scene.add(new THREE.HemisphereLight(0xf6d5f0, 0x25152a, 1.3));
    var goldLight = new THREE.PointLight(0xffbc60, 48, 20);
    goldLight.position.set(-5, 5, 1);
    world.scene.add(goldLight);
    var pinkLight = new THREE.PointLight(0xd96bd4, 35, 22);
    pinkLight.position.set(5, 4, -3);
    world.scene.add(pinkLight);
    world.marketCoins = [];
    world.marketLanterns = [];
    world.marketStalls = [];

    function box(width, height, depth, color, x, y, z, emissive, power) {
      var mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), standard(color, emissive || 0x000000, power || 0, 0.72));
      mesh.position.set(x, y, z);
      world.root.add(mesh);
      return mesh;
    }
    function rod(x1, y1, z1, x2, y2, z2, radius, color) {
      var start = new THREE.Vector3(x1, y1, z1), end = new THREE.Vector3(x2, y2, z2);
      var delta = new THREE.Vector3().subVectors(end, start);
      var mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 7), standard(color, color, 0.55, 0.5));
      mesh.position.copy(start).add(end).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
      world.root.add(mesh);
      return mesh;
    }
    var stalls = [
      { x: -5.2, main: 0x9c426a, trim: 0xf2bd62, light: 0xff9a78 },
      { x: 0, main: 0x267b78, trim: 0xedd07d, light: 0x65e1bd },
      { x: 5.2, main: 0x754ba0, trim: 0xffa965, light: 0xd497ff }
    ];
    stalls.forEach(function (stall, index) {
      var x = stall.x, z = -1.15;
      box(3.05, 1.45, 1.7, 0x302239, x, 0.79, z, 0x170d21, 0.4);
      box(3.25, 0.22, 2.05, stall.trim, x, 1.55, 0.08, stall.trim, 0.3);
      box(3.2, 0.2, 2.14, stall.main, x, 2.69, -0.05, stall.main, 0.8);
      for (var stripe = 0; stripe < 8; stripe++) {
        var sx = x - 1.4 + stripe * 0.4;
        box(0.39, 0.035, 2.08, stripe % 2 ? stall.trim : stall.main, sx, 2.81, -0.05, stripe % 2 ? stall.trim : stall.main, 0.8);
      }
      [-1.38, 1.38].forEach(function (side) {
        [-0.88, 0.88].forEach(function (front) {
          box(0.09, 1.23, 0.09, stall.trim, x + side, 2.02, front - 0.05, stall.trim, 0.45);
        });
      });
      box(1.45, 0.47, 0.1, 0x211628, x, 2.13, 1.01, stall.light, 1.1);
      box(0.14, 0.06, 0.11, stall.trim, x - 0.42, 2.12, 1.08, stall.trim, 1.3);
      box(0.14, 0.06, 0.11, stall.trim, x + 0.42, 2.12, 1.08, stall.trim, 1.3);
      var display = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), standard(stall.trim, stall.light, 1.25, 0.34));
      display.position.set(x, 1.91, 0.63);
      world.root.add(display);
      display.rotation.set(0.22, 0.2, 0.12);
      world.marketStalls.push({ display: display, light: stall.light });

      for (var stack = 0; stack < 5; stack++) {
        var coin = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.065, 10), standard(stall.trim, 0x8e5f1c, 0.6, 0.35));
        coin.position.set(x - 0.82 + (stack % 3) * 0.53, 1.72 + (stack > 2 ? 0.08 : 0), 0.5 + Math.floor(stack / 3) * 0.31);
        world.root.add(coin);
        world.marketCoins.push({ mesh: coin, baseY: coin.position.y, phase: index * 0.7 + stack * 0.8 });
      }
      for (var crate = 0; crate < 2; crate++) {
        var crateMesh = box(0.62, 0.55, 0.62, crate ? 0x5f3e52 : 0x7c5944, x + (crate ? 1.28 : -1.27), 0.31, 1.92, 0x241624, 0.15);
        box(0.67, 0.08, 0.67, stall.trim, crateMesh.position.x, 0.55, 1.92, stall.trim, 0.25);
      }
      var lantern = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 7), standard(stall.light, stall.light, 1.65, 0.32));
      lantern.position.set(x, 3.28, 0.34);
      world.root.add(lantern);
      world.marketLanterns.push({ mesh: lantern, baseY: lantern.position.y, phase: index * 1.4, material: lantern.material });
    });

    // A lit entry arch and a tiled walking lane make this a separate, readable game world.
    var arch = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.12, 8, 28, Math.PI), standard(0xffd778, 0xfaad54, 1.7, 0.38));
    arch.position.set(0, 1.85, 3.15);
    arch.rotation.z = Math.PI;
    world.root.add(arch);
    for (var tile = -5; tile <= 5; tile++) {
      var paving = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.025, 0.72), standard(tile % 2 ? 0x37263a : 0x433044, 0x25182c, 0.2, 0.8));
      paving.position.set(tile * 0.76, 0.01, 4.45);
      world.root.add(paving);
    }
    for (var lamp = 0; lamp < 9; lamp++) {
      var lx = -7 + lamp * 1.75, ly = 4.3 + Math.sin(lamp * 1.6) * 0.5, lz = -4.1 - Math.cos(lamp * 0.8) * 0.6;
      if (lamp < 8) rod(lx, ly + 0.5, lz, lx + 1.75, ly + 0.1, lz + 0.25, 0.018, 0x8c698f);
      var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), standard(lamp % 2 ? 0xffb95e : 0xf3a8cc, lamp % 2 ? 0xffb95e : 0xf3a8cc, 2.2, 0.3));
      bulb.position.set(lx, ly, lz);
      world.root.add(bulb);
      world.marketLanterns.push({ mesh: bulb, baseY: ly, phase: lamp * 0.53, material: bulb.material });
    }
    for (var spark = 0; spark < 10; spark++) {
      var glint = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), standard(0xf9dc97, 0xf7b75a, 2.5, 0.25));
      glint.position.set(-6.5 + (spark * 1.37) % 13, 0.4 + (spark % 4) * 0.36, 2.7 - (spark % 3) * 1.2);
      world.root.add(glint);
      world.marketCoins.push({ mesh: glint, baseY: glint.position.y, phase: spark * 0.6, tiny: true });
    }
  }

  function addPointerControls(world) {
    var canvas = world.stage.querySelector('canvas');
    canvas.tabIndex = 0;
    canvas.removeAttribute('aria-hidden');
    updateCanvasLabel(world);
    canvas.addEventListener('pointerdown', function (event) {
      world.drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', function (event) {
      if (!world.drag || world.drag.id !== event.pointerId) return;
      var dx = event.clientX - world.drag.x;
      var dy = event.clientY - world.drag.y;
      world.drag.x = event.clientX;
      world.drag.y = event.clientY;
      if (Math.abs(dx) > Math.abs(dy)) world.root.rotation.y += dx * 0.007;
      else world.camera.position.y = THREE.MathUtils.clamp(world.camera.position.y - dy * 0.035, 5.5, 13);
      world.camera.lookAt(0, 0, 0);
      drawOnce(world);
    });
    canvas.addEventListener('pointerup', function () { world.drag = null; });
    canvas.addEventListener('pointercancel', function () { world.drag = null; });
    canvas.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        world.root.rotation.y += event.key === 'ArrowLeft' ? -0.12 : 0.12;
        event.preventDefault();
        drawOnce(world);
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        world.camera.position.y = THREE.MathUtils.clamp(world.camera.position.y + (event.key === 'ArrowUp' ? 0.55 : -0.55), 5.5, 13);
        world.camera.lookAt(0, 0, 0);
        event.preventDefault();
        drawOnce(world);
      }
    });
  }

  function updateCanvasLabel(world) {
    var canvas = world.stage.querySelector('canvas');
    if (!canvas) return;
    var label = world.type === 'market' && document.documentElement.lang === 'zh-Hant' ? '3D 霓虹夜市。水平拖曳旋轉；聚焦後可使用方向鍵。' : world.type === 'market' ? 'Three-dimensional neon night market. Drag horizontally to rotate; use arrow keys while focused.' : 'Three-dimensional game scene. Drag horizontally to rotate; use arrow keys while focused.';
    if (canvas.getAttribute('role') !== 'img') canvas.setAttribute('role', 'img');
    if (canvas.getAttribute('aria-label') !== label) canvas.setAttribute('aria-label', label);
  }

  function resizeWorld(world) {
    var rect = world.stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    world.renderer.setSize(rect.width, rect.height, false);
    world.camera.aspect = rect.width / rect.height;
    world.camera.updateProjectionMatrix();
    drawOnce(world);
  }

  function updateGrid(world) {
    if (!world.coreMaterial) return;
    var balance = Math.max(0, Number(world.values.balance) || 0);
    world.coreMaterial.emissiveIntensity = Math.min(3.8, 1.0 + balance / 35);
    world.coreMaterial.emissive.setHex(world.attempt < 0 && performance.now() < world.pulseUntil ? 0xff695e : 0x94f271);
    world.windows.forEach(function (material, index) {
      var lit = world.restored || balance >= 70 || (balance >= 50 && index % 2 === 0);
      material.emissiveIntensity = lit ? (world.restored ? 2.4 : 1.5) : 0.35;
      material.color.setHex(lit ? 0x9de8b1 : 0x49695f);
    });
  }

  function syncWorld(world) {
    var shouldRun = world.visible && !document.hidden && !isReduced();
    world.reduced = isReduced();
    if (shouldRun && !world.raf) animateWorld(world);
    if (!shouldRun && world.raf) {
      cancelAnimationFrame(world.raf);
      world.raf = 0;
      drawOnce(world);
    }
  }

  function animateWorld(world) {
    if (!world.stage.isConnected || document.hidden || !world.visible || isReduced()) {
      world.raf = 0;
      return;
    }
    var now = performance.now();
    var seconds = (now - world.startTime) / 1000;
    world.root.rotation.y += 0.00028;
    if (world.type === 'grid') animateGrid(world, seconds, now);
    else if (world.type === 'market') animateMarket(world, seconds, now);
    else animateTrace(world, seconds, now);
    world.renderer.render(world.scene, world.camera);
    world.raf = requestAnimationFrame(function () { animateWorld(world); });
  }

  function animateGrid(world, seconds, now) {
    world.coreMaterial.emissive.setHex(world.attempt < 0 && now < world.pulseUntil ? 0xff695e : 0x94f271);
    world.core.rotation.y += 0.004;
    world.core.rotation.x += 0.001;
    world.ring.rotation.z -= 0.002;
    (world.signalRings || []).forEach(function (ring, index) {
      ring.scale.setScalar(0.78 + ((seconds * 0.42 + index * 0.24) % 1) * 0.55);
      ring.material.opacity = 0.34 + ((seconds * 0.42 + index * 0.24) % 1) * 0.55;
      ring.material.transparent = true;
    });
    world.pulses.forEach(function (pulse, index) {
      var speed = world.restored ? 0.14 : 0.055;
      var t = (seconds * speed + index / world.pulses.length) % 1;
      pulse.position.copy(world.route.getPointAt(t));
    });
    if (now < world.pulseUntil) {
      var ratio = 1 - (world.pulseUntil - now) / 1900;
      world.core.scale.setScalar(1 + Math.sin(ratio * Math.PI * 5) * (world.attempt < 0 ? 0.07 : 0.1));
    } else {
      world.core.scale.setScalar(1);
    }
  }

  function animateTrace(world, seconds, now) {
    world.traceNodes.forEach(function (node, index) {
      var active = world.activeStep > 0 && index === world.activeStep - 1;
      node.orb.rotation.y += active ? 0.025 : 0.004;
      node.material.emissiveIntensity = active ? 3.5 : index < world.activeStep ? 1.8 : 0.7;
      node.halo.scale.setScalar(active ? 1.2 + Math.sin(seconds * 5) * 0.1 : 1);
      node.halo.material.color.setHex(active ? 0xccee89 : 0x5dc8aa);
    });
    if (world.activeStep > 0 && world.activeStep <= world.traceNodes.length && now < world.pulseUntil) {
      var t = Math.min(1, (800 - (world.pulseUntil - now)) / 800);
      world.tracePulse.position.copy(world.traceRoute.getPointAt(Math.max(0, Math.min(1, (world.activeStep - 1 + t) / world.traceNodes.length))));
    } else {
      var idle = (seconds * 0.035) % 1;
      world.tracePulse.position.copy(world.traceRoute.getPointAt(idle));
    }
    if (world.consoleLight) world.consoleLight.material.emissiveIntensity = world.frame && world.frame.output ? 3.8 : 0.7;
  }

  function animateMarket(world, seconds, now) {
    world.marketCoins.forEach(function (coin) {
      coin.mesh.rotation.y += coin.tiny ? 0.025 : 0.018;
      coin.mesh.position.y = coin.baseY + Math.sin(seconds * 1.8 + coin.phase) * (coin.tiny ? 0.08 : 0.045);
      if (coin.tiny) coin.mesh.rotation.x += 0.012;
    });
    world.marketLanterns.forEach(function (lantern, index) {
      lantern.mesh.position.y = lantern.baseY + Math.sin(seconds * 1.25 + lantern.phase) * 0.08;
      var pulse = now < world.pulseUntil ? 1 : 0;
      lantern.material.emissiveIntensity = 1.2 + Math.sin(seconds * 2 + index) * 0.28 + pulse * 1.5;
    });
    world.marketStalls.forEach(function (stall, index) {
      stall.display.rotation.y += 0.008 + index * 0.001;
      stall.display.scale.setScalar(now < world.pulseUntil ? 1.12 : 1);
    });
  }

  function drawOnce(world) {
    if (!world || !world.stage.isConnected) return;
    world.renderer.render(world.scene, world.camera);
  }

  if ('IntersectionObserver' in window) {
    var visibility = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var world = mounts.get(entry.target);
        if (!world) return;
        world.visible = entry.isIntersecting;
        syncWorld(world);
      });
    }, { threshold: 0.05 });
    var originalMountAll = mountAll;
    mountAll = function () {
      originalMountAll();
      mounts.forEach(function (world, stage) { visibility.observe(stage); });
    };
  }

  load();
})();
