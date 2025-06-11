const { Piano, MidiNumbers } = ReactPiano;
const { useState, useEffect, useRef } = React;

const LESSONS = [
  {
    title: "Skala C-dur",
    notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  },
  {
    title: "Akord C-dur",
    notes: ["C4", "E4", "G4"],
  },
  {
    title: "Oda do radości (początek)",
    notes: [
      "E4",
      "E4",
      "F4",
      "G4",
      "G4",
      "F4",
      "E4",
      "D4",
      "C4",
      "C4",
      "D4",
      "E4",
      "E4",
      "D4",
      "D4",
    ],
  },
];

const LESSONS_MIDI = LESSONS.map((l) => ({
  title: l.title,
  notes: l.notes.map((n) => Tone.Frequency(n).toMidi()),
}));

const audioContext = new Tone.Context();
Tone.setContext(audioContext);

const sampler = new Tone.Sampler({
  urls: {
    C4: "C4.mp3",
    D#4: "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

const metroSynth = new Tone.MembraneSynth().toDestination();
let metroEvent = null;
let currentBpm = 60;

function playNote(midiNumber) {
  const freq = Tone.Frequency(midiNumber, "midi").toFrequency();
  sampler.triggerAttackRelease(freq, "8n");
}

function freqToMidi(freq) {
  return Math.round(12 * (Math.log2(freq / 440)) + 69);
}

function toggleMetronome() {
  if (metroEvent) {
    Tone.Transport.clear(metroEvent);
    metroEvent = null;
    Tone.Transport.stop();
  } else {
    metroEvent = Tone.Transport.scheduleRepeat((time) => {
      metroSynth.triggerAttackRelease("C2", "8n", time);
    }, "4n");
    Tone.Transport.bpm.value = currentBpm;
    Tone.Transport.start();
  }
}

function App() {
  const firstNote = MidiNumbers.fromNote("c4");
  const lastNote = MidiNumbers.fromNote("c5");
  const [lessonIdx, setLessonIdx] = useState(0);
  const [noteIdx, setNoteIdx] = useState(0);
  const [detectedMidi, setDetectedMidi] = useState(null);
  const [completed, setCompleted] = useState(() => {
    const obj = {};
    LESSONS_MIDI.forEach((_, i) => {
      obj[i] = localStorage.getItem("lesson-complete-" + i) === "1";
    });
    return obj;
  });
  const micRef = useRef(null);

  const currentLesson = LESSONS_MIDI[lessonIdx];
  const expectedMidi = currentLesson.notes[noteIdx];

  function handlePlay(midi) {
    playNote(midi);
    if (midi === expectedMidi) {
      if (noteIdx + 1 < currentLesson.notes.length) {
        setNoteIdx(noteIdx + 1);
      }
    }
  }

  function startMic() {
    if (micRef.current) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    micRef.current = ctx;
    const analyser = ctx.createAnalyser();
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      const detector = Pitchy.createPitchDetector(ctx.sampleRate);
      const input = new Float32Array(detector.inputLength);
      function update() {
        analyser.getFloatTimeDomainData(input);
        const [pitch, clarity] = detector.findPitch(input);
        if (clarity > 0.98) {
          setDetectedMidi(freqToMidi(pitch));
        }
        requestAnimationFrame(update);
      }
      update();
    });
  }

  useEffect(() => {
    const btn = document.getElementById("mic-btn");
    btn.addEventListener("click", startMic);
    const metroBtn = document.getElementById("metro-btn");
    metroBtn.addEventListener("click", toggleMetronome);
    const bpmSlider = document.getElementById("bpm-slider");
    const bpmVal = document.getElementById("bpm-val");
    bpmSlider.addEventListener("input", (e) => {
      currentBpm = parseInt(e.target.value);
      bpmVal.textContent = currentBpm;
      Tone.Transport.bpm.value = currentBpm;
    });
  }, []);

  useEffect(() => {
    const info = document.getElementById("pitch-info");
    if (detectedMidi != null) {
      const note = Tone.Frequency(detectedMidi, "midi").toNote();
      if (detectedMidi === expectedMidi) {
        info.textContent = `Brawo! Zagrałeś ${note}`;
        info.style.color = "green";
        if (noteIdx + 1 < currentLesson.notes.length) {
          setNoteIdx(noteIdx + 1);
        }
      } else {
        info.textContent = `Wykryto: ${note}`;
        info.style.color = "red";
      }
    }
  }, [detectedMidi]);

  useEffect(() => {
    if (noteIdx >= currentLesson.notes.length) {
      setCompleted((prev) => {
        const next = { ...prev, [lessonIdx]: true };
        localStorage.setItem("lesson-complete-" + lessonIdx, "1");
        return next;
      });
    }
  }, [noteIdx]);

  const noteName =
    expectedMidi !== undefined
      ? Tone.Frequency(expectedMidi, "midi").toNote()
      : "Koniec lekcji";

  return (
    <div>
      <div>
        <label>
          Lekcja:
          <select
            value={lessonIdx}
            onChange={(e) => {
              setLessonIdx(parseInt(e.target.value));
              setNoteIdx(0);
            }}
          >
            {LESSONS_MIDI.map((l, i) => (
              <option key={i} value={i}>
                {completed[i] ? "\u2713 " : ""}
                {l.title}
              </option>
            ))}
          </select>
          <button onClick={() => setNoteIdx(0)}>Restart</button>
        </label>
      </div>
      <p>Zagraj dźwięk: {noteName}</p>
      <Piano
        noteRange={{ first: firstNote, last: lastNote }}
        playNote={handlePlay}
        stopNote={() => {}}
        width={600}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
