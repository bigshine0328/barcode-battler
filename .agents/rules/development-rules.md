# チーム共通開発規約 (development-rules.md)

## 1. 共通行動原則
- **成果物のドキュメント化**: 成果物はチャット内に出力するだけでなく、`docs/` ディレクトリ配下にMarkdown形式で保存する。
- **無駄なトークン消費の抑制**: 過去の対話履歴を長文で復唱せず、必要最小限の差分・成果物リンク・判定結果を出力する。
- **Human-in-the-Loop 制御**: 各フェーズのレビューが完了した後は、必ずユーザー（Human）へ報告し、「承認」が得られるまで次のフェーズの作業を開始しない。

## 2. ドキュメント配置ルール
- 要件定義書: `docs/PRD.md`
- UI/UXデザイン仕様書: `docs/UI_Design.md`
- 要件レビュー結果: `docs/Requirements_Review.md`
- コードレビュー結果: `docs/Code_Review.md`
- 受け入れ試験報告書: `docs/QA_Report.md`
- リリース完了報告書: `docs/Release_Report.md`
- プロジェクト進捗表: `docs/project-status.md`
