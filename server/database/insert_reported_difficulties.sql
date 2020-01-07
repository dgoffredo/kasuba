insert into ReportedDifficulties(
    Puzzle,
    BeginIso8601,
    EndIso8601,
    ActiveMilliseconds,
    ReportedDifficulty,
    GameInstanceKey)
values(
    :puzzle,
    :beginIso8601,
    :endIso8601,
    :activeMilliseconds,
    :reportedDifficulty,
    :gameInstanceKey);
