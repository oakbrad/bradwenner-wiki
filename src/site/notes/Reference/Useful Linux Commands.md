---
{"dg-publish":true,"dg-path":"Tech/Useful Linux Commands.md","permalink":"/tech/useful-linux-commands/"}
---

#linux #reference #tech #cli
### Find and replace in your previous command
Replace a string in the last matching command:
```
^find^replace
```
ex:
```
ssh 192.168.0.7
# do stuff on that server, now move on to the next...
^.7^.8
```
### Return to previous directory
```
cd -
```
### Re-run previous command with sudo
```
sudo !!
```
### Refer to last string of previous command
You can use `$_` to refer to the last string/argument. ex:
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
