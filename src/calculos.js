function convoluteArray(arr, kernel) {
  kernel = kernel.flat();
  const kernelSize = kernel.length;
  const halfKernel = Math.floor(kernelSize / 2);

  return arr.reduce((result, _, index, array) => {
    if (index < halfKernel || index >= array.length - halfKernel) {
      result.push(array[index]);
    } else {
      let sum = 0;
      for (let i = 0; i < kernelSize; i++) {
        const val = array[index + i - halfKernel] * kernel[i];
        sum += val;
      }
      result.push(sum);
    }
    return result;
  }, []);
}

/*
  
  array [
  r1, g1, b1, a1,
  r2, g2, b2, a2,
  r3, g3, b3, a3,
  r4, g4, b4, a4,
  r5, g5, b5, a5,
  ]

  un pixel = 4 indices
  un bloque = bloque_w (5) * bloque_h (5) pixeles
  
  un bloque_i = 

*/

const pixelate = (pixelArray) => {
  // const kernel = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
  // return convoluteArray(imageData, kernel);
  let newPixelArray = [];
  for (
    let i = 0;
    i < pixelArray.length;
    i += (pixelArray.length / EXP_PIXEL_SIZE) * 4
  ) {
    // para cada BLOQUE
    let r,
      g,
      b = 0;
    for (let j = 0; j < EXP_PIXEL_SIZE; j++) {
      let index = i + j;
      // console.log(
      //   pixelArray[index],
      //   pixelArray[index + 1],
      //   pixelArray[index + 2]
      // );
      r += pixelArray[index] || 0;
      g += pixelArray[index + 1] || 0;
      b += pixelArray[index + 2] || 0;
    }

    r = r / EXP_PIXEL_SIZE;
    g = g / EXP_PIXEL_SIZE;
    b = b / EXP_PIXEL_SIZE;

    newPixelArray[i] = r;
    newPixelArray[i + 1] = g;
    newPixelArray[i + 2] = b;
    newPixelArray[i + 3] = 255;
  }
  return newPixelArray;
};
// const calculateShit = async (prevImageData, currImageData) => {
//   const newPixelArray = pixelate(prevImageData.data);
//   console.log(newPixelArray);
// };

const grayscale = () => {
  let imgData = hiddenCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);
  // const kernel = [1, 0, -1];
  // const newData = convoluteArray(imgData.data, kernel);
  // imgData.data.set(newData);
  for (var i = 0; i < imgData.data.length; i += 4) {
    let lightness =
      parseInt(
        (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3
      ) < 125
        ? 255
        : 0;

    imgData.data[i] = lightness;
    imgData.data[i + 1] = lightness;
    imgData.data[i + 2] = lightness;
  }

  hiddenCtx.putImageData(imgData, 0, 0);
};

const comparisonCanvas = document.createElement("canvas");
const comparisonCtx = comparisonCanvas.getContext("2d");
comparisonCanvas.width = CANVAS_W;
comparisonCanvas.height = CANVAS_H;

const compareFrames = (lastFrame, currentFrame) => {
  const diffImg = comparisonCtx.createImageData(CANVAS_W, CANVAS_H);
  pixelmatch(
    lastFrame.data,
    currentFrame.data,
    diffImg.data,
    CANVAS_W,
    CANVAS_H,
    {
      threshold: 0.3,
    }
  );
  return diffImg;
};
