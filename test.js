import fs from "fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
// const pixelmatch = require("pixelmatch");
//
// const img1 = PNG.sync.read(fs.readFileSync("img1.png"));
// const img2 = PNG.sync.read(fs.readFileSync("img2.png"));
// const { width, height } = img1;
// const diff = new PNG({ width, height });
//
// pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
//
// fs.writeFileSync("diff.png", PNG.sync.write(diff));

import NodeWebcam from "node-webcam";
import Jimp from "jimp";

//Default options

const width = 1280,
  height = 720;
var opts = {
  width,
  height,
  quality: 50,
  frames: 1,
  delay: 0,
  output: "png",
  device: false,
  callbackReturn: "buffer",
  verbose: false,
};

var Webcam = NodeWebcam.create(opts);

const capt = async () => {
  let arr = [];
  for (let i = 0; i < 2; i++) {
    let j = await new Promise((res, rej) => {
      Webcam.capture("", function(err, data) {
        if (err) rej(err);
        res(data);
      });
    });
    arr.push(j);
  }

  const jimage1 = await Jimp.read(arr[0]);
  const jimage2 = await Jimp.read(arr[1]);
  const w = jimage1.bitmap.width;
  const h = jimage1.bitmap.height;
  const diff = new PNG({ width, height });
  pixelmatch(jimage1.bitmap.data, jimage2.bitmap.data, diff.data, w, h, {
    threshold: 0.2,
  });
  fs.writeFileSync("diff.png", PNG.sync.write(diff));
};

capt();
