import midi from "midi";

export const output = new midi.Output();

export async function keepOpen() {
  output.openVirtualPort("tessst");
  while (true) {
    await new Promise((res) => {
      setInterval(res, 1000);
    });
    output.sendMessage([144, 60, 127]);
  }
}
