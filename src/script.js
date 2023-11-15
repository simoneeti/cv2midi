const PROXIMITY_THRESHOLD = 100;
const SCALE_FACTOR = 3;
const MAX_RECTS = 10;
const FPS = 30;
const COMPARE_TRESHOLD = 0.25;
const MIDI_PS = 15;

const EXP_PIXEL_SIZE = 30;

const diffCanvas = document.getElementById("cacanvas");
const diffContext = diffCanvas.getContext("2d");

// turn off image aliasing
diffContext.msImageSmoothingEnabled = false;
diffContext.mozImageSmoothingEnabled = false;
diffContext.webkitImageSmoothingEnabled = false;
diffContext.imageSmoothingEnabled = false;

const helpers = {
  isClose: (pix1, pix2) => {
    return (
      Math.abs(pix1.x - pix2.x) < PROXIMITY_THRESHOLD &&
      Math.abs(pix1.y - pix2.y) < PROXIMITY_THRESHOLD
    );
  },
  compare: (img1, img2, width, height) => {
    diffCanvas.width = width;

    diffCanvas.height = height;
    const diff = diffContext.createImageData(width, height);
    pixelmatch(img1.data, img2.data, diff.data, width, height, {
      threshold: COMPARE_TRESHOLD,
    });
    return diff;
  },
  downscaleImageData: (imageData, scale) => {
    // Calculate the new dimensions
    const scaledWidth = Math.floor(imageData.width / scale);
    const scaledHeight = Math.floor(imageData.height / scale);

    // Create a temporary canvas to draw the downscaled image
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    // Set the scaled dimensions on the canvas
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;

    // Draw the original image data to the scaled canvas
    tempCtx.putImageData(
      imageData,
      0,
      0,
      0,
      0,
      imageData.width,
      imageData.height
    );
    tempCtx.drawImage(
      tempCanvas,
      0,
      0,
      imageData.width,
      imageData.height,
      0,
      0,
      scaledWidth,
      scaledHeight
    );

    // Retrieve the ImageData from the scaled canvas
    const scaledImageData = tempCtx.getImageData(
      0,
      0,
      scaledWidth,
      scaledHeight
    );
    return scaledImageData;
  },

  imageDataFromSource: async (source) => {
    const image = Object.assign(new Image(), { src: source });
    await new Promise((resolve) =>
      image.addEventListener("load", () => resolve())
    );

    const targetWidth = Math.floor(image.width / SCALE_FACTOR),
      targetHeight = Math.floor(image.height / SCALE_FACTOR);

    // Create two canvas elements: one for the downscaled image and one for the final image
    var tempCanvas = document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d");
    var finalCanvas = document.createElement("canvas");
    var finalCtx = finalCanvas.getContext("2d");

    // Set the dimensions of the temporary canvas to the target dimensions
    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;
    //tempCanvas.imageSmoothingEnabled = false;

    // Draw the image to the temporary canvas at the new smaller dimensions
    tempCtx.drawImage(image, 0, 0, targetWidth, targetHeight);

    // Set the dimensions of the final canvas to the original image dimensions
    finalCanvas.width = image.width;
    finalCanvas.height = image.height;
    //finalCanvas.imageSmoothingEnabled = false;

    // Now draw the lower resolution image from the temporary canvas to the final canvas,
    // stretching it to the original image dimensions.
    finalCtx.drawImage(
      tempCanvas,
      0,
      0,
      targetWidth,
      targetHeight,
      0,
      0,
      image.width,
      image.height
    );
    return finalCtx.getImageData(0, 0, image.width, image.height);
  },
};

// video init

var video = document.querySelector("#videoElement");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
    video.srcObject = stream;
  });
}

const getBoundingRects = async (r) => {
  const { width, height } = r[0];

  // get diff as imageData
  const diff = helpers.compare(r[0], r[1], width, height);
  // draw
  diffContext.putImageData(diff, 0, 0);

  // get red pixels
  let redPixels = [];
  for (let i = 0; i < diff.data.length; i += 4) {
    let red = diff.data[i];
    let green = diff.data[i + 1];
    if (!(red > 200 && green < 50)) continue;
    let pixelPos = i / 4;
    let y = Math.floor(pixelPos / diff.width);
    let x = Math.floor(pixelPos % diff.width);
    redPixels.push({ x, y });
  }

  // define groups
  let groups = [[]];
  for (let i = 1; i < redPixels.length; i++) {
    // if (!groups[groups.length - 1].length)
    // groups.find(g=>{
    //  g.some(vec=>helpers.isClose(redPixels[i], vec))
    // })
    if (helpers.isClose(redPixels[i], redPixels[i - 1])) {
      groups[groups.length - 1].push(redPixels[i]);
    } else {
      groups.push([redPixels[i]]);
    }
  }

  groups = groups.filter((e) => e.length > 100);

  // get min and max pixels for each group
  let boundingRects = groups
    .map((e) => {
      let xs = e.map((p) => p.x);
      let ys = e.map((p) => p.y);
      let xMax = Math.max(...xs);
      let yMax = Math.max(...ys);
      let xMin = Math.min(...xs);
      let yMin = Math.min(...ys);
      const size = Math.floor((xMax - xMin) * (yMax - yMin));
      return { xMax, yMax, xMin, yMin, size };
    })
    .sort((a, b) => a.size > b.size);

  if (boundingRects.length >= MAX_RECTS) boundingRects.splice(MAX_RECTS);

  return boundingRects;
};

const loop = async (e) => {
  diffContext.drawImage(e.target, 0, 0);
  let last = diffContext.getImageData(
    0,
    0,
    diffCanvas.width,
    diffCanvas.height
  );

  // game loop
  let loop_count = 0;
  while (true) {
    await new Promise((res) => setInterval(res, 1000 / FPS));
    diffContext.drawImage(e.target, 0, 0);

    curr = diffContext.getImageData(0, 0, diffCanvas.width, diffCanvas.height);
    const s = Date.now();
    const boundingRects = await getBoundingRects([last, curr]);
    const frame = Date.now() - s;

    diffContext.strokeStyle = "blue";
    boundingRects.forEach((box) => {
      diffContext.beginPath();
      diffContext.rect(
        box.xMin,
        box.yMin,
        Math.abs(box.xMax - box.xMin),
        Math.abs(box.yMax - box.yMin)
      );
      diffContext.stroke();
      diffContext.closePath();
    });
    diffContext.font = "20px mono";
    diffContext.fillText(
      `FPS: ${parseInt(1000 / frame).toString()} (lock @ ${FPS})`,
      diffCanvas.width - 250,
      diffCanvas.height - 20
    );
    if (midi && loop_count % Math.floor(FPS / MIDI_PS) == 0)
      sendNotes(boundingRects);
    last = curr;
    loop_count++;
  }
};

video.addEventListener("loadedmetadata", function() {
  diffCanvas.width = video.videoWidth;
  diffCanvas.height = video.videoHeight;
});

video.addEventListener("play", loop);

window.onload = async () => { };
