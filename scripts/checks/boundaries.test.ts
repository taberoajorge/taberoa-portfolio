import assert from 'node:assert/strict';
import { test } from 'node:test';
import { violations } from './boundaries.ts';

const one = (path: string, text: string) => violations([{ path, text }]);

test('models stay pure', () => {
  assert.match(
    one('src/models/ralph/model.ts', "import { useState } from 'react';")[0],
    /no React/,
  );
  assert.match(
    one('src/models/ralph/model.ts', "import { x } from '../../content';")[0],
    /nothing else/,
  );
  assert.deepEqual(one('src/models/ralph/model.ts', "import { rng } from '../rng';"), []);
});

test('iso is self-contained', () => {
  assert.equal(one('src/iso/react/draw.tsx', "import { en } from '../../content';").length, 1);
  assert.deepEqual(one('src/iso/react/draw.tsx', "import { pathOf } from '../iso-kit';"), []);
});

test('figures never reach into site or app', () => {
  assert.equal(
    one('src/figures/ralph/Figure.tsx', "import { Home } from '../../site/Home';").length,
    1,
  );
  assert.deepEqual(
    one('src/figures/ralph/Figure.tsx', "import { content } from '../../content';"),
    [],
  );
});

test('site sees only a figure component', () => {
  assert.equal(
    one('src/site/Projects.tsx', "import { RalphRig } from '../figures/ralph/rig';").length,
    1,
  );
  assert.equal(
    one('src/site/Projects.tsx', "import { Director } from '../figures/engine/director';").length,
    1,
  );
  assert.deepEqual(
    one('src/site/Projects.tsx', "import { RalphFigure } from '../figures/ralph/Figure';"),
    [],
  );
});

test('app imports only site and content', () => {
  assert.equal(
    one('src/app/(en)/page.tsx', "import { RalphFigure } from '../../figures/ralph/Figure';")
      .length,
    1,
  );
  assert.deepEqual(
    one(
      'src/app/(en)/page.tsx',
      "import { Home } from '../../site/Home';\nimport '../globals.css';",
    ),
    [],
  );
});

test('no grab-bag files', () => {
  assert.equal(one('src/site/utils.ts', '').length, 1);
  assert.equal(one('src/figures/helpers/x.ts', '').length, 1);
  assert.deepEqual(one('src/site/Hero.tsx', ''), []);
});
