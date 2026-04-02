---
name: create-task
description: Notionのタスク管理データベースに新しいタスクを登録するスキル
---

## 概要

Notionのタスク管理データベースに新しいタスクを登録する。

## 使用条件

ユーザーがタスクの追加・登録の意図を示した場合に使用する。

## トリガー例

- 「タスクを登録して」
- 「○○をやらないと」
- 「これTODOに追加して」
- 「あとでやることとして登録して」

## パラメータ

- title（必須）: タスクのタイトル
- summary（任意）: タスクの詳細説明
- priority（任意）: 優先度
  - Highest / High / Medium / Low / Lowest
- category（任意）: タスクの種類
  - 目標関連 / 実務・定常 / プロジェクト / 突発・その他
- estimated_hours（任意）: 見積時間（時間単位）

## デフォルト動作

- priority 未指定 → Medium
- category 未指定 → 突発・その他
- summary 未指定 → 空文字
- estimated_hours 未指定 → 未設定（null）

## 出力

- 作成されたタスク情報
  - タイトル
  - 概要
  - 優先度
  - カテゴリ
  - 見積時間
  - 作成結果（成功 / 失敗）
