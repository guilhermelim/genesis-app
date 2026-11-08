#!/bin/sh

set -eu

repositoryRoot=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
temporaryRepository=$(mktemp -d "${TMPDIR:-/tmp}/genesis-hook-test.XXXXXX")
fakeBin=$(mktemp -d "${TMPDIR:-/tmp}/genesis-hook-bin.XXXXXX")

cleanup() {
  rm -rf "$temporaryRepository"
  rm -rf "$fakeBin"
}

trap cleanup EXIT

git -C "$temporaryRepository" init --quiet
git -C "$temporaryRepository" config user.email "hook-test@example.com"
git -C "$temporaryRepository" config user.name "Hook Test"
cp "$repositoryRoot/.husky/pre-commit" "$temporaryRepository/pre-commit"
chmod +x "$temporaryRepository/pre-commit"

if ! (cd "$temporaryRepository" && ./pre-commit); then
  echo "pre-commit should pass when no files are staged." >&2
  exit 1
fi

printf 'initial\n' > "$temporaryRepository/example.txt"
git -C "$temporaryRepository" add example.txt
git -C "$temporaryRepository" commit --quiet -m "initial"
printf 'staged\n' > "$temporaryRepository/example.txt"
git -C "$temporaryRepository" add example.txt
printf 'unstaged\n' >> "$temporaryRepository/example.txt"

if (cd "$temporaryRepository" && ./pre-commit); then
  echo "pre-commit should reject partially staged files." >&2
  exit 1
fi

git -C "$temporaryRepository" restore --staged example.txt

cat > "$fakeBin/npm" <<'EOF'
#!/bin/sh
case "${HOOK_TEST_FAIL_STAGE:-}" in
  npm|test:staged) exit 1 ;;
esac
exit 0
EOF
cat > "$fakeBin/npx" <<'EOF'
#!/bin/sh
case "${HOOK_TEST_FAIL_STAGE:-}" in
  npx) exit 1 ;;
esac
exit 0
EOF
cat > "$fakeBin/prettier" <<'EOF'
#!/bin/sh
case "${HOOK_TEST_FAIL_STAGE:-}" in
  prettier) exit 1 ;;
esac
exit 0
EOF
cat > "$fakeBin/eslint" <<'EOF'
#!/bin/sh
case "${HOOK_TEST_FAIL_STAGE:-}" in
  eslint) exit 1 ;;
esac
exit 0
EOF
chmod +x "$fakeBin"/*

printf 'staged\n' > "$temporaryRepository/source file.ts"
git -C "$temporaryRepository" add "source file.ts"
printf 'preserve this file\n' > "$temporaryRepository/untracked file.txt"

if ! (cd "$temporaryRepository" && PATH="$fakeBin:$PATH" ./pre-commit); then
  echo "pre-commit should pass with staged and untracked files." >&2
  exit 1
fi

if [ ! -f "$temporaryRepository/untracked file.txt" ] ||
  [ "$(cat "$temporaryRepository/untracked file.txt")" != "preserve this file" ]; then
  echo "pre-commit did not restore the untracked file." >&2
  exit 1
fi

run_failure_case() {
  stage=$1
  printf '%s\n' "$stage" > "$temporaryRepository/failure file.ts"
  git -C "$temporaryRepository" add "failure file.ts"
  printf 'restore after %s\n' "$stage" > "$temporaryRepository/failure untracked.txt"

  if (cd "$temporaryRepository" && HOOK_TEST_FAIL_STAGE="$stage" PATH="$fakeBin:$PATH" ./pre-commit); then
    echo "pre-commit should fail when $stage fails." >&2
    exit 1
  fi

  if [ ! -f "$temporaryRepository/failure untracked.txt" ]; then
    echo "pre-commit did not restore untracked files after $stage failure." >&2
    exit 1
  fi

  rm "$temporaryRepository/failure untracked.txt"
  git -C "$temporaryRepository" restore --staged "failure file.ts"
  rm "$temporaryRepository/failure file.ts"
}

run_failure_case prettier
run_failure_case eslint
run_failure_case npx
run_failure_case npm

rm "$temporaryRepository/untracked file.txt"
git -C "$temporaryRepository" restore example.txt

printf 'delete me\n' > "$temporaryRepository/delete-me.txt"
git -C "$temporaryRepository" add delete-me.txt
git -C "$temporaryRepository" commit --quiet -m "add file to delete"
rm "$temporaryRepository/delete-me.txt"
git -C "$temporaryRepository" add -u delete-me.txt

if ! (cd "$temporaryRepository" && PATH="$fakeBin:$PATH" ./pre-commit); then
  echo "pre-commit should validate deletion-only commits." >&2
  exit 1
fi

echo "pre-commit smoke tests passed."
