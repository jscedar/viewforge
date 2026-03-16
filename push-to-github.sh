#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# push-to-github.sh  —  initialise ViewForge and push to GitHub
#
# Usage:
#   chmod +x push-to-github.sh
#   ./push-to-github.sh YOUR_GITHUB_USERNAME viewforge
#
# Prerequisites:
#   - git installed
#   - GitHub CLI (gh) installed and authenticated  OR
#     a Personal Access Token set as GITHUB_TOKEN env var
# ─────────────────────────────────────────────────────────────

set -e

GITHUB_USER="${1:-YOUR_USERNAME}"
REPO_NAME="${2:-viewforge}"
REMOTE="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo ""
echo "▶ ViewForge → GitHub"
echo "  User: ${GITHUB_USER}"
echo "  Repo: ${REPO_NAME}"
echo "  URL:  ${REMOTE}"
echo ""

# ── 1. Init git ──────────────────────────────────────────────
if [ ! -d ".git" ]; then
  git init
  echo "✓ git init"
fi

git add .
git commit -m "feat: initial ViewForge — visual JSON data view builder

- Pipeline canvas (drag-and-drop nodes: join, filter, map, aggregate, groupby, sort, output)
- Builder view (hierarchical JSON block editor, bidirectional sync with pipeline)
- Nested source explorer with recursive tree, search, drag-to-canvas
- Dataset Sets: orders + customers + workers with matching IDs
- 5 sample views with nested output schemas
- DSL generation + code gen (JS / Kotlin / Python / SQL)
- Live pipeline execution with nested preview renderer
- Pure static app — zero dependencies, zero build step"

echo "✓ committed"

# ── 2. Create repo on GitHub ────────────────────────────────
if command -v gh &>/dev/null; then
  echo "→ Creating repo via GitHub CLI..."
  gh repo create "${GITHUB_USER}/${REPO_NAME}" \
    --public \
    --description "Visual JSON data view builder — pipeline canvas + JSON block editor with DSL and code generation" \
    --source=. \
    --remote=origin \
    --push
  echo "✓ pushed via gh CLI"

elif [ -n "${GITHUB_TOKEN}" ]; then
  echo "→ Creating repo via API token..."
  curl -s -X POST \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"${REPO_NAME}\",\"description\":\"Visual JSON data view builder — pipeline canvas + JSON block editor\",\"private\":false}" \
    > /dev/null
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
  git branch -M main
  git push -u origin main
  echo "✓ pushed via token"

else
  echo ""
  echo "⚠  No GitHub CLI or GITHUB_TOKEN found."
  echo "   Create the repo manually at https://github.com/new"
  echo "   Then run:"
  echo ""
  echo "     git remote add origin ${REMOTE}"
  echo "     git branch -M main"
  echo "     git push -u origin main"
  echo ""
fi

echo ""
echo "✅ Done!  https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "   To run locally:"
echo "     cd ${REPO_NAME} && npx serve . --port 3000"
echo "   Or just open index.html in your browser."
echo ""
