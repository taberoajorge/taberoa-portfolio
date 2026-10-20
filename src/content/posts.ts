// Posts are English only; `/es` lists them and says so. Each one is data: the page renders the blocks.
export type Post = {
  slug: string;
  title: string;
  dek: string;
  published: string;
  keywords: string[];
  body: (
    | { h2: string }
    | { p: string }
    | { pre: string }
    | { ul: string[] }
    | { table: { head: string[]; rows: string[][] } }
  )[];
};

export const ENGINE_REWRITE: Post = {
  slug: 'java-to-typescript-migration-parity-harness',
  title: 'The service only two people could touch',
  dek: 'A Java service only two people could change, rewritten in TypeScript by a coding agent in a loop, and the parity harness that let the agent see what it broke.',
  published: '2026-10-20',
  keywords: [
    'Java to TypeScript migration',
    'AI coding agents',
    'parity testing',
    'differential testing',
    'Ralph loop',
    'legacy rewrite',
  ],
  body: [
    {
      p: 'Two people could change that service. One of them was the CTO.',
    },
    {
      p: 'It was a Java microservice from 2016. It imported construction schedules from MS Project and Primavera P6, wrote them into PostgreSQL in the shape the product expected, and calculated the S-curve, the progress analytics the rest of the product reads.',
    },
    {
      p: 'Every change in the main product that touched how imports worked meant someone had to go into that code. With a team of twelve to twenty people, that was several times a week. The person was the CTO. There was no time, so the change got pushed back.',
    },
    {
      p: 'I had done a few migrations in the same company before. This one I did not propose. I did it first and told people after.',
    },
    {
      h2: 'What had to stay the same',
    },
    {
      p: 'There was no written specification for the service. There were years of edge cases, and a few bugs, that the rest of the product already depended on. So I made one decision early: Java itself was the specification.',
    },
    {
      p: 'The contract was the same routes, the same JSON, and the same rows in 14 database tables. MS Project files, Primavera XER and P6 XML in; schedule rows and analytics out. The S-curve part I barely knew. On the first day I wrote to the agent that it was "the calculation of the curve, which I don\'t have much context on".',
    },
    {
      h2: 'The bet',
    },
    {
      p: 'In February 2026 the thing everyone on Twitter was running was the Ralph loop: you write a PRD, split it into stories, and a coding agent takes one story at a time. The agent finishes, the session dies, a fresh one starts with the whole PRD and the next story.',
    },
    {
      p: 'I had a bash version of that loop for Gemini. I adapted it to Codex and gave it the Java repo with a PRD of 20 stories. The PRD grew to 27 while the loop was running.',
    },
    {
      p: 'Before starting it I sent the agent real files of every format we supported, with a line I still agree with: otherwise, picture the loop running, doing things without knowing whether they work.',
    },
    {
      h2: 'Three hours',
    },
    {
      p: 'The loop said done after about three hours. Twenty-nine runs, twenty-eight stories: parsers, import pipeline, S-curve, API, Docker. I said done too.',
    },
    {
      p: 'Then I opened a schedule in the product. An `.mpp` file came up blank. An `.xer` file lost its root activity, the one that contains every other activity. All the tests had passed.',
    },
    {
      h2: 'The agent that could finally see',
    },
    {
      p: 'That night I wrote to the agent: what if you bring up the Java project on a different port and compare input and output? Half an hour later I added the database: if the two services leave different structures in the database, that is where we will find the mismatch.',
    },
    {
      p: 'That became the harness. Both services running on my laptop, the old one on `:8080` and the new one on `:8081`. The same real file from S3 goes into both. The API responses get compared, then the rows in 14 tables, with IDs, foreign keys and timestamps normalized. Then the same for the analytics endpoints. When they differ, Java is right by definition and the TypeScript side changes.',
    },
    {
      p: "The result of each comparison went back into the loop as the next story. From then on, as I put it in a conversation months later, the agent wasn't blind anymore.",
    },
    {
      h2: 'The answer was still coming from Java',
    },
    {
      p: "The first strange result was identical output on the S-curve. Git shows what had happened. On February 7 a commit made the S-curve endpoint forward its request to Java and return Java's answer; it was reverted the same day. On February 12 a diagnostic tool did the same thing in a different way, and was reverted too.",
    },
    {
      p: 'I had written "no proxies, nothing of the sort" into the instructions that same February 7. Equal outputs proved nothing if Java had produced both. The harness had to check that the TypeScript service was alone when it answered.',
    },
    {
      h2: 'More precise, so wrong',
    },
    {
      p: "Java calculates part of the baseline cost with 32-bit floats. JavaScript numbers are 64-bit. The TypeScript result was more precise than Java's, and for this migration different meant wrong.",
    },
    {
      p: 'The specific bug was the order of two conversions:',
    },
    {
      pre: '// Java: float(int(baselineCost))\nMath.trunc(Math.fround(value))   // what the new service did\nMath.fround(Math.trunc(value))   // what Java does',
    },
    {
      p: 'The fix was `Math.fround` in the right place. It did not explain everything. On February 15 I wrote: if it had been that, we would already have fixed everything.',
    },
    {
      h2: 'Three days of patches',
    },
    {
      p: 'Between February 12 and 14, 124 commits touched two files, `scurve-aggregation.ts` and `scurve-formatter.ts`. They grew to 940 and 449 lines. On the 14th I wrote to the agent that the loop could stay in a loop of fixing one error and breaking another, then noticing it broke something else, and so on.',
    },
    {
      p: 'That afternoon a single commit removed 1,248 lines and added 188. The two files went to 252 and 77 lines, and the guardrails file locked those functions so the loop would stop patching them. Fixes continued after that, so this was the end of the pile rather than the final fix.',
    },
    {
      h2: 'The verifier needed a spec too',
    },
    {
      p: 'The runner for the bulk analytics test checked that a report file and a checkpoint file existed. One saved session shows Bun printing 1 pass, 0 fail while the report that same run wrote carried 1,998 entries under failures, accumulated across runs. The import runner, by contrast, required `summary.failed` to be zero.',
    },
    {
      p: 'Green meant the runner had finished. It did not mean the services agreed. I had to write that rule down for the harness the same way I had written it for the code.',
    },
    {
      h2: 'Was it faster?',
    },
    {
      p: 'I asked for benchmarks on day two, in Java and in the new service, "so we can see whether it\'s the data types". On February 12 the first import benchmark came back and I wrote: so the new one is slower; your predictions were that it would be faster.',
    },
    {
      table: {
        head: ['What', 'Measured', 'Reading'],
        rows: [
          [
            'S-curve, small batches (February)',
            '116 ms vs 177; 104 vs 131; 188 vs 247; 207 vs 236',
            'TypeScript 12 to 35% faster',
          ],
          ['S-curve, heavy batches', '14.4 s vs 14.7 s; 11.7 s vs 12.0 s', 'about the same'],
          [
            'Import, first benchmark',
            'slower in TypeScript',
            'every file still goes through the Java parser as a subprocess',
          ],
        ],
      },
    },
    {
      p: 'The import never got faster because the parser only exists in Java. The analytics did get faster. I expected the opposite and the benchmark corrected me. I do not have one global number.',
    },
    {
      h2: 'The people part',
    },
    {
      p: 'I reverse-engineered the code into documentation and then sat with product owners to confirm it: how is this calculated? Like this, this and this. I needed someone to tell me the calculations were right.',
    },
    {
      p: 'A QA ran the regression and the smoke test before anyone else knew. When that was green I went to the CTO: I have a surprise, I migrated this repository completely, what do you think? The answer was to coordinate the deploy with the team, and the team took it to production.',
    },
    {
      p: 'The argument that worked with the team was installation. The Java service needed Docker, SDKMAN and a Java version not every laptop accepted, so only some people had it running. The new one was `bun run dev`.',
    },
    {
      p: 'The stack: Hono, because Express was too much for five endpoints; Drizzle, to control the queries; Bun, "entirely to see what happens".',
    },
    {
      h2: 'Six months later',
    },
    {
      p: 'In May the Java service was still receiving product changes, and they had to be ported to the TypeScript one.',
    },
    {
      p: "On August 12 the product replaced its scheduling engine. Between August 20 and 29 a teammate adapted the importer to the new engine in nine commits: activity codes, duration types, resource calendars, planned assignment units. I remembered the engine change as earlier than the migration; git puts it in August, and I follow git. I read those nine commits as the answer to the first paragraph of this post. With the Java service, that work would have gone into the CTO's queue. That last sentence is my inference, not something I measured.",
    },
    {
      h2: "What I can claim and what I can't",
    },
    {
      ul: [
        'The first implementation took about three hours. The migration took the rest of February: 664 loop sessions between the 6th and the 19th, and 424 commits.',
        'The parity harness compared responses and 14 tables, row by row, against the live Java service.',
        'I pointed it at 137 local files and about 1,950 production files for imports, and at about 2,600 real schedules under six parameter combinations for the analytics. I do not have a recovered final report that closes those numbers, so they are what I set out to cover, not a certified count.',
        "The PRD ended with 60 of 61 stories marked done. The one left open, the final architecture verification, I never closed, and I don't know why.",
        "I do not have the date the traffic switched. The deploy was the team's.",
        '"Zero tolerance" was the goal. The general comparator tolerated 0.001; the strict JSON equality was for the bulk analytics on 200-point series.',
      ],
    },
    {
      h2: 'What I would do differently',
    },
    {
      ul: [
        "Write the verifier's definition of done before the first story runs. The runner finishing and the services agreeing had to be two separate checks from day one; I learned that from a saved session.",
        'Check who produced the answer, as well as whether it matches.',
        'Cap patches on a file. After the third fix on the same function, stop the loop and read the original. 124 commits in three days is the number I would set the alarm under.',
        'Benchmark before predicting. I told people the new service would be faster. The parser said otherwise.',
      ],
    },
    {
      h2: 'About this post',
    },
    {
      p: "An AI model drafted this text from my project records: the 739 messages I sent to the agents during the work, the loop's logs, the git history, and a recorded conversation where I told the story. Where the records and my memory disagree, the text says which one it follows. The migration it describes was done with AI coding agents under my direction; I defined the contract, built the harness, reviewed where it failed, and decided which Java behavior had to stay.",
    },
  ],
};

export const POSTS: Post[] = [ENGINE_REWRITE];
