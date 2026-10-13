import { visual } from "@/config/visual";

// Zumbido da máquina, com o grafo do protótipo: dente-de-serra e quadrada num
// passa-banda, mais ruído num passa-alta. Desligado por padrão; o áudio só é
// criado no clique do botão de som (os navegadores exigem um gesto).

let context: AudioContext | null = null;
let master: GainNode | null = null;
let buzzing = false;

function build() {
  const config = visual.sound;
  context = new AudioContext();
  master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const band = context.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = config.bandpass.frequency;
  band.Q.value = config.bandpass.q;
  band.connect(master);

  const saw = context.createOscillator();
  saw.type = "sawtooth";
  saw.frequency.value = config.saw;
  saw.connect(band);
  saw.start();

  const square = context.createOscillator();
  const squareGain = context.createGain();
  square.type = "square";
  square.frequency.value = config.square.frequency;
  squareGain.gain.value = config.square.gain;
  square.connect(squareGain).connect(band);
  square.start();

  const noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const samples = noiseBuffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const high = context.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = config.noise.highpass;
  const noiseGain = context.createGain();
  noiseGain.gain.value = config.noise.gain;
  noise.connect(high).connect(noiseGain).connect(master);
  noise.start();
}

/** Chamar dentro do clique que liga o som. */
export function enableSound() {
  if (!context) build();
  void context?.resume();
}

/** Liga ou desliga o zumbido (só tem efeito depois de enableSound). */
export function setBuzz(on: boolean) {
  if (!context || !master || on === buzzing) return;
  buzzing = on;
  const { volume, attack, release } = visual.sound;
  master.gain.setTargetAtTime(on ? volume : 0, context.currentTime, on ? attack : release);
}
