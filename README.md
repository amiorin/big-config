# Intro
How to avoid incidents like the one described in [Tale of 'metadpata': the revenge of the supertools](https://engineering.zalando.com/posts/2024/01/tale-of-metadpata-the-revenge-of-the-supertools.html) 

# Analysis
Reading the article we can identify two problems:
1. A validation error with `metadpata` instead of `metadata`
1. Large scale change

# Solution
A clojure project with templates implemented as functions in Clojure.

# Notes
Configuration languages don't scale, only programming languages scale.
