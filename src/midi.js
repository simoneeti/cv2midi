// PORT_ID = "67251C5E9DAA05CEF52E5E3BF05BFD53352238886C25F0FE46F40A0E28FC6A2D";
const PORT_ID =
  "6FF5590044F4859ED50C5167BCFE9700A1798E39AA55A628E86D39011FAECD5D";
const SUSTAIN = true;

function noteToMIDICode(name) {
  var name_to_pc = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };
  var letter = name[0];
  var pc = name_to_pc[letter.toUpperCase()];

  var mod_to_trans = { b: -1, "#": 1 };
  var mod = name[1];
  var trans = mod_to_trans[mod] || 0;

  pc += trans;

  var octave = parseInt(Array.from(name).pop());
  if (octave) {
    return pc + 12 * (octave + 1);
  } else {
    // negative mod 12
    return ((pc % 12) + 12) % 12;
  }

  return pc;
}

// midi init

let midi = null; // global MIDIAccess object
let midiDevice = null;

navigator.requestMIDIAccess().then((midiAccess) => {
  console.log("MIDI ready");
  midi = midiAccess;
  midiDevice = midiAccess.outputs.get(PORT_ID);
});

const scales = {
  e: {
    // minorBlues: ["E3", "G3", "A3", "A#3", "B3", "D4"],
    dorianMode: [
      "E3",
      "F#3",
      "G3",
      "A3",
      "B3",
      "C#4",
      "D4",
      "E4",
      "F#4",
      "G4",
      "A4",
      "B4",
      "C#4",
      "D4",
    ],
    // naturalMinor: ["E3", "F#3", "G3", "A3", "B3", "C4", "D4"],
    // majorPentatonic: ["E3", "F#3", "G#3", "B3", "C#4"],
  },
  a: {
    // minorPentatonic: ["A3", "C4", "D4", "E4", "G4"],
    dorianMode: ["A3", "B3", "C4", "D4", "E4", "F#4", "G4"],
    // naturalMinor: ["A3", "B3", "C4", "D4", "E4", "F4", "G4"],
    // majorPentatonic: ["A3", "B3", "C#4", "E4", "F#4"],
  },
};

const notes = new Array(CANVAS_W * CANVAS_H)
  .fill(true)
  .map(
    () =>
      scales.e.dorianMode[
      Math.floor(Math.random() * scales.e.dorianMode.length)
      ]
  );
const STEP_MS = 1000 / 16;
const TICK_MIDI_MS = CANVAS_W * CANVAS_H * STEP_MS;

const midiLogic = async (boolArray) => {
  // en realidad playing deberia ser el parámetro con el que se llama midiLogic
  const playing = boolArray.map((e, i) => (e ? notes[i] : 0));

  for (let i = 0; i < playing.length; i++) {
    await new Promise((res) => setInterval(res, STEP_MS));
    if (playing[i]) console.log(noteToMIDICode(playing[i]));
  }
};

const midiRealtimeLogic = async () => {
  let lastNote = 0;

  for (let i = 0; i < CANVAS_W * CANVAS_H; i++) {
    await new Promise((res) => setInterval(res, STEP_MS));
    const x = i % CANVAS_W,
      y = Math.floor(i / CANVAS_W);
    const d = hiddenCtx.getImageData(x, y, 1, 1).data[0];

    if (d) {
      if (!midiDevice) console.log("no anda el midi device");
      const note = noteToMIDICode(notes[i]);

      const messageOn = [0x90, note, 0x7f];
      const messageOff = [0x80, note, 0x7f];

      midiDevice.send(messageOn);

      if (!SUSTAIN) {
        setTimeout(() => {
          midiDevice.send(messageOff);
        }, STEP_MS);
      } else {
        midiDevice.send([0x80, lastNote, 0x7f]);
        lastNote = note;
      }
    }
  }
};
