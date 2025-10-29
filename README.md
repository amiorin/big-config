## Intro
Example of control plane based on BigConfig.

``` sh
# Add the control plane as tool to Clojure
clojure -Ttools install big-config/control-plane '{:git/sha "cdf18cd70d53159c96b73630616d04979687b7f9" :git/url "https://github.com/amiorin/big-config.git"}' :as ctlp

# Print the help of the control plane cli
clojure -Tctlp help
```
