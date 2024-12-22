#!/bin/zsh

source ~/.zshrc

# Go to the repository root (or wherever git is initialized)
cd "$(git rev-parse --show-toplevel)"

# Get the oldest non-committed or non-staged file in dist/data/
file_info=$(git ls-files --others --exclude-standard dist/data/ | xargs -I {} stat --format="%W %s %n" {} | sort -n | head -n 1)
birth_time=$(echo "$file_info" | cut -d' ' -f1)
size=$(echo "$file_info" | cut -d' ' -f2)
humansize=$(numfmt --from=auto --to=iec $size)
file_name=$(echo "$file_info" | cut -d' ' -f3-)
hash=$(echo "$file_name" | sed -E 's|dist/data/([a-f0-9_]+)\.json|\1|')

git add "$file_name"
git commit -m "$hash ($humansize)"
git push

notify-send "pushed data file ($humansize)"
echo "PUSHED $file ($humansize)"
