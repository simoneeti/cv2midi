const EXP_PIXEL_SIZE = 10;
const CANVAS_W = Math.floor(EXP_PIXEL_SIZE * 2),
  CANVAS_H = Math.floor(EXP_PIXEL_SIZE * 1.25),
  FULL_CANVAS_W = CANVAS_W * 50,
  FULL_CANVAS_H = CANVAS_H * 50;

const canvas = document.getElementById("cacanvas");
const ctx = canvas.getContext("2d");
const hiddenCanvas = Object.assign(document.createElement("canvas"), {
  display: "none",
});
const hiddenCtx = hiddenCanvas.getContext("2d");

// turn off image aliasing
hiddenCtx.msImageSmoothingEnabled = false;
hiddenCtx.mozImageSmoothingEnabled = false;
hiddenCtx.webkitImageSmoothingEnabled = false;
hiddenCtx.imageSmoothingEnabled = false;
hiddenCtx.willReadFrequently = true;
ctx.willReadFrequently = true;

var video = document.querySelector("#videoElement");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
    video.srcObject = stream;
  });
}

video.addEventListener("loadedmetadata", function() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
});

const main = async (e) => {
  let frameStartTime = Date.now();
  hiddenCtx.drawImage(e.target, 0, 0, CANVAS_W, CANVAS_H);
  grayscale();
  midiRealtimeLogic();

  while (true) {
    await new Promise((res) => setInterval(res, 1000 / 15));

    hiddenCtx.drawImage(e.target, 0, 0, CANVAS_W, CANVAS_H);

    grayscale();

    ctx.drawImage(hiddenCanvas, 0, 0, FULL_CANVAS_W, FULL_CANVAS_H);

    let currentTime = Date.now();
    if (currentTime - frameStartTime >= TICK_MIDI_MS) {
      console.log("tick!");
      frameStartTime = currentTime;

      // método "cada tick, recorrer el grid de video en tiempo real"

      midiRealtimeLogic();

      // método "cada tick, sacar foto y tocar notas de la foto"
      //   const imgData = hiddenCtx.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
      //
      //   let boolArray = [];
      //   for (let i = 0; i < imgData.length; i += 4) {
      //     boolArray.push(imgData[i]);
      //   }
      //   midiLogic(boolArray);
    }
  }
};

video.addEventListener("play", main);
