/* Estimating the difficulty that a player will encounter solving a puzzle is
   tricky but important.  In order to get some subjective information about
   how hard puzzles are, the player is asked "how hard was that puzzle?" after
   solving a puzzle, and is given a selection of emoji indicating five levels
   of difficulty.  This table, `ReportedDifficulties`, stores these survey
   results, along with which puzzle was solved and how long was taken to solve
   it. */
create table if not exists ReportedDifficulties(
    Puzzle             text not null,     /* 27 chars, see kasuba/puzzles.js */
    BeginIso8601       text not null,     /* when the puzzle was started */
    EndIso8601         text not null,     /* when the puzzle was solved */
    ActiveMilliseconds integer not null,  /* time spent displaying puzzle,
                                             because the player might minimize
                                             it and come back to it later */
    ReportedDifficulty integer not null,  /* 1 to 5, 5 being the hardest */
    GameInstanceKey    text not null      /* RFC 4122 version 4 (random) UUID
                                             generated each time the app is
                                             opened from scratch, or, in the
                                             future, every time browser local
                                             storage is cleared */
);
