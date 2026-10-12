// The English text of the site; its shape is the type every other language must match.
const controls = { play: 'Play', pause: 'Pause', reset: 'Reset', next: 'Next step' };

export const en = {
  seo: {
    title: 'Alex Taberoa · Senior Software Engineer (Full-Stack, AI, TypeScript)',
    description:
      'Alex Taberoa is a Senior Software Engineer working remotely from Mexico: full-stack AI product engineering with TypeScript, Python, Node.js, React, PostgreSQL and MCP. Open-source AI agent tools.',
    locale: 'en_US',
  },
  nav: { label: 'Language', other: 'Español' },
  guide: {
    kicker: (n: number, total: number) => `Step ${n} of ${total}`,
    inDrawing: 'In the drawing',
    prev: 'Previous',
    next: 'Next',
    steps: 'Steps',
  },
  hero: {
    name: 'Alex Taberoa',
    title: 'Senior Software Engineer',
    area: 'Full-Stack AI Product Engineering',
    lede: 'I build AI-enabled product systems end to end: agent contracts, backend authorization, review-before-write flows and production observability.',
    roles:
      'Open to Software Engineer, Full Stack, Backend and Integrations roles · Remote from Mexico',
    award: 'Developer of the Year at Outbuild · 2023 & 2024',
  },
  projectsTitle: 'Open-source projects',
  projectsLede: 'Each one is drawn as a working machine. Press play to watch it run.',
  projects: {
    ralph: {
      title: 'Ralph',
      tag: 'Open source · MIT',
      did: 'I built the loop engine: it picks the next unfinished story, runs Codex, Claude, Cursor or Gemini on it, checks the result, and learns guardrails from repeated failures.',
      stack: ['Rust', 'Bash', 'AI agents'],
      link: 'Ralph on GitHub',
    },
    loopforge: {
      title: 'LoopForge',
      tag: 'Open source · Desktop',
      did: 'I designed and built a desktop app that turns any AI coding CLI into a long-running, self-verifying engineer: plan, split into stories, run them in parallel git worktrees, verify, merge.',
      stack: ['Rust', 'Tauri v2', 'Bun', 'TypeScript'],
      link: 'LoopForge on GitHub',
    },
    audio: {
      title: 'Audio Cleaner',
      tag: 'Open source · Web + GPU',
      did: 'I built the web app and the GPU pipeline that cleans voice recordings (DeepFilterNet, Silero VAD and noisereduce) with job progress pushed back over webhooks.',
      stack: ['Next.js', 'Python', 'Modal GPU', 'Drizzle', 'Cloudflare R2'],
      link: 'Audio Cleaner on GitHub',
    },
  },
  ralph: {
    stories: ['Login form', 'Password reset', 'Profile page', 'Email alerts', 'Dark mode'],
    clumsiness: 'Agent clumsiness',
    steps: [
      {
        name: 'Story queue',
        sub: 'prd.json',
        title: 'The stories waiting to be built',
        what: 'Ralph works from a PRD: a list of small user stories, each with its acceptance criteria. It always takes the next one that has not passed yet.',
        map: ['card = one story from the PRD', 'stack in the magazine = stories still pending'],
      },
      {
        name: 'Agent run',
        sub: 'Codex · Claude · Cursor · Gemini',
        title: 'An AI agent builds the story',
        what: 'Ralph writes a prompt with the story, the project rules and every guardrail learned so far, then runs the coding agent in autonomous mode.',
        map: [
          'probe on the card = the agent working on that story',
          'carriage = Ralph moving work between stations',
        ],
      },
      {
        name: 'Verification',
        sub: 'tests decide',
        title: 'Checking the result',
        what: 'After each run the result is checked against its acceptance criteria. If it fails, the same story goes back to the agent: nothing moves on until it passes.',
        map: [
          'needle = how this attempt went',
          'mark on the dial = the bar it has to clear',
          'punched hole = one failed attempt',
        ],
      },
      {
        name: 'Guardrails',
        sub: 'guardrails.md',
        title: 'Learning from repeated failures',
        what: 'When a story fails three times (GUTTER_THRESHOLD = 3), Ralph writes a guardrail: a lesson added to every future prompt so the agent stops repeating the same mistake.',
        map: [
          'tag on the pegboard = one guardrail',
          'the mark on the dial drops = the next try gets easier (illustrative)',
        ],
      },
      {
        name: 'Done',
        sub: 'passes: true',
        title: 'Story done, on to the next',
        what: 'A story that passes is marked done in the PRD and Ralph takes the next one. The loop ends when every story passes, or when it reaches its iteration cap.',
        map: ['card in the tray = a finished story', 'readout = iterations used so far'],
      },
    ],
    doneAll: (it: number) => `Every story passes. ${it} iterations.`,
    capped: (left: string) => `Hit the cap. Still failing: ${left}.`,
    fig: {
      title: 'Ralph · the loop',
      hint: 'Play or step',
      label:
        'An inspection bench. A magazine on the left holds the pending story cards. A carriage on two guide rods takes the bottom card to the test station, where a probe comes down on it. A dial in front shows what the verifier rolled against the failure threshold: past the mark the card passes and slides into the tray on the right; below it a hole is punched in the card and it is tried again. Every third hole hangs a guardrail tag on the pegboard behind, and the mark on the dial drops.',
      keys: {
        lit: 'The story being worked on',
        raised: 'Pending and finished stories',
        dotted: 'Fail zone: rolls below the threshold',
      },
      caption:
        'Ralph picks the next unfinished story, has an agent build it and checks the result. A miss punches a hole and the same card goes back under the probe. On the 3rd hole Ralph writes a guardrail (GUTTER_THRESHOLD = 3), which here halves that story’s failure chance. The run stops when every card is in the tray, or at an illustrative cap of 24 iterations.',
      idle: (pending: number, threshold: number) => `${pending} pending · threshold ${threshold}%`,
      running: (name: string, attempt: number, done: number, total: number) =>
        `${name} · try ${attempt} · ${done}/${total}`,
      say: {
        load: (name: string) => `next story: ${name}`,
        test: 'the agent builds it · the probe checks it',
        roll: (roll: number, threshold: number) => `verifier rolls ${roll} · needs ${threshold}`,
        fail: (holes: number) => `fails · hole ${holes} · try again`,
        guardrail: 'third hole · Ralph writes a guardrail · the bar drops',
        pass: 'passes · into the done tray',
      },
    },
    ...controls,
  },
  loopforge: {
    stories: ['Auth API', 'Login UI', 'DB schema', 'Seed data', 'Reports', 'E2E tests'],
    lanes: (n: number) => (n === 1 ? '1 worktree' : `${n} worktrees`),
    finished: (ticks: number) => `Done in ${ticks} ticks.`,
    steps: [
      {
        name: 'Plan & queue',
        sub: 'stories + dependencies',
        title: 'A goal split into small stories',
        what: 'LoopForge turns a goal into a plan and splits it into small stories. Some depend on others, and those wait until what they need has been merged.',
        map: ['card = one story', 'lock pin = a dependency that has not merged yet'],
      },
      {
        name: 'Worktrees',
        sub: 'one per story',
        title: 'Parallel work, kept apart',
        what: 'Every ready story gets its own git worktree, a separate copy of the code, so several agents can work at the same time without touching each other’s files.',
        map: ['anvil = one git worktree', 'three probes = agents working in parallel'],
      },
      {
        name: 'Verify',
        sub: 'a lamp per failure',
        title: 'Each worktree is checked',
        what: 'After every attempt LoopForge runs the verification. A failure lights a lamp and the story is tried again in the same worktree.',
        map: ['lit lamp = one failure in a row', '1 or 3 worktrees = how much work runs at once'],
      },
      {
        name: 'Merge to main',
        sub: 'fast-forward',
        title: 'Passing work lands in main',
        what: 'A story that passes is fast-forward merged into main and its worktree is removed. Any story that was waiting on it is unlocked.',
        map: ['plinth = the main branch', 'stack on it = merged commits'],
      },
      {
        name: 'Human review',
        sub: '3 failures in a row',
        title: 'Knowing when to stop',
        what: 'After three failures in a row a story is pulled out and flagged for a person instead of burning the loop. Stories that depend on it stay blocked.',
        map: ['bin with a flag = waiting for a person'],
      },
    ],
    fig: {
      title: 'LoopForge · parallel loops',
      hint: 'Play or step',
      label:
        'A bench with three test anvils under one bridge, one per git worktree. A tray on the left holds six story cards; cards whose dependencies have not merged are held by a lock pin. Each tick, ready cards fly to free anvils and the three probes press at once. A pass sends the card to the main plinth on the right; three failures in a row light three lamps and send it to the human review bin, which raises a flag.',
      keys: {
        lit: 'Stories being worked on',
        raised: 'Queued, merged and reviewed stories',
        edge: 'Lock pin: a dependency has not merged yet',
      },
      caption:
        'LoopForge runs the Ralph loop in parallel. A story only leaves the queue when every story it depends on has merged; ready stories each get their own worktree. A pass is fast-forward merged into main; three failures in a row (GUTTER_THRESHOLD = 3) send it to human review instead of burning the loop. Switch to one worktree to see the same work take longer.',
      idle: (ready: number, lanes: number) =>
        `${ready} ready · ${lanes} worktree${lanes === 1 ? '' : 's'}`,
      say: {
        queue: (ready: string, waiting: number) =>
          `ready: ${ready}${waiting ? ` · ${waiting} waiting on a dependency` : ''}`,
        fill: (names: string) => `${names} → own worktree`,
        work: 'the agents work in parallel, each in its own worktree',
        merged: (names: string) => `passed → merged into main: ${names}`,
        review: (names: string) => `3 failures in a row → human review: ${names}`,
        results: (merged: string, failed: string, review: string) =>
          [
            merged && `merged: ${merged}`,
            failed && `failed: ${failed}`,
            review && `to review: ${review}`,
          ]
            .filter(Boolean)
            .join(' · '),
        unlock: (names: string) => `unlocked: ${names}`,
      },
    },
    ...controls,
  },
  audio: {
    before: 'Before',
    after: 'After',
    steps: [
      {
        name: 'Upload',
        sub: 'web app → GPU worker',
        title: 'A recording arrives',
        what: 'You upload a voice recording in the web app. A GPU worker picks up the job, and the app shows its progress while it runs through the three stages below.',
        map: [
          'tape coming off the left reel = the recording arriving',
          'dark bars = speech · thin bars = background noise',
          'ruler = seconds',
        ],
      },
      {
        name: 'Noise removal',
        sub: 'DeepFilterNet',
        title: 'Remove the background noise',
        what: 'A neural model separates speech from noise and lowers the noise floor without touching the voice.',
        map: ['first head = DeepFilterNet', 'thinner bars behind it = less noise'],
      },
      {
        name: 'Silence trim',
        sub: 'Silero VAD',
        title: 'Find the speech, trim long silences',
        what: 'Voice activity detection finds where someone is speaking. Silences longer than the preset’s minimum are cut, keeping a margin around each phrase and 150 ms between phrases.',
        map: [
          'blade = Silero VAD',
          'faded bars = silence being cut',
          'tape closing up = the recording getting shorter',
          'dial at the front = the preset: how long a pause must be to cut it',
        ],
      },
      {
        name: 'Final pass',
        sub: 'noisereduce',
        title: 'Polish what is left',
        what: 'A last pass removes most of the remaining noise. How much depends on the preset: from 50% to 85%.',
        map: ['roller = noisereduce', 'dial at the front = the preset: how much noise to take out'],
      },
      {
        name: 'Result',
        sub: 'ready to download',
        title: 'A shorter, cleaner recording',
        what: 'The cleaned file goes back to the web app, ready to download: the voice is untouched, the noise is gone and the long pauses are shorter. Try another preset and play again to compare.',
        map: [
          'tape on the right reel = the cleaned recording',
          'readout = length before and after',
          'gentle = keeps more pauses · aggressive = shorter',
        ],
      },
    ],
    params: { silence: 'min silence', pad: 'pad' },
    fig: {
      title: 'Audio Cleaner · the pipeline',
      hint: 'Play or step · pick a preset',
      label:
        'A tape bench. A voice recording is printed as a waveform on a paper tape between two reels, over a ruler in seconds. A gantry on two rails carries three heads, one per stage of the pipeline. The first (DeepFilterNet) lowers the background noise behind it; the second (Silero VAD) finds every long silence, and the tape then closes up, keeping a margin around each phrase and 150 ms between them; the third (noisereduce) removes most of the noise that is left. A dial at the front picks the preset.',
      keys: {
        raised: 'Speech on the tape',
        dim: 'Background noise and the silences that get trimmed',
        lit: 'The stage at work',
      },
      caption:
        'Audio Cleaner runs three stages on a GPU worker: DeepFilterNet removes background noise, Silero VAD detects speech so long silences can be trimmed, and noisereduce takes a final pass. The preset values are the repository’s own (presets.py). The recording is synthetic and silent; its timing and the trim follow the real rules.',
      say: {
        waiting: 'waiting for a recording · press play',
        arrive: (seconds: string) =>
          `upload · a ${seconds} s voice recording with background noise`,
        denoise: 'noise removal · DeepFilterNet lowers the noise floor',
        detect: (silence: number) => `speech detection · Silero VAD finds silences ≥ ${silence} ms`,
        trim: (pad: number) => `silence trim · keeps ${pad} ms around each phrase + 150 ms between`,
        polish: (reduction: number) =>
          `final pass · noisereduce removes ${reduction}% of what is left`,
      },
    },
    ...controls,
  },
  contact: {
    title: "Let's talk",
    description:
      'If you have an open role, write to me. My code is public and my CV is one click away.',
    cv: 'Download CV (PDF)',
    email: 'Email me',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
};

export type Content = typeof en;
