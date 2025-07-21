---
{"dg-publish":true,"dg-path":"Tech/Useful Linux Terminal.md","permalink":"/tech/useful-linux-terminal/","noteIcon":null}
---

#linux #reference #tech #cli
## Shortcut Keys
* `ctrl + R` = reverse search through history
* `ctrl + L` = clear screen
* `ctrl + U` = clear line
* `ctrl + W/K` = clear before/after cursor 
* `ctrl + A/E` = jump to begin/end of line
* `esc + .` = argument of the last command
* `ctrl + X + E` = open current line in text editor
## Commands
### Find and replace in a previous command
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
### List processes with ports open
```
sudo netstat -tulnp
```
### [Human readable CSV output](https://www.stefaanlippens.net/pretty-csv.html)
Input doesn't need to be file, ie. `sort` instead of `cat`
```
cat data.csv | column -t -s -n, | less -S
```
BSD/MacOS column does not support -n argument, so:
```
cat data.csv | sed 's/,/ ,/g' | column -t -s, | less -S
```
## Useful Utilities
### ncdu
ncurses disk usage analyzer - scans all directories in the path and shows a list sorted by size
