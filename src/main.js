import { keepOpen, output } from "./midi.js";

keepOpen();
setInterval(() => output.closePort(), 10000);
