## Intro
Example of control plane based on BigConfig to manage EKS.

``` sh
# Add the control plane as tool to Clojure
clojure -Ttools install big-config/control-plane-eks '{:git/sha "abc" :git/url "https://github.com/amiorin/big-config.git"}' :as eks

# Development mode
clojure -Ttools install big-config/control-plane-eks '{:local/root "."}' :as eks

# Print the help of the control plane cli
clojure -Teks help

# Alias
alias eks="clojure -Teks"
```
