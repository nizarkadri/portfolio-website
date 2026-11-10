'use client';

import React from 'react';
import ChessProfile from '../../../components/ChessProfile';
import LeetCodeProfile from '../../../components/LeetCodeProfile';
import DuolingoProfile from '../../../components/DuolingoProfile';

/** The live part of the page: chess first, then the two daily habits beside it. */
const AboutClient: React.FC = () => (
  <section className="ae-section lg-wrap" aria-labelledby="ae-train-title">
    <header className="ae-head" data-sc-in>
      <h2 id="ae-train-title" className="lg-display lg-display--lg">Still in training.</h2>
      <p className="lg-body">
        Chess came first, and it still sets the standard. These numbers are live, read from Chess.com, LeetCode and
        Duolingo when this page loads.
      </p>
    </header>
    <div className="ae-train">
      <ChessProfile />
      <div className="ae-train__side">
        <LeetCodeProfile />
        <DuolingoProfile />
      </div>
    </div>
  </section>
);

export default AboutClient;
