---
{"dg-publish":true,"dg-path":"Tech/Useful Linux Commands.md","permalink":"/tech/useful-linux-commands/"}
---

#linux #reference #tech #cli
### Return to previous directory
```
cd -
```
### Re-run previous sudo command
```
sudo !!
```
### Refer to last string of previous command
```
touch /path/to/file
nano $_
```
### Create directories from list
```
xargs mkdir -p < list.txt
```
### Combine multiple files into one
```
find . -name '*.txt' -exec cat {} + >> ../combined.txt
```
