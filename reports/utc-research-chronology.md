# 研究與來源的 UTC 日期比較

部分 chronology guard 直接用 `timestamp.slice(0,10)`，得到的是時間戳文字中的當地日期。帶時區且跨 UTC 午夜時，會接受尚未到知識 cutoff 的 review，或誤拒絕已在合法 UTC 日期取得的來源。

純記憶體重現：來源 date 為 2026-01-01，retrieved_at 為 `2026-01-01T00:30:00+14:00`；實際取得 UTC 日是 2025-12-31，原 canonical validator 仍接受。另一個 identity dossier 的 as-of 是 10/3，但 review `2026-10-03T00:30:00+14:00` 位於 UTC 10/2，原 guard 也接受。相反方向的負時區可導致合法資料被拒絕。

新增共用 utcDay helper，在 date-time schema 驗證後使用 `new Date(value).toISOString()` 換算 UTC 日。只修正四處比較：canonical source publication／retrieval、identity dossier as-of／review、identity source publication／retrieval、research refresh as-of／review。Revenue review／TTM／freshness 已使用 UTC 日，保持原實作。原 date-only metadata 按既有 UTC 日契約比較，沒有推定發布的時／分／秒；完整 timestamp／offset 仍原封保留。

驗證：十项新增測試涵蓋正負時區、閏日、fixture／production canonical load、身份 review、來源 chronology 及 research preview 成敗／無寫入。完整 245 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。原金融公式／假設、資料與所有研究／financial artifacts 保留 hash 與重播。

子項完成，父 baseline 仍未完成。這是日期驗證修正，不會補齐來源內文、報價／股本同步、法律主體等價、TTM 可比性或個人投資管道；已記錄的 MG Stover 差異與正式 TTM null 保留。
